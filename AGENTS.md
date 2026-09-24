<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
---

# BIS Intelligence Platform — Project Rules

## Project

This repository contains the frontend for the SIH26107 BIS Intelligence Platform.

The product is an evidence-grounded BIS intelligence platform for Indian Standards, applicability, QCOs, certification, testing, laboratories, hallmarking, and related BIS services.

The conversational assistant is an entry point, not the entire product.

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- App Router
- shadcn/ui where appropriate
- Lucide Icons
- Framer Motion where useful

## Backend Contract

The frozen backend API specification is:

`docs/api/openapi.json`

Always inspect this file before implementing or modifying BIS API integration.

Do not invent API endpoints, response fields, or backend capabilities.

## Security

Never expose `X-Internal-Service-Key` in browser-side code.

Required architecture:

Browser → Next.js server-side route/BFF → BIS backend

Only server-side code may attach the BIS internal service key.

Never commit:
- `.env.local`
- API keys
- passwords
- tokens
- secrets

## BIS Query Decisions

The current serialized `decision` values are exactly:

- `answer`
- `qualified_answer`
- `verification_required`

Do not use historical uppercase values.

## Trust Rules

Never fabricate:

- Indian Standards
- QCOs
- mandatory/voluntary status
- certification schemes
- clauses
- laboratories
- evidence
- citations

If the backend reports insufficient evidence or verification required, show that state clearly.

Never convert uncertainty into certainty.

## Evidence

Evidence is a first-class part of the UI.

Preserve available fields such as:

- standard number
- year
- clause
- table
- page
- document ID
- excerpt
- source URL
- verification state

Preserve BIS identifiers exactly as returned by the backend.

## Architecture

Keep these concerns separate:

- UI components
- API types
- API services
- server-side BIS proxy
- pages/layouts
- feature logic

Do not put large API calls directly inside visual components.

Prefer small reusable TypeScript components.

## Backend Features Not Yet Guaranteed

Do not pretend these are live until supported by the API contract:

- Product → Standard
- Why-this-standard reasoning
- QCO decisioning
- Certification scheme selector
- Certification workflow
- Laboratory finder
- Full hallmarking intelligence
- Hindi conversational output
- Product Compliance Passport
- Amendment intelligence

UI may be prepared for them, but do not fake working backend functionality.

## Design Direction

The UI should feel:

- modern
- premium
- trustworthy
- technical
- clean
- evidence-focused

Avoid making it look like:

- a generic chatbot
- a boring government portal
- a generic SaaS template

Use consistent visual treatment for states including:

- Verified
- Mandatory
- Voluntary
- Active
- Superseded
- Confidence levels
- Verification Required
- Insufficient Evidence
- Source Unavailable
- System Error

Do not communicate important status using color alone.

## Coding Rules

- Use TypeScript.
- Avoid `any` where practical.
- Keep components reusable.
- Validate external API responses defensively.
- Handle loading, success, empty, partial, verification-required, and error states.
- Maintain responsive layouts.
- Preserve accessibility.
- Avoid unnecessary dependencies.
- Do not refactor unrelated code during feature work.
- Never modify the backend contract from the frontend.

## Before Completing a Task

When practical:

1. Run TypeScript checks.
2. Run ESLint.
3. Confirm the project builds.
4. Check that no secret was committed.
5. Summarize changed files.
6. State any backend assumptions.

Do not claim functionality has been tested unless it actually has been.