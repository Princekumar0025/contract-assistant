"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateItemStatus(
  contractId: string, 
  model: 'Clause' | 'Obligation' | 'Clarification', 
  id: string, 
  status: string
) {
  if (model === 'Clause') {
    await prisma.clause.update({ where: { id }, data: { status } });
  } else if (model === 'Obligation') {
    await prisma.obligation.update({ where: { id }, data: { status } });
  } else if (model === 'Clarification') {
    await prisma.clarification.update({ where: { id }, data: { status } });
  }

  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: { clauses: true, obligations: true, clarifications: true }
  });
  
  if (contract) {
    const allClausesDone = contract.clauses.every((c: any) => c.status !== 'EXTRACTED');
    const allObligationsDone = contract.obligations.every((o: any) => o.status !== 'EXTRACTED');
    const allClarificationsDone = contract.clarifications.every((c: any) => c.status !== 'UNRESOLVED');
    if (allClausesDone && allObligationsDone && allClarificationsDone) {
      await prisma.contract.update({
        where: { id: contractId },
        data: { status: 'REVIEWED' }
      });
    }
  }

  revalidatePath(`/contract/${contractId}`);
}
