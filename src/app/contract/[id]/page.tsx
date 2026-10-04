import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ReviewItem from '@/components/ReviewItem';
import { format } from 'date-fns';

export default async function ContractReviewPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      clauses: true,
      obligations: true,
      clarifications: true
    }
  });

  if (!contract) return notFound();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="card">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{contract.title}</h1>
            <p className="text-gray-400 mb-4">Version {contract.version} • Status: <span className={`badge ${contract.status === 'REVIEWED' ? 'badge-success' : 'badge-warning'}`}>{contract.status}</span></p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 mt-6 p-4 bg-gray-900/50 rounded-lg">
          <div>
            <span className="text-sm text-gray-400 block">Parties</span>
            <span className="font-semibold">{contract.parties || 'Not identified'}</span>
          </div>
          <div>
            <span className="text-sm text-gray-400 block">Effective Date</span>
            <span className="font-semibold">{contract.effectiveDate ? format(new Date(contract.effectiveDate), 'PPP') : 'Not identified'}</span>
          </div>
          <div>
            <span className="text-sm text-gray-400 block">Expiry Date</span>
            <span className="font-semibold">{contract.expiryDate ? format(new Date(contract.expiryDate), 'PPP') : 'Not identified'}</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Extracted Clauses</h2>
            {contract.clauses.length === 0 ? <p className="text-gray-400">No key clauses found.</p> : null}
            {contract.clauses.map(clause => (
              <ReviewItem
                key={clause.id}
                id={clause.id}
                contractId={contract.id}
                model="Clause"
                status={clause.status}
                title={`${clause.type} Clause`}
                description={clause.content}
                sourceSection={clause.sourceSection}
              />
            ))}
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Obligations & Deadlines</h2>
            {contract.obligations.length === 0 ? <p className="text-gray-400">No obligations found.</p> : null}
            {contract.obligations.map(obs => (
              <ReviewItem
                key={obs.id}
                id={obs.id}
                contractId={contract.id}
                model="Obligation"
                status={obs.status}
                title={obs.deadline ? `Deadline: ${format(new Date(obs.deadline), 'PPP')}` : 'Obligation'}
                description={`${obs.responsibleParty ? `[${obs.responsibleParty}] ` : ''}${obs.description}`}
                sourceSection={obs.sourceSection}
                isConfirmed={obs.isConfirmed}
              />
            ))}
          </section>
        </div>

        <div>
          <section className="sticky top-24">
            <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2 text-warning-color">Clarifications Needed</h2>
            {contract.clarifications.length === 0 ? (
              <div className="card bg-success-color/10 border-success-color/20">
                <p className="text-success-color">No ambiguous terms identified! The AI is confident in all extractions.</p>
              </div>
            ) : null}
            {contract.clarifications.map(clar => (
              <ReviewItem
                key={clar.id}
                id={clar.id}
                contractId={contract.id}
                model="Clarification"
                status={clar.status}
                title="Ambiguity Question"
                description={clar.question}
                sourceSection={clar.clauseReference}
              />
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
