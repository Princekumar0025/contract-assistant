# Contract Obligation and Renewal Assistant

## Overview
This application allows users to upload a contract (via text) and automatically extracts key dates, obligations, renewals, expirations, and ambiguous clauses using the Google Gemini AI model. It acts as an **information-management tool**—not legal advice.

## Features
- **AI Extraction**: Uses Gemini to analyze text and output structured JSON of parties, dates, clauses, obligations, and clarifications.
- **Review Workflow**: Users can view the extracted items, cite their source sections, and approve or reject them. Ambiguous terms generate "Clarification" items.
- **Deadlines & Reminders**: Deterministically calculates 30-day reminders for obligations with deadlines.
- **Version Tracking**: When uploading a new version (supported via backend), previous approved items are marked as `STALE`.

## Completed Scope
- Next.js frontend with modern dark aesthetics (Vanilla CSS + App Router).
- Backend APIs integrating `@ai-sdk/google` and `gemini-2.5-pro` model for structured JSON extraction.
- Database persistence using SQLite and Prisma.
- UI to upload contracts, list contracts, and individually approve/reject/resolve items.

## Setup & Deployment
1. **Requirements**: Node.js 18+
2. **Install Dependencies**: `npm install`
3. **Environment Variables**: Copy `.env.example` to `.env` and add your `GEMINI_API_KEY`.
4. **Database Setup**: `npx prisma db push`
5. **Run Locally**: `npm run dev`

### Hosting and Review Access
- This can be easily deployed to **Vercel**. Since SQLite is used, it will persist on disk in dev, but for a true serverless environment on Vercel, a Postgres database (like Vercel Postgres or Neon) should be used.
- For review purposes, running locally with `npm run dev` and SQLite is sufficient. Ensure `GEMINI_API_KEY` is set in the environment.

## Tests & Validation
- Focused behavior: Extraction distinguishes between confirmed facts and uncertain terms (`isConfirmed: false`).
- Stale tracking: If a previous contract ID is passed, old clauses are marked `STALE`. (UI can be extended to pass this explicitly).
