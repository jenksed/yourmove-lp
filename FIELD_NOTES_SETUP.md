# YourMove Field Notes — setup and activation

This branch adds a single Quiet Ink signup card that appears in context on the homepage, Journal index, every Journal article, Help Center, help articles, and Get Started page. It uses the existing `app.js` present on those pages, without iframes, a mailing database, a new framework, or a marketing popup.

**The UI is dormant until Kit is configured.** This is deliberate: a visible form that cannot collect subscribers would be misleading. No live subscriptions were made or tested as part of this branch.

## Activate using Kit (free tier)

1. Create a Kit Free account and an **inline form** named **YourMove Field Notes** with one required email field. Enable the confirmation email and leave **Auto-confirm new subscribers** off for double opt-in. Set the confirmation to explain that the subscriber will receive practical job-application advice and occasional YourMove news.
2. Verify a reply-capable sender, recommended **notes@yourmove.run**, through Zoho (an alias/forwarding mailbox is fine). Keep **support@yourmove.run** for support. Do not use **no-reply@** for a newsletter that invites replies. Configure Kit domain authentication records following its instructions, checking existing Zoho SPF/DKIM before editing DNS.
3. In Kit, open the form's **Embed → HTML** and copy the **exact form action URL**. It normally looks like `https://app.kit.com/forms/1234567/subscriptions`. Set the `kitFormAction` constant near the bottom of `public/app.js` to that URL. **Do not paste API keys or passwords into the repository**. The code only accepts an HTTPS Kit/ConvertKit forms endpoint.
4. Keep Kit's confirmation email enabled and customize its sender, subject, and post-confirmation behavior. Optionally turn off Creator Network recommendations until you want them.
5. Run `npm ci && npm run build && npm run check:blog`, inspect the actual pages at desktop and mobile widths, then exercise a real signup with an email you control. Check the Kit confirmation email, confirmed subscriber status, unsubscribe link, and any redirect. A form opening Kit in a new tab is expected: the site does **not** display a fake success message or claim an unverified delivery.
6. Only merge/deploy after the real signup has been confirmed. The subscription form is not part of app downloading or account creation. No Mailgun account is required.

## Places and constraints

- The homepage presents Field Notes before the final product CTA; the download remains primary.
- The Journal index places it after articles and before the companion link, and articles after the body but before the article actions.
- The Help Center places it near the end; individual guides get a restrained narrow-column version. Get Started places it after the install/source flow.
- One form, no name collection, no popups, no email gating. Kit stores addresses and handles consent and unsubscribe.
- The site does not track submitted addresses through its own analytics. On-site impressions/CTA behavior and Kit-confirmed subscribers are different measurements.
- The HTML form sends the browser directly to Kit over HTTPS; it does not use client-side fetch. This avoids browser CORS assumptions and avoids a backend proxy.
- Before production launch, review and publish the scoped notice at `/email-updates/privacy/` (included in this branch) and verify that the signup wording matches how the list will be used.

## Known limits

- Provider success, consent, and suppression-list behavior cannot be confirmed without a real Kit form and an end-to-end signup test.
- The currently committed empty action URL intentionally renders no subscription UI. This branch is frontend integration work, **not** a live mailing-list launch.
- If Kit's current HTML embed uses a different endpoint format or requires extra fields, use its exact supplied form contract and verify a real signup before launch; do not silently relax endpoint validation.
