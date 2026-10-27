# Authentic product captures

Captured October 27, 2026 from the local **browser interface**, compiled from the committed `jenksed/yourmove-go` source at `a14e7fb17fff1bc551ef2af7b351271554fa26e3`. This is not the hackathon app or a native desktop screenshot. The source was exported with `git archive` into `/private/tmp/yourmove-wave5-product`; the original application checkout and its uncommitted work were untouched.

`go build` and `go test ./...` passed for the isolated source. A new workspace under `/private/tmp/yourmove-wave5-data` held fictional data only. The run used loopback port 3005. No AI provider was used, no employer form was filled, and no application was submitted or falsely recorded as completed.

- `posting-review.png`: the actual job description review panel; fictional text was supplied manually. This is **not evidence of automatic retrieval**.
- `resume-selection.png`: the actual selected document and change-selection controls after importing a tiny synthetic DOCX and saving it for the job.
- `record-completion.png`: the actual expanded recording control. Its confirmation checkbox is unchecked. This is **not evidence of employer submission or receipt**.
- `career-evidence.png`: the actual experience editor after fictional situation/actions/outcome data was marked reviewed through its confirmation control.
- `*-mobile.png`: the same real controls rendered at a 430px browser viewport, captured as elements at their natural 390px width. The desktop captures use a 1280px viewport. No UI was fabricated or composited into these assets.

Website captions identify provenance and fictional data. The supported/manual employer-path comparison is separately identified as an HTML illustration, not a product screenshot or live connection.
