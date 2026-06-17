+++
date = '2024-12-18T11:18:14-05:00'
draft = false
title = 'Server Sent Events (SSE) with Go Fiber'
tags = ["sse", "golang", "fiber", "http"]
+++

The internet runs on hypertext transfer protocol (HTTP). This protocol is a request-response protocol, meaning that a client sends a request to a server and the server responds with the requested data.
This is great for most use cases, but what if you want the server to send data to the client without the client requesting it?

In this scenario, a message broker such as Apache Kafka or RabbitMQ would be a good choice. But what if you wanted to keep things simple and stick to HTTP?
This is the magic of Server-Sent Events (SSE).

#### How Does It Work?
At its heart, an SSE connection is a long-lived HTTP connection. On the server side, an SSE connection simply consists of some HTTP headers.
```HTTP
'content-type': 'text/event-stream',
'cache-control': 'no-cache',
'connection': 'keep-alive'
```

The client opens a connection to the server and the server sends data to the client as soon as it is available.
```javascript
var source = new EventSource('/sse');
source.addEventListener('message', function(e) {
    console.log(e.data);
}
```

This looks deceptively simple but there are a few things to keep in mind when considering SSE:
- SSE is a unidirectional communication channel.
- Older browsers may not support SSE. In this case, check out WebSockets.
- Can only transmit UTF-8 text data.

#### SSE with Go
Now that we are up to speed with SSE, how can we implement it in Go? Typically, you would use `net/http` to create a server and handle the SSE connection.
```go
package main

import (
    "fmt"
    "net/http"
)

func main() {
    http.HandleFunc("/sse", sseHandler)
    http.ListenAndServe(":8080", nil)
}

func sseHandler(w http.ResponseWriter, r *http.Request) {
    // remember the HTTP headers we talked about earlier?
    w.Header().Set("Content-Type", "text/event-stream")
    w.Header().Set("Cache-Control", "no-cache")
    w.Header().Set("Connection", "keep-alive")
    w.Header().Set("Access-Control-Allow-Origin", "*")

    fmt.Fprintf(w, "data: Hello SSE!\n\n")
    w.(http.Flusher).Flush()
}
```

This is a simple example of how to implement SSE in Go. The `sseHandler` function is called whenever a client connects to the `/sse` endpoint.
The server sends a message to the client and flushes the response to the client. This is important as it tells the client that the server has finished sending data.

#### How can we do this in Go Fiber?
Now that we have a basic understanding of both SSE and how to (albeit simply) implement it in Go, how can we do this in [Go Fiber](https://gofiber.io/)?

Let's do a more complex example of an SSE endpoint that you would use for a notification system. In this scenario we have to keep track of the following:
- multiple clients
- multiple channels

##### Setup

Lets start by defining some structs that we will need
```go
type SseEvent struct {
	EventType string
	Data      string
	ID        string
	Time      time.Time
}
```
This is the main struct and is the core data unit that our SSE server will transmit to subscribed clients.

```go
type SseClient struct {
	channel chan SseEvent
	id      string
}
```
From the name you can probably guess that this struct represents a client. It has a channel that it listens on and an id to identify the client.

```go
type SseManager struct {
	clients    map[*SseClient]bool
	clientsMux sync.RWMutex
	eventQueue chan SseEvent
	sending    sync.Mutex
}
```
This is the big boss struct that is the central hub for all our SSE clients. Think of it like a train station where all the trains (clients) come and go.

While we're at it lets define some global variables that we will need
```go
var (
	manager     *SseManager
	managerOnce sync.Once
)
```
Manager is a [singleton](https://refactoring.guru/design-patterns/singleton) that we will use to manage all our clients. The `sync.Once` is used to ensure that the singleton is only created once.

##### The Actual Logic
Now that we have all the setup out of the way, lets get to the actual logic of our SSE server.
```go
func InitSseManager() {
	managerOnce.Do(func() {
		manager = &SseManager{
			clients:    make(map[*SseClient]bool),
			eventQueue: make(chan SseEvent, 10000), // Buffered queue for events
		}
		log.Println("SSE Manager initialized")
		go manager.processEventQueue()
	})
}
```
We need a way to initialize our SSE manager, and this is what `InitSseManager` does.
We use the `sync.Once` to ensure that the manager is only initialized once and start the manager up in a goroutine.
The `clients` map is used to keep track of all our clients and the `event queue` is a buffered channel that we will use to queue up events, 1000 events
is an arbitrary number that you can change based on your needs.

Now that the manager is ready to, well, manage, let's tell the manager what it needs to do. Our SSE manager has 4 major tasks to make sure everything runs smoothly:
- Add a client
- Remove a client
- Broadcast an event
- Process the event queue

```go
func (m *SseManager) addClient(client *SseClient) {
	m.clientsMux.Lock()
	defer m.clientsMux.Unlock()
	m.clients[client] = true
	log.Printf("New client connected. Total clients: %d", len(m.clients))
}
```
The `addClient` function is used to add a client to the manager. We use a mutex to ensure that only one client is added at a time and log the number of clients connected.

```go
func (m *SseManager) removeClient(client *SseClient) {
	m.clientsMux.Lock()
	defer m.clientsMux.Unlock()
	if _, exists := m.clients[client]; exists {
		delete(m.clients, client)
		close(client.channel)
		log.Printf("Client disconnected. Remaining clients: %d", len(m.clients))
	}
}
```
The antithesis of `addClient`, `removeClient` is used to remove a client from the manager. We use a mutex to ensure that only one client is removed at a time
and log the number of clients remaining. We have some checks to make sure the client we want to remove actually exists. We also close the client's channel to
ensure that the client is not listening anymore.


```go
func (m *SseManager) broadcastEvent(event SseEvent) {
	m.clientsMux.RLock()
	defer m.clientsMux.RUnlock()

	log.Printf("Broadcasting to %d clients", len(m.clients))
	for client := range m.clients {
		select {
		case client.channel <- event:
			log.Printf("Successfully queued message for client")
		default:
			log.Printf("Warning: Client buffer full, skipping message for client")
		}
	}
}
```
The `broadcastEvent` function is used to send an event to all clients. We use a read lock to ensure that
no clients are added or removed while we are broadcasting. We then loop through all the clients and send the event to their channels.
We use a `select` statement to ensure that we don't block if a client's channel is full.

```go
func (m *SseManager) processEventQueue() {
	for event := range m.eventQueue {
		m.sending.Lock()
		m.broadcastEvent(event)
		m.sending.Unlock()
	}
}
```
This is the final piece of the puzzle. The `processEventQueue` function is used to process the event queue. We loop through the event queue and broadcast the event to all clients.
We use a mutex to ensure that only one event is broadcast at a time.

While we're at it, lets also define a quick helper function to format our SSE messages
```go
func formatSSEMessage(event SseEvent) string {
	var message string
	if event.ID != "" {
		message += fmt.Sprintf("id: %s\n", event.ID)
	}
	if event.EventType != "" {
		message += fmt.Sprintf("event: %s\n", event.EventType)
	}
	message += fmt.Sprintf("data: %s\n", event.Data)
	return message + "\n"
}
```
This function is just a helper function to change the output of our SSE messages based on certain predefined fields.

##### The Fiber Handler
Now that we have trained our manager to do its job, let us create a Fiber handler to handle the SSE connections.
This method is pretty big so stay with me.

Lets create a function
```go
func SseHandler(c *fiber.Ctx) error {...}
```
This function is the handler for the `/sse` endpoint. We start by initializing the SSE manager and setting up the HTTP headers mentioned at the start
```go
InitSseManager()

c.Set("Content-Type", "text/event-stream")
c.Set("Cache-Control", "no-cache")
c.Set("Connection", "keep-alive")
c.Set("Transfer-Encoding", "chunked")
c.Set("Access-Control-Allow-Origin", "*")
```

next we create a `clientID` and a sse client object for the client
```go
clientID := c.Query("clientId", fmt.Sprintf("client-%d", time.Now().UnixNano()))

client := &SseClient{
	channel: make(chan SseEvent, 100),
	id:      clientID,
}
```
100 is an arbitrary number that you can change based on your needs.

While we are here lets also create a anonymous function to remove the client when the connection is closed
```go
cleanup := func() {
	manager.removeClient(client)
	close(done)
}
```

Now that we set that up lets let our manager know that we have a new client
```go
done := make(chan struct{})
manager.addClient(client)
```
The `done` channel is used to signal that the client has disconnected down the line.

The next part is a bit messy but bear with me
```go
c.Context().SetConnectionClose()

c.Context().SetBodyStreamWriter(fasthttp.StreamWriter(func(w *bufio.Writer) {
	connectEvent := SseEvent{
		EventType: "connect",
		Data:      fmt.Sprintf(`{"clientId":"%s"}`, clientID),
		Time:      time.Now(),
	}
	fmt.Fprint(w, formatSSEMessage(connectEvent))
	w.Flush()

	for {
		select {
		case event, ok := <-client.channel:
			if !ok {
				cleanup()
				return
			}

			_, err := fmt.Fprint(w, formatSSEMessage(event))
			if err != nil {
				log.Printf("Error writing to client %s: %v", clientID, err)
				cleanup()
				return
			}

			err = w.Flush()
			if err != nil {
				log.Printf("Error flushing to client %s: %v", clientID, err)
				cleanup()
				return
			}

			log.Printf("Successfully wrote message to client %s", clientID)

		case <-done:
			return
		}
	}
}))
```
WOW! That was a lot. Lets [break it down](https://tenor.com/bSN1F.gif):

The first 2 lines are used to set the connection close header and create a stream writer for the response body.
We then send a connect event to the client to let them know that they have successfully connected and flush
the response to the client.

The big for-select loop is where the actual sse event handling happens. We listen on the client's channel for events and write them to the client.
If the client's channel is closed we cleanup and return. If there is an error writing to the client we cleanup and return. If there is an error flushing to the client we cleanup and return.

If the `done` channel is closed we return. This is the signal that the client has disconnected.

It looks a lot scarier than it actually is. Don't worry, the hard part is behind us.

##### How Can We Use This?
To tie in all the code we wrote already, lets create some methods for the user to interact with our code.
```go
func PublishSseEvent(data, eventType string) {
	InitSseManager()
	event := SseEvent{
		EventType: eventType,
		Data:      data,
		ID:        uuid.New().String(),
		Time:      time.Now(),
	}

	select {
	case manager.eventQueue <- event:
		log.Printf("Queued event: %s", data)
	default:
		log.Printf("Warning: Event queue full, dropping event: %s", data)
	}
}
```
Very simply, the code above is used in our application to publish an event to the managers event queue. This event queue if you
remember is used to broadcast events to all clients.

So lets get this server running
```go
func main() {
	app := fiber.New()

	app.Get("/sse", SseHandler)

	go func() {
		for {
			data := fmt.Sprintf("Current time: %s", time.Now().Format(time.RFC3339))
			PublishSseEvent(data, "time-update")
			time.Sleep(1 * time.Second)
		}
	}()

	log.Fatal(app.Listen(":3000"))
}
```
If you're familiar with Go and Fiber the above code will look very familiar. We just create a basic Fiber app and our
sse endpoint. We then start a goroutine to publish an event every second that displays the current time.

#### Results
Lets run this server and see what happens, a simple `go run main.go` will get it started.
As soon as the server is started it starts sending SSE messages to any connected clients
```sh
2024/12/19 09:27:34 Queued event: Current time: 2024-12-19T09:27:34-05:00
2024/12/19 09:27:34 Broadcasting to 0 clients
2024/12/19 09:27:35 Broadcasting to 0 clients
2024/12/19 09:27:35 Queued event: Current time: 2024-12-19T09:27:35-05:00
2024/12/19 09:27:36 Queued event: Current time: 2024-12-19T09:27:36-05:00
2024/12/19 09:27:36 Broadcasting to 0 clients
```
Sadly, no one wants to listen to our messages but we can change that!
Running `curl http://localhost:3000/sse` lets see what our server and client do.
Our client seems to be recieving messages from the SSE server
```sh
id: 92d28b65-47bf-4d3e-bb4e-cdd2da32a309
event: time-update
data: Current time: 2024-12-19T09:31:11-05:00
```
and our server now knows there is someone listening to it
```sh
2024/12/19 09:31:57 Queued event: Current time: 2024-12-19T09:31:57-05:00
2024/12/19 09:31:57 Broadcasting to 1 clients
2024/12/19 09:31:57 Successfully queued message for client
2024/12/19 09:31:57 Successfully wrote message to client client-1734618639519412000
```

#### Conclusion
Server Sent Events are a great way to send data from the server to the client without the client requesting it.
They are simple to implement and can be a great alternative to WebSockets in some cases.
Go Fiber is a great framework for building web applications and is a great choice for implementing SSE on your own servers.
I hope this article has given you a good understanding of how to implement SSE in Go Fiber and how to use it in your own applications.


#### Sources
- [1] https://html5doctor.com/server-sent-events/
- [2] https://medium.com/@rian.eka.cahya/server-sent-event-sse-with-go-10592d9c2aa1
- [3] https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
