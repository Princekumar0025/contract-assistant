import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import UploadContractForm from '@/components/UploadContractForm';

export default async function Dashboard() {
  const contracts = await prisma.contract.findMany({
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Contracts Dashboard</h1>
          <p className="text-gray-400">Manage and review your extracted contract obligations.</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {contracts.length === 0 ? (
            <div className="card text-center p-8 text-gray-400">
              No contracts uploaded yet.
            </div>
          ) : (
            contracts.map((contract) => (
              <div key={contract.id} className="card flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{contract.title}</h3>
                  <div className="flex gap-4 text-sm text-gray-400 mt-1">
                    <span>Version {contract.version}</span>
                    <span>Status: <span className={`badge ${contract.status === 'REVIEWED' ? 'badge-success' : 'badge-warning'}`}>{contract.status}</span></span>
                  </div>
                </div>
                <Link href={`/contract/${contract.id}`} className="btn btn-primary">
                  Review
                </Link>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <div className="card sticky top-24">
          <h2 className="text-xl font-bold mb-4">Upload New Contract</h2>
          <UploadContractForm />
        </div>
      </div>
    </div>
  );
}
