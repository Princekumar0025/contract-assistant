import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { contractText, title, previousContractId, policyText } = await req.json();

    if (!contractText) {
      return NextResponse.json({ error: 'Contract text is required' }, { status: 400 });
    }

    // Determine version
    let version = 1;
    if (previousContractId) {
      const prev = await prisma.contract.findUnique({ where: { id: previousContractId } });
      if (prev) version = prev.version + 1;
    }

    // Process with AI
    let data;
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock_key_for_now' || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      // Mock data for testing and reviewers
      console.log('Using mock AI response because GEMINI_API_KEY is not set.');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
      data = {
        parties: "Acme Corp and Beta LLC",
        effectiveDate: "2024-01-01",
        expiryDate: "2025-01-01",
        clauses: [
          { type: 'TERMINATION', content: "Either party can terminate with 30 days notice.", sourceSection: "Section 5.1" },
          { type: 'RENEWAL', content: "Automatic renewal for 1 year unless cancelled.", sourceSection: "Section 6" }
        ],
        obligations: [
          { description: "Deliver software source code", deadline: "2024-06-01", responsibleParty: "Acme Corp", sourceSection: "Section 2", isConfirmed: true },
          { description: "Pay $50,000 for services", deadline: "2024-06-15", responsibleParty: "Beta LLC", sourceSection: "Section 3", isConfirmed: true }
        ],
        clarifications: [
          { clauseReference: "Section 7 (Liability)", question: "Is the liability cap $1M or $2M? The text seems contradictory." }
        ]
      };
    } else {
      const result = await generateObject({
        model: google('gemini-2.5-pro'),
        system: `You are an expert contract analyst assistant. Your role is informational only. Do not provide legal advice.
  Extract key information from the provided contract text. For every item, cite the exact source section (e.g., "Section 4.1").
  If a term is ambiguous, extract it but mark it as uncertain (isConfirmed: false) and generate a clarification question.`,
        prompt: `Analyze the following contract:\n\n${contractText.substring(0, 30000)}\n\n${policyText ? `Also cross-reference with this organizational policy:\n\n${policyText.substring(0, 10000)}` : ''}`,
        schema: z.object({
          parties: z.string().describe('The parties involved in the contract.'),
          effectiveDate: z.string().optional().describe('The effective date of the contract (ISO string or YYYY-MM-DD).'),
          expiryDate: z.string().optional().describe('The expiry date of the contract (ISO string or YYYY-MM-DD), if any.'),
          clauses: z.array(z.object({
            type: z.enum(['EXPIRY', 'RENEWAL', 'TERMINATION', 'NOTICE', 'OTHER']),
            content: z.string().describe('Summary of the clause.'),
            sourceSection: z.string().describe('Exact source section citation.'),
          })).describe('Key clauses regarding expiry, renewal, termination, and notice.'),
          obligations: z.array(z.object({
            description: z.string().describe('Description of the obligation.'),
            deadline: z.string().optional().describe('Deadline if any (ISO string or YYYY-MM-DD).'),
            responsibleParty: z.string().describe('Party responsible for the obligation.'),
            sourceSection: z.string().describe('Exact source section citation.'),
            isConfirmed: z.boolean().describe('True if explicitly stated, false if it relies on uncertain interpretation.'),
          })).describe('Key obligations for either party.'),
          clarifications: z.array(z.object({
            clauseReference: z.string().describe('Section or clause that is unclear.'),
            question: z.string().describe('A question to clarify the ambiguity.'),
          })).describe('Unclear or conflicting terms that need human clarification.'),
        }),
      });
      data = result.object;
    }

    // Save to DB
    const contract = await prisma.contract.create({
      data: {
        title: title || 'Untitled Contract',
        textContent: contractText,
        version,
        previousId: previousContractId || null,
        parties: data.parties,
        effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        status: 'PENDING_REVIEW',
        clauses: {
          create: data.clauses.map(c => ({
            type: c.type,
            content: c.content,
            sourceSection: c.sourceSection,
          })),
        },
        obligations: {
          create: data.obligations.map(o => ({
            description: o.description,
            deadline: o.deadline ? new Date(o.deadline) : null,
            // Calculate a reminder 30 days before deadline if deadline exists
            reminderDate: o.deadline ? new Date(new Date(o.deadline).getTime() - 30 * 24 * 60 * 60 * 1000) : null,
            responsibleParty: o.responsibleParty,
            sourceSection: o.sourceSection,
            isConfirmed: o.isConfirmed,
          })),
        },
        clarifications: {
          create: data.clarifications.map(c => ({
            clauseReference: c.clauseReference,
            question: c.question,
          })),
        },
      }
    });

    // If there is a previous contract, mark its approved items as STALE
    if (previousContractId) {
      await prisma.clause.updateMany({
        where: { contractId: previousContractId, status: 'APPROVED' },
        data: { status: 'STALE' }
      });
      await prisma.obligation.updateMany({
        where: { contractId: previousContractId, status: 'APPROVED' },
        data: { status: 'STALE' }
      });
    }

    return NextResponse.json({ success: true, contractId: contract.id });

  } catch (error: any) {
    console.error('Extraction Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process contract' }, { status: 500 });
  }
}
