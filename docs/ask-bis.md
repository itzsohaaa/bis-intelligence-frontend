# Ask BIS integration

The browser posts `{ query, top_k }` to `/api/bis/query`. The Next.js Route Handler
validates input and calls the protected backend `POST /query`. Only this server
module reads the service credentials and attaches the internal service header.
It never forwards browser headers, follows redirects, or returns upstream error bodies.
Responses are not cached. The server timeout is 90 seconds; the browser allows 100 seconds.

## Local configuration

Copy `.env.example` to `.env.local` yourself and set:

- `BIS_SERVICE_URL`: `https://bis-system-v5.bravesand-4d6fbaeb.eastasia.azurecontainerapps.io`
- `BIS_SERVICE_KEY`: the real internal service key, supplied securely by the backend owner.

Restart Next.js after configuring the environment. Do not use `NEXT_PUBLIC_` names.
`.env.local` remains ignored. `.env.example` contains blank values only.
The service base URL must use HTTPS. No credentials are needed to build the frontend.

## Contract boundaries

The frozen contract is `docs/api/openapi.json`. The frontend uses a focused subset
of QueryResponse and wraps it in `{ data, notices }` for the browser. Notices are
frontend normalization warnings, not backend fields. Optional malformed metadata
is omitted with a notice. An unreadable query/answer payload produces a safe 502.
Unknown decisions are never converted to an affirmative answer or verification.

Citations, sources, and temporal resolution have open object schemas. The evidence
components display their actual supplied keys as labeled fields, including nested
metadata, without assuming aliases for standard, clause, page, URL, or verification.
Only HTTP(S) URLs without embedded credentials become links. Text is React-escaped;
backend HTML and Markdown are not executed. Numbers are shown as supplied: the
contract does not define a confidence-score scale, so the UI does not invent percentages.

## Verification

Run `node --test tests/bis.test.mjs`, `npm run lint`,
`node node_modules/typescript/bin/tsc --noEmit --incremental false`, and `npm run build`.
Tests use synthetic data and a mocked fetch; they do not contact BIS or require a key.
Without configuration, a valid browser query should receive a clear configuration error.
Invalid JSON, empty questions, and invalid retrieval depth can also be checked locally.

A real key is needed to verify deployed backend authentication, real evidence field
shapes, retrieval latency, and answer/qualified-answer/verification-required outcomes.
Example questions are prompts only; their outcomes are not hardcoded.

This BFF does not implement user authentication or per-user rate limiting. The existing
platform shell is a frontend shell, not an access-control boundary. Deployment access
policy remains separate from this integration.
