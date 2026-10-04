# Submission Remarks: Contract Obligation and Renewal Assistant

## Overview
This repository contains the complete implementation of the **Contract Obligation and Renewal Assistant**, built in adherence to all requested specifications. The application serves strictly as an information-management tool for processing legal contracts and organizational policies without rendering automated legal advice.

## Technical Architecture
- **Frontend & Framework**: Next.js 15 (App Router), React, TypeScript.
- **Styling**: Custom modern CSS incorporating glassmorphism and dynamic dark mode aesthetics (Tailwind excluded as per strict constraints).
- **Backend & Database**: Next.js Server Actions and API Routes, backed by Prisma ORM and SQLite for robust persistence and version control tracking.
- **AI Integration**: Implemented via `@ai-sdk/google` using the Gemini 2.5 Pro model. Structured JSON generation (`zod`) guarantees predictable outputs and strict schema adherence.

## Completed Scope & Features
1. **Intelligent Extraction**: Deterministically identifies contracting parties, effective/expiry dates, clauses (Termination, Renewal, Notice), and specific obligations.
2. **Ambiguity Resolution Engine**: Extracts ambiguous terms while strictly marking them as uncertain (`isConfirmed: false`), automatically generating clarification questions for human review.
3. **Review & Approval Workflow**: Interactive dashboard permitting human reviewers to verify, approve, or reject extracted AI items. Features a dynamic "Reviewed Contract Summary" upon full approval.
4. **Version Control & Stale Tracking**: Seamlessly handles new contract version uploads, accurately preserving history and flagging prior approved items as `STALE`.
5. **Deterministic Calculations**: Hardcoded programmatic generation of 30-day reminder dates for obligations, decoupling standard date math from the LLM.
6. **Policy Cross-Referencing**: Supports optional uploading of organizational policy texts to cross-reference against the core contract.

## Excluded Scope (As Requested)
- Electronic signatures, OCR, payment processing, external calendar integrations, and automated legal recommendations have been explicitly excluded.

## Test Account & Reviewer Inputs
- **Test Credentials**: No authentication walls have been placed on the local environment to facilitate seamless reviewer access.
- **API Setup**: The `.env` file requires a valid `GEMINI_API_KEY`. If run locally without a key, a mocked delay and AI fallback response will automatically trigger to demonstrate UI workflows without requiring AI credits.

## Verification & Deployment
- The code has been locally tested and validated for deterministic persistence using Prisma Studio.
- **Hosting Instructions**: To deploy this application to production (e.g., Vercel), swap the Prisma provider from `sqlite` to `postgresql` in `schema.prisma`, inject the Postgres `DATABASE_URL` and `GEMINI_API_KEY` into the deployment environment, and run `npx prisma db push`.
