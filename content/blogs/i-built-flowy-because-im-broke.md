+++
date = '2026-06-18T00:00:00-05:00'
draft = false
title = "I built Flowy because I'm broke"
tags = ["swift", "macos", "local-first", "flowy"]
+++

Flowy started cuz I'm broke. I wanted Wispr Flow cuz typing is for losers, but I didn't want to pay 15 dollars EVERY month just to do fancy dictation. My Mac already does speech-to-text. Offline. For free. So why am I renting it back from a startup that ships my voice to a server and bills me monthly for the privilege.

So I built my own. Three weeks later it works. And along the way I learned the actual speech-to-text is the easy part. That part Apple basically hands you. Everything wrapped around it is where the pain lives.

## Permissions are half the app

Flowy needs three permissions before it can do anything: mic, Speech Recognition, and Accessibility (the one that lets it type into other apps). Mic and Speech are chill. Accessibility is the problem child. macOS won't even prompt for it, you have to walk into System Settings and flip a toggle yourself like it's 2009. And then it goes STALE every time you rebuild the app. So you grant it, everything works, you ship a new build, and now Flowy has a permission it has on paper and not in reality.

So you can't check once and trust it. You check every time, because Apple decided the answer is allowed to silently change on you.

```swift
func canTypeIntoOtherApps() -> Bool {
    AXIsProcessTrusted() // ask again. always. trust nothing.
}
```

If Accessibility is gone, Flowy doesn't just eat your sentence. It dumps the text on your clipboard and tells you what happened. A dictation app that loses what you just said has no reason to exist.

## Apple's live transcripts lie to you

You'd think live dictation is simple. Words come in, you stick them on the end, done. Nope. Apple's partial transcripts restart, rewrite stuff from four words ago, repeat chunks, and hand you a phrase then a different version of the same phrase a second later because the recognizer changed its mind.

A partial result isn't "the new words." It's "my best guess at everything so far," and it's allowed to mutate whenever it wants. So if you just append every partial you don't get a transcript, you get "the the quick brown brown fox."

The whole core of Flowy is the boring logic that fixes this. Is this actually new text? Did the recognizer reset? Am I about to duplicate words, or delete words the user is literally looking at right now? Get it wrong and you either stutter or you reach back in time and delete what someone just watched themselves say. Nobody forgives either one.

## The real work is deciding where the text goes

Okay, you have clean text. You're still not done. Now you have to put it somewhere without ruining someone's day. Type into the wrong window and your dictation lands in a group chat. Naively paste and you nuke whatever they spent 30 seconds copying. Blindly type into a focused field and you can fire someone's PASSWORD into a visible box.

So Flowy notices secure fields and just refuses.

```swift
guard !context.isSecureTextField else { return } // we do not type into password fields. ever.
```

Speech-to-text gives you text. The actual product is deciding where that text is allowed to land.

## Local-first owns, and you pay for it

Going local-first on Apple's Speech stack is just correct. No server, no monthly bill, no privacy paragraph because there's no privacy story, the audio never leaves your machine. That's not a feature, that's just the absence of a crime.

The catch is you inherit the entire OS. Your app now depends on speech availability, locale, mic devices, three twitchy permissions, and whatever Apple quietly changed last update without telling anyone. You're not coding against a clean API, you're coding against an operating system that has moods. Still worth it. Not close.

## The boring part is the part that makes it real

For v1 I didn't add features, I chased trust, and trust is made of stuff nobody claps for. The app ships unsigned, so there's a right-click-to-open dance the README and site and onboarding all have to explain. And the version number has to say 1.0.0 in like six places (app, DMG, GitHub release, site, updater, release notes) or people quietly decide you're an amateur. They'd be right.

Nobody will ever read my transcript logic. Everyone notices when the updater says one version and the app says another.

## Anyway

Flowy is free, offline, open source, and it exists because I refused to pay 15 dollars a month for something my laptop already does. The funny part is the speech recognition was never the hard bit. The hard bit was the permissions that rot, the transcripts that lie, and deciding where text is allowed to go.

Your voice shouldn't have to leave your machine just to become text. I'd do it again out of spite.

Written using Flowy, obviously. [tryflowy.co](https://tryflowy.co)
