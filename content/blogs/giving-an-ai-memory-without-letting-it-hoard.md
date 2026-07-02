+++
date = '2026-07-02T00:00:00-05:00'
draft = false
title = "Giving an AI memory without letting it hoard"
tags = ["ai", "memory", "architecture", "backend"]
+++

The first version of the assistant was pure prompt stuffing. Gather whatever context you had lying around, jam it into the system prompt, hope the model behaved. It worked fine right up until the point somebody expected the assistant to remember something from last week. Then it fell over, because the prompt is not a memory system, it's a note you slide across the desk once.

So the assistant needed memory. The problem is that "give the AI memory" is one of those requests that sounds like one feature and is actually four, and if you build them as one feature you end up with an assistant that remembers your lunch order and forgets your deadline.

## Three paths, not one

The thing I got wrong at first was treating recall and write as the same code path. They are not. They have completely different latency budgets, completely different failure modes, and completely different trust models. Once I split them, the design got a lot less stupid.

The system ended up with three separate paths:

1. **Prompt-time recall.** Before each model run, fetch relevant memories for the active workspace and inject a small, formatted block into the system prompt. Continuity, not a landfill.
2. **Signal-gated writes.** The model does not write memory. It emits a structured "hey, this might be worth remembering" signal. The app decides whether that signal is actually worth acting on.
3. **Async ingestion.** Extraction and persistence run outside the chat request. The chat path stores message IDs, queues a job, returns. A background worker does the real work later.

Recall is fast and synchronous. Extraction is slow, retryable, and out of the critical path. Trying to make one thing do both jobs is how you end up debugging a "why did the chat freeze" ticket at 11pm.

## Memory has to be scoped or it will betray you

Rule one: every memory operation has an explicit scope. A fact about one workspace never touches another. User-level preferences live in a different namespace from entity-level facts. This sounds obvious. It is not. The default of any storage layer is "just put it in a table," and if you do that with memory you will eventually leak someone's context into somebody else's session, and there is no good day to explain that in a postmortem.

```ts
// every read and every write carries a scope. no exceptions.
memory.recall({ scope: { workspace, entity }, query })
memory.write({ scope: { workspace, entity }, fact, confidence })
```

The scope is not metadata. It's the primary key. If you find yourself writing a memory row without a scope, stop, because you're about to build a bug that will only show up in production.

## The model is not the DB writer

Rule two: the model is allowed to suggest, not decide. It emits a signal, the app runs the validation. Confidence threshold, memory type, scope, dedupe against what's already there. Only then does anything get enqueued.

The reason for this is boring and important. If the model writes to the store directly, memory becomes a black box. You can't audit it, you can't reason about why something got saved, and you definitely can't reproduce a bad write. When the app owns the write path, every memory has a reason it exists, and that reason lives in code you can grep.

## Not every conversation deserves memory

Rule three: the default answer is no. Most turns should not become memory. Current tasks, one-off calculations, transient Q&A, raw structured records, low-confidence signals — all rejected. What survives: durable preferences, constraints, prior decisions, recurring workflows, relationship and contextual facts.

The early instinct is to extract from every turn. That instinct is wrong. It's expensive, it's noisy, and it produces a memory store where the signal-to-noise ratio slowly collapses until recall starts hurting the model more than helping it. Memory that remembers everything is memory that remembers nothing useful.

## Async or the chat path suffers

The first extraction implementation ran during the chat request. Chat felt sluggish. Errors during extraction became errors in the response. Retries were impossible without user-visible weirdness. I moved it to an outbox and never looked back.

```ts
// chat path — fast, boring, always the same shape
await messages.save(turn)
await memory.enqueue({ scope, turnIds: [turn.id] })
return response

// worker — anywhere else, later
const job = await memory.dequeue()
const facts = await extract(job)
await memory.upsertOrMerge(facts)
```

Chat commits IDs and metadata. That's it. The worker hydrates the job, extracts facts, dedupes, merges, writes. If extraction fails, the worker retries. If the worker is down for an hour, chat still works. This is the kind of decoupling you never regret.

## Deleting memory is harder than adding it

Rule four: "forget this" is not a simple operation. If the model says forget X, the app searches for a matching memory, checks similarity against a threshold, applies the mutation, and then verifies the change actually took effect. Because if the assistant confidently confirms it forgot something and the memory is still there, you have built a liar.

Verification isn't optional. A memory system that says "done" without checking is worse than one that just refuses.

## What I'd tell someone starting

If I were building this again from scratch:

- Split recall and write on day one. Don't wait until chat is slow to notice.
- Give scope its own type. Make it impossible to construct a memory operation without one.
- Let the model suggest, never decide. The app is the source of truth.
- Reject aggressively. A small, sharp memory store beats a giant, noisy one every time.
- Async everything that isn't in the response path. Outbox pattern, retries, dead letter, the whole thing.
- Build the delete path before you need it. Trust me.

## Anyway

The interesting thing about building memory for an assistant is that almost none of the hard problems are model problems. They are database problems, queue problems, and access control problems wearing a trench coat.

The model is the easy part. It always was.
