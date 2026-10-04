"use client";

import { useTransition } from 'react';
import { updateItemStatus } from '@/app/actions';

export default function ReviewItem({
  id,
  contractId,
  model,
  status,
  title,
  description,
  sourceSection,
  isConfirmed,
}: {
  id: string;
  contractId: string;
  model: 'Clause' | 'Obligation' | 'Clarification';
  status: string;
  title: string;
  description: string;
  sourceSection?: string | null;
  isConfirmed?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleStatusUpdate = (newStatus: string) => {
    startTransition(() => {
      updateItemStatus(contractId, model, id, newStatus);
    });
  };

  const getStatusBadge = () => {
    switch(status) {
      case 'APPROVED': return <span className="badge badge-success">Approved</span>;
      case 'REJECTED': return <span className="badge badge-danger">Rejected</span>;
      case 'STALE': return <span className="badge badge-warning">Stale (Check new version)</span>;
      case 'RESOLVED': return <span className="badge badge-success">Resolved</span>;
      default: return <span className="badge badge-info">Needs Review</span>;
    }
  };

  return (
    <div className={`card mb-4 ${status === 'STALE' ? 'opacity-75' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-semibold text-lg flex items-center gap-2">
            {title}
            {isConfirmed === false && <span className="badge badge-warning">Uncertain</span>}
          </h4>
          {sourceSection && <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">Source: {sourceSection}</span>}
        </div>
        <div>{getStatusBadge()}</div>
      </div>
      
      <p className="mb-4 text-gray-300">{description}</p>
      
      <div className="flex gap-2">
        {model === 'Clarification' ? (
          status !== 'RESOLVED' && (
            <button 
              className="btn btn-secondary text-sm" 
              onClick={() => handleStatusUpdate('RESOLVED')}
              disabled={isPending}
            >
              Mark Resolved
            </button>
          )
        ) : (
          status !== 'APPROVED' && status !== 'REJECTED' && (
            <>
              <button 
                className="btn btn-primary text-sm" 
                onClick={() => handleStatusUpdate('APPROVED')}
                disabled={isPending}
              >
                Approve
              </button>
              <button 
                className="btn btn-danger text-sm" 
                onClick={() => handleStatusUpdate('REJECTED')}
                disabled={isPending}
              >
                Reject
              </button>
            </>
          )
        )}
      </div>
    </div>
  );
}
