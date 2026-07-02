+++
date = '2026-07-02T00:00:00-05:00'
draft = false
title = "Giving an AI memory without letting it hoard"
tags = ["ai", "memory", "architecture", "backend"]
+++

The first version of the assistant was pure prompt stuffing which is like the universally agreed upon starting point for anyone building anything with an LLM, u grab whatever context is lying around and cram it into the system prompt and then u pray, and it works fine right up until somebody actually expects the assistant to remember something from a week ago, at which point the whole thing falls apart cuz the prompt isnt memory, its a sticky note u slide across the desk one time. So I had to actually build memory into it, and this is where I think most ppl building assistants get it really wrong, cuz "give the assistant memory" sounds like one feature and its actually four features stacked in a trenchcoat, and if u treat it as one thing u end up with an assistant that remembers ur coffee order and forgets ur deadlines and honestly thats basically what the first pass looked like for me too so i cant even be smug about it.

## Three paths not one

The core thing I got wrong for way too long was doing recall and write on the same code path, which sounds fine in theory until u realize they have completely different latency budgets and completely different failure modes and completely different levels of how much u should trust the thing calling them, and once i finally split them into their own separate paths the whole system stopped feeling cursed. What I ended up with is basically three:

1. **Prompt-time recall** which runs before every model call, pulls relevant memories for the current workspace, formats them into a lil block and stuffs them into the system prompt, its meant to give continuity and thats it, its not supposed to be a dumping ground.
2. **Signal-gated writes** which is my way of saying the model doesnt get to write to memory, it just emits a structured signal that means "hey this might be worth remembering" and then the app looks at that signal and decides whether it actually cares, cuz letting the model decide what to persist is how u end up with a database full of random pleasantries.
3. **Async ingestion** which runs completely outside the chat request cuz there is zero reason the user should be waiting on extraction and merge logic, the chat path just stores message IDs and enqueues a job, a worker picks it up later and does the real work when nobody is watching.

Recall stays sync and fast, extraction and persistence are async and can retry as much as they want, and honestly if u try to jam both jobs into the same request path ur just building future pain for urself, i promise.

## Memory has to be scoped or its gonna betray u

The first hill I will die on is that every single memory operation needs an explicit scope, no exceptions, no defaults, no "we'll add it later," cuz a memory about one workspace can never ever touch another workspace and user-level preferences live in a completely different namespace from entity-level facts and this sounds so obvious when u type it out but the default behavior of literally any storage layer is basically "cool just throw it in a table lol" and if u do that with memory eventually somebody's context is gonna show up in someone else's session and its gonna be a really bad tuesday.

```ts
// scope on every read. scope on every write. no defaults.
memory.recall({ scope: { workspace, entity }, query })
memory.write({ scope: { workspace, entity }, fact, confidence })
```

Scope isnt like a nice-to-have metadata field on the row, its literally the primary key in my head, and if ur writing a memory row without one u've already shipped a bug u just havent found it yet, which is the worst kind of bug.

## The model does not get to be the DB writer

The other hill i will die on is that the model suggests and the app decides, always, no matter how tempting it is to just let the model dump straight to storage cuz its faster to write, cuz the second u let the model own the write path memory becomes this untraceable black box where u cant explain why anything is in there and u cant audit it and u cant repro why a specific bad write happened, and thats a debugging nightmare i wouldnt wish on anyone. When the app owns the writes it means every memory in the store has a reason it exists that lives in code u can grep for, which is boring and unsexy and its the difference between a memory system u can actually maintain and one u just kinda hope keeps behaving.

## Not every conversation deserves memory

The default answer should be no. Most turns should just die at the end of the conversation and never become memory, and this took me embarrassingly long to internalize cuz the shiny instinct is obviously to extract from every turn like ur building some kinda perfect archive, but that instinct is genuinely terrible, its expensive its noisy and it slowly poisons ur signal-to-noise ratio until recall starts actively hurting the model more than it helps, so what actually survives is a pretty small set of things - durable prefs, hard constraints, prior decisions, recurring workflows, contextual facts about the entity - and everything else, current tasks and one-off math and transient Q&A and low-confidence guesses, none of that survives past the turn. A memory system that remembers everything ends up remembering nothing useful which is a bad trade.

## Async or the chat path is gonna suffer

My first extraction implementation was running during the chat request cuz it was the fastest thing to build, and it worked, and it was also awful in every measurable way, chat felt slow, errors during extraction became errors in the response, retries basically werent possible without the user seeing weird half-states, and the second i moved to an outbox pattern i felt physically better as a person.

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

Chat commits IDs and a scope and thats the entire chat-side contract, the worker hydrates the job on its own time and does extraction and dedupe and merge and finally writes, and if extraction fails the worker just retries, and if the worker is down for an hour chat still works and the queue just backs up harmlessly which is exactly how it should be. This kinda decoupling is legitimately the thing i wish somebody had told me to do on day one, it fixes so many downstream problems u didnt even know u had yet.

## Deleting is way harder than adding, sorry

"Forget this" is not a one-liner, its a whole ceremony, cuz when the model says forget X the app has to actually go find a matching memory and check similarity against a threshold and apply the mutation and then verify the change actually happened, and if u skip the verify step u've built a liar, which is not a small deal, cuz an assistant that says "yep i forgot it" while the memory is still sitting in the store is worse than one that just refuses to try in the first place. If ur delete path is like three lines of code u probably havent thought about it long enough.

## Stuff i wish someone had yelled at me about on day one

- split recall and write immediately, dont wait til chat feels slow
- give scope its own type so u literally cannot construct a memory op without it, do not rely on urself to remember
- model suggests, app decides, forever, no exceptions ever
- reject aggressively, small sharp store > giant noisy store, every single time
- async everything that is not on the response path, everything
- build the delete path before u actually need it cuz u will need it very soon and u will regret waiting

## Anyway

The kinda funny thing about building memory for an assistant is that almost none of the actually hard problems are model problems, theyre boring database problems and boring queue problems and boring access control problems wearing a wig and pretending to be AI problems, and the model itself is honestly the easiest part of the whole stack, its always been the easiest part, everyone just wants to pretend its the hard part cuz thats the fun bit to talk about.
