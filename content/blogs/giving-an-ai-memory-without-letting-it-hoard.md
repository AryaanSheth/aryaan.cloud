+++
date = '2026-07-02T00:00:00-05:00'
draft = false
title = "Giving an AI memory without letting it hoard"
tags = ["ai", "memory", "architecture", "backend"]
+++

First version of the assistant was pure prompt stuffing. Grab whatever context was around, dump it into the system prompt, hope for the best. That was fine until somebody asked it to remember something from last week and it obviously couldn't cuz the prompt isn't a memory system, its just a note you hand over one time and then its gone.

So I had to build memory. And "give the AI memory" sounds like one feature but its actually like four features in a trench coat and if u build it as one thing u end up with an assistant that remembers ur lunch order and forgets your deadline. Which is what I did the first time. Anyway.

## Three paths, not one

The thing I got wrong early on was doing recall and write on the same code path. Bad idea. Recall needs to be fast cuz it runs before every model call. Write can be slow cuz nobody's waiting on it. Once I split them the whole thing got way less painful to reason about.

Ended up with three paths:

1. **Prompt-time recall.** Before the model runs, pull relevant memories for the current workspace, format them into a small block, jam it into the system prompt. Just enough context to have continuity, not a landfill.
2. **Signal-gated writes.** Model doesn't write to memory directly. It emits a lil structured signal that basically says "hey this might be worth remembering." Then the app decides if it actually cares.
3. **Async ingestion.** Extraction happens outside the chat request. Chat path just saves message IDs and queues a job. Worker picks it up later and does the actual work.

Recall is sync and fast. Write is async and can retry. Trying to jam both into the chat path is how u end up debugging why chat is slow at 11pm on a saturday.

## Memory has to be scoped or it will betray you

Rule one: every memory op has a scope. A memory from one workspace never leaks into another. User-level prefs live in a different namespace from entity-level facts. Sounds obvious rn but the default behavior of any storage layer is basically "throw it in a table lol" and if u do that with memory eventually somebody's context is gonna show up in someone else's session and that is not a fun postmortem.

```ts
// scope on every read. scope on every write. no exceptions.
memory.recall({ scope: { workspace, entity }, query })
memory.write({ scope: { workspace, entity }, fact, confidence })
```

Scope isn't metadata for me, its the primary key. If ur writing a memory row w/o a scope u've already shipped a bug, u just haven't seen it yet.

## The model doesn't get to write

Rule two: model suggests, app decides. It fires off a signal, the app runs validation. Confidence threshold check, memory type check, scope check, dedupe against whats already in there. Only then does anything actually get queued.

Reason for this is boring but important. If the model writes straight to the store, memory becomes this black box where u can't explain why anything is in there. Cant audit it, cant repro a bad write, cant tell what actually happened when something goes weird. Whereas if the app owns the write path, every memory has a reason it exists and that reason lives in code u can grep.

## Not every conversation deserves memory

Rule three: default is no. Most turns shouldn't become memory. Current tasks, one-off math, random Q&A, structured records, low-confidence signals - none of that survives. What does survive: durable prefs, constraints, prior decisions, recurring workflows, contextual stuff about the entity.

Early instinct is to just extract from every turn. Real bad instinct tbh. Expensive, noisy, and eventually u have a memory store where the signal-to-noise is so bad that recall is actively making the model worse. A memory system that remembers everything doesn't really remember anything useful, if that makes sense.

## Async or the chat path pays

First extraction impl ran during the chat request. Chat felt sluggish. Errors during extraction became errors in the response. Retries were basically impossible w/o the user seeing weird stuff. Moved it to an outbox pattern and haven't looked back.

```ts
// chat path — fast, boring, always the same shape
await messages.save(turn)
await memory.enqueue({ scope, turnIds: [turn.id] })
return response

// worker — somewhere else. later. nobody's waiting.
const job = await memory.dequeue()
const facts = await extract(job)
await memory.upsertOrMerge(facts)
```

Chat commits IDs and thats it. Worker hydrates the job, extracts, dedupes, merges, writes. Extraction fails? Worker retries. Worker's down for an hour? Chat still works. This kinda decoupling is the one thing I'd tell anyone to do first.

## Deleting is harder than adding

Rule four: "forget this" isn't a one-liner. Model says forget X, app searches for a matching memory, checks similarity against a threshold, applies the mutation, then verifies the change actually took effect. Cuz if the assistant tells the user "yep i forgot it" and the memory is still sitting there u've built a liar and thats prob worse than never having memory at all.

Verifying isn't optional. A memory system that says "done" w/o checking is worse than one that just refuses to try.

## Stuff I'd actually do first if starting over

- split recall and write on day one, dont wait
- give scope its own type so u literally cannot construct a memory op w/o one
- model suggests, app decides. always
- reject aggressively, small sharp store > giant noisy store
- async everything not on the response path
- build the delete path early, u will need it sooner than u think

## Anyway

Weird thing about building memory for an assistant is that almost none of the hard problems are model problems. Theyre database problems and queue problems and access control problems w/ a wig on.

The model is the easy part honestly. It always was.
