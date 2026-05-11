/**
 * Audit route group
 * Contains the audit form and results
 */

import { ReactNode } from 'react';

export default function AuditLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-12">{children}</div>
    </div>
  );
}
