# Project architecture rules

- Keep academic-year and completed-years-since-founding calculations in `src/lib/schoolDates.ts` so website pages and generated prospectuses always show consistent dates.
- Keep About Us topic content reusable in `src/components/about/` and serve each topic at its own route so navigation and page content stay aligned.
- Parse and toggle worksheet chapter selections through `src/lib/worksheetTopics.ts` using complete suggestion labels so commas within titles do not break selection.