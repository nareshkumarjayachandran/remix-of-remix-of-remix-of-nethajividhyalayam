# Project architecture rules

- Keep academic-year and completed-years-since-founding calculations in `src/lib/schoolDates.ts` so website pages and generated prospectuses always show consistent dates.
- Keep About Us topic content reusable in `src/components/about/` and serve each topic at its own route so navigation and page content stay aligned.
- Parse and toggle worksheet chapter selections through `src/lib/worksheetTopics.ts` using complete suggestion labels so commas within titles do not break selection.
- Keep Chennai panchangam calculations in `src/lib/panchangam.ts`, using Astronomy Engine and Lahiri sidereal longitudes; derive civil dates in Asia/Kolkata so visitors' timezones never change the school date.
- Format outgoing form-email timestamps through `supabase/functions/_shared/emailDates.ts` so server timezone cannot alter the school submission time.
- Keep Hostinger deployment in a single GitHub Actions workflow that builds locked dependencies and uploads only `dist/` over FTPS using repository secrets; serialize uploads to avoid overlapping production releases.
- Keep Kindle uploader identities and storage private; expose only safe catalog fields through the catalog function and issue short-lived downloads by published item ID so visitors cannot read unfinished uploads or staff details.
- Keep Tamil voice setup help in the shared Voice Reader so blogs and book reading use the same device-aware fallback without external speech services.
- Keep direct worksheet publishing in `src/lib/worksheetPublishing.ts`, using the existing private library upload service after checking protected staff roles; generate real DOCX files so the existing reader can parse them reliably.
- Map Kindle speech to explicit page/paragraph positions in `src/lib/kindleSpeech.ts` and highlight on speech start/end events, so translations, skipped lines, spreads, and full-book reading cannot drift through inferred offsets.
- Keep small-screen speech-follow scrolling in `BookPageContent` tied to the active paragraph, so stacked translations and full-screen readers follow actual speech without moving desktop pages.