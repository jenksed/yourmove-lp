---
title: "YourMove v0.3.0 Is Out: Less Hunting, Less Guessing, More Control"
seo_title: "YourMove v0.3.0: A More Useful Job Application Workspace"
description: "YourMove v0.3.0 improves opportunities, saved writing, posting status, and applicant-controlled form filling. Here's why we focused on the experience."
date: 2026-11-20
published: false
featured: false
pull_quote: "The job search doesn't end when you save a posting. The work needs to be worth coming back to."
---

**YourMove v0.3.0 is out.** And, for once, I want to talk less about everything software *could* automate and more about what makes it useful when you're actually applying for jobs.

Because here's the annoying part of a job search: you rarely do the work just once.

You save a role, choose a résumé, write a good answer, start a second application, forget which version you used for the first one, and come back three days later wondering what you were doing. Meanwhile, the employer has a completely different application form and apparently needs you to explain your employment history again. In a box. Under your résumé.

YourMove is the free, open-source Mac app I've been building to make that process less ridiculous. The first releases established a place to keep opportunities, résumé versions, answers, and application work. **v0.3.0 is about making that place easier to use — and easier to trust.**

## Fewer things demanding your attention at once

The Opportunities workspace has a clearer shape now: **Focus**, **Saved for Later**, and **History**.

That's not an attempt to invent a new productivity framework. It's a practical distinction. Some jobs need attention now. Some are worth keeping without staring at them every day. And completed or past work still matters without needing to compete with today's unfinished applications.

The lists are more compact, too. If you're importing several postings, the results are clearer about what was added, what was already there, and what needs another try. A failed import shouldn't mean guessing whether the rest made it in.

[SCREENSHOT SLOT: Published v0.3.0 Opportunities view with synthetic Focus, Saved for Later, and History records.]

## You've already written something good. You should be able to use it.

A pretty decent answer to one employer's question shouldn't vanish into the ether after you hit Save. But copying old writing blindly isn't much better. A question may sound similar and still deserve a different answer.

The updated **Questions** workspace puts editing first and makes **Previous Writing** easier to consult nearby. You can look at what you've already written, decide whether it's relevant, and adapt it for this application. If you try to leave with unsaved changes, YourMove warns you rather than silently throwing away your work.

This isn't about letting AI manufacture five versions of the same generic paragraph. It's about keeping useful work available while preserving the applicant's right to change it.

[SCREENSHOT SLOT: Published v0.3.0 Questions editor showing synthetic Previous Writing and an application-specific draft.]

## A closed job posting doesn't erase what you did

Employer websites change. A posting might close. Its availability might be uncertain. Neither situation should silently rewrite the history of what *you* prepared or submitted.

v0.3.0 makes those distinctions clearer. It can report when a posting is confirmed closed, or when availability can't be established. Your saved materials remain meaningful, and a previously recorded application stays part of your history.

The **Apply** experience is also more candid about the work that remains yours. If a cover letter needs to be attached manually, the app should say so. If a control can't be handled safely, that shouldn't become a cheerful but misleading “done.”

## Filling a form is not the same as applying for a job

This is one of the more important design decisions behind YourMove.

On eligible forms, the app can help capture questions and fill supported information. In v0.3.0, **candidate-profile fields and saved answers have separate Fill authorization**, and targeted improvements help recognize LinkedIn and website fields on certain Greenhouse forms.

But employer forms aren't all the same. Some controls need manual work; some are ambiguous; some are behind authentication or embedded in ways the app can't reliably operate. Ashby, Greenhouse, and Lever have controlled-test coverage for supported Capture and eligible Fill paths, **not a blanket promise that every form will work**.

And YourMove never presses the final employer **Submit** button for you. You inspect the application on the employer's site, decide what to send, and record completion in YourMove afterward.

That's not an accidental missing feature. I don't want software inventing an employer receipt, quietly overwriting a sensitive answer, or confusing “I filled some fields” with “you applied.”

[SCREENSHOT SLOT: Published v0.3.0 Apply view showing an explicit authorization or manual-attachment state, using a controlled synthetic employer form.]

## Why spend a release on this instead of adding more features?

Because a growing list of features is not the same thing as a product that gets easier to use.

The goal isn't to help somebody complete one impressive demo. It's to make the next application less painful than the last — and to make returning after a few days feel like continuing your own work instead of excavating it.

We're still testing that hypothesis with a limited technical alpha. I can't honestly tell you we've measured hours saved or proven the experience across every hiring site. I can tell you what we built, why we built it, and where we think the next meaningful step belongs.

## Next: what happens when somebody actually calls you back?

Today, YourMove is strongest at preparing, reviewing, and keeping a record of application work. But that's not the end of the story.

The **planned v0.4.0** direction is to connect an application in History with the next hiring commitment: an interview, some preparation, and a dated action you can find again when you return.

After that, the roadmap explores retrieving the exact résumé used for an earlier application, asking grounded questions about your own saved work in ordinary language, confirming changes before they're written, and eventually adding optional voice input. Those are **planned milestones**, not v0.3.0 features or promised delivery dates.

The order matters to me. First make the actual records and direct controls understandable. Then let natural language — and maybe speech — operate through those same boundaries. An interface that's easier to talk to shouldn't suddenly get to make decisions for you.

## Want to try v0.3.0?

[YourMove v0.3.0 is available now](/get-started/) as a **technical alpha for Apple Silicon Macs running macOS 26.0 or later**. It's free and open source, but it's early: the app is ad-hoc signed, not notarized by Apple, and installing or upgrading requires manual steps. A compatible Chrome/Chromium installation is needed for assisted employer-form operations.

Please [read the installation guidance and verify the download](/get-started/) before opening it. Existing users should back up their full YourMove workspace before replacing the app. The in-app stable update channel does **not** currently deliver v0.3.0.

If you try it, I'd rather hear about the one confusing screen or application step than get a vague “looks great.” That kind of feedback can actually make the next release better. Please leave private résumés, answers, credentials, and employer form data out of public bug reports.

**[Read the v0.3.0 release notes](/docs/releases/) · [Get the Mac technical alpha](/get-started/) · [Report a problem](https://github.com/jenksed/yourmove-go/issues/new?template=bug-report.md)**
