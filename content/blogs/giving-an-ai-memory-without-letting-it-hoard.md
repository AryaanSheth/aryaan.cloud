+++
date = '2026-07-02T00:00:00-05:00'
draft = false
title = "Giving an AI memory without letting it hoard"
tags = ["ai", "memory", "architecture", "backend"]
+++

The first version of the assistant was pure prompt stuffing, which is basically the universal starting point for anyone building anything on an LLM. U grab whatever context is lying around, cram it into the system prompt, and hope. It worked fine right up until somebody expected the assistant to actually remember something from a week ago. The prompt isnt memory, its a sticky note u hand over one time.

So I had to build real memory. And this is where I think most people get it wrong, cuz "give the assistant memory" sounds like one feature but its really like four features in a trenchcoat. If u build it as one thing u end up with an assistant that remembers ur coffee order and forgets ur deadlines. Which is what my first pass looked like tbh, so I cant even be smug about it.

## Three paths not one

The main thing I got wrong was doing recall and write on the same code path. They have completely different latency budgets and completely different failure modes, and once i split them apart the whole system stopped feeling cursed. Ended up with three paths:

1. **Prompt-time recall.** Runs before every model call, pulls relevant memories for the current workspace, formats them into a small block, injects it into the system prompt. Its meant for continuity, not for dumping every fact u ever collected.
2. **Signal-gated writes.** The model doesnt write to memory. It emits a structured signal like "hey this might be worth remembering," and the app decides whether it actually cares. Letting the model decide what to persist is how u end up with a database full of pleasantries.
3. **Async ingestion.** Runs completely outside the chat request. Chat just stores message IDs and enqueues a job, and a worker picks it up later.

Recall is sync so it can be fast, write is async so it can retry. If u try to jam both jobs into the same code path ur just building future pain for urself.

## Memory has to be scoped or its gonna betray u

The first hill i will die on is that every memory op needs an explicit scope. No exceptions, no defaults, no "we'll add it later." A memory about one workspace should never touch another workspace, and user-level prefs live in a completely different namespace from entity-level facts. This sounds obvious when u type it out, but the default of any storage layer is basically "just throw it in a table," and if u do that with memory eventually somebody's context leaks into someone else's session. Not a fun tuesday.

```ts
// scope on every read. scope on every write. no defaults.
memory.recall({ scope: { workspace, entity }, query })
memory.write({ scope: { workspace, entity }, fact, confidence })
```

Scope isnt a nice-to-have metadata field. Its the primary key in my head. If ur writing a memory row without a scope u've already shipped a bug, u just havent found it yet.

## The model does not get to be the DB writer

The other hill i will die on is that the model suggests and the app decides. Always. No matter how tempting it is to just let the model dump straight to storage cuz its less code. The second u let the model own the write path, memory becomes this untraceable black box. U cant explain why anything is in there, u cant audit it, u cant repro why a specific bad write happened.

When the app owns the writes, every memory in the store has a reason it exists that lives in code u can grep for. Its boring and unsexy, and its also the difference between a memory system u can maintain and one u kinda hope keeps behaving.

## Not every conversation deserves memory

The default answer should be no. Most turns should just die at the end of the conversation. This took me embarrassingly long to internalize cuz the shiny instinct is obviously to extract from every turn like ur building some perfect archive. Bad instinct. Its expensive, its noisy, and it slowly poisons ur signal-to-noise ratio until recall starts hurting the model more than helping.

What actually survives is a pretty small set of things — durable prefs, hard constraints, prior decisions, recurring workflows, contextual facts about the entity. Everything else dies at the turn boundary. Current tasks, one-off math, transient Q&A, low-confidence guesses, none of that gets to stay. A memory system that remembers everything ends up remembering nothing useful.

## Async or the chat path pays for it

My first extraction was running during the chat request cuz it was the fastest thing to build. It worked, and it was also awful. Chat felt slow, errors during extraction became errors in the response, retries basically werent possible without the user seeing weird half-states. I moved it to an outbox pattern and felt physically better as a person.

```ts
// chat path — fast, boring, always the same shape
await messages.save(turn)
await memory.enqueue({ scope, turnIds: [turn.id] })
return response

// worker — somewhere else. later. nobody is waiting.
const job = await memory.dequeue()
const facts = await extract(job)
await memory.upsertOrMerge(facts)
```

Chat commits IDs and a scope and thats it. The worker does the actual extraction on its own time, retries if it fails, and the whole thing keeps ticking. If the worker is down for an hour the queue just backs up and chat still works. This kind of decoupling is legit the thing i wish someone had told me to do on day one.

## Deleting is way harder than adding

"Forget this" is not a one-liner, its a whole ceremony. Model says forget X, the app searches for a matching memory, checks similarity against a threshold, applies the mutation, then verifies the change actually happened. Skip the verify step and u've built a liar. Which is not a small deal, cuz an assistant that says "yep i forgot it" while the memory is still sitting in the store is worse than one that just refuses to try.

If ur delete path is like three lines of code, u probably havent thought about it long enough.

## Stuff i wish somebody had yelled at me on day one

- split recall and write immediately, dont wait til chat feels slow
- give scope its own type so u literally cannot construct a memory op without one
- model suggests, app decides, forever
- reject aggressively, small sharp store beats a giant noisy one every single time
- async everything not on the response path
- build the delete path before u actually need it, u will need it sooner than u think

## Anyway

The funny thing about building memory for an assistant is that almost none of the hard problems are model problems. Theyre boring database problems and boring queue problems and boring access control problems in a wig, pretending to be AI problems. The model itself is honestly the easiest part of the whole stack. Everyone just wants to pretend its the hard part cuz thats the fun bit to talk about.
