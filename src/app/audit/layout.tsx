import AuditLayout from '../(audit)/layout';
import type { ReactNode } from 'react';

export default function AuditLayoutProxy({ children }: { children: ReactNode }) {
  return <AuditLayout>{children}</AuditLayout>;
}
