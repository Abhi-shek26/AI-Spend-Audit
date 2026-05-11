/**
 * Custom hook for audit form state management
 */

import { useState, useCallback } from 'react';
import { AuditInput, AITool } from '@/lib/audit/types';

const STORAGE_KEY = 'audit_form_state';

export function useAudit() {
  const [input, setInput] = useState<AuditInput>(() => getStoredInput());

  const addTool = useCallback((tool: AITool) => {
    setInput((prev) => {
      const updated = {
        ...prev,
        tools: [...prev.tools, tool],
      };
      saveInput(updated);
      return updated;
    });
  }, []);

  const removeTool = useCallback((toolId: string) => {
    setInput((prev) => {
      const updated = {
        ...prev,
        tools: prev.tools.filter((t) => t.id !== toolId),
      };
      saveInput(updated);
      return updated;
    });
  }, []);

  const updateTool = useCallback((toolId: string, updates: Partial<AITool>) => {
    setInput((prev) => {
      const updated = {
        ...prev,
        tools: prev.tools.map((t) => (t.id === toolId ? { ...t, ...updates } : t)),
      };
      saveInput(updated);
      return updated;
    });
  }, []);

  const updateInput = useCallback((updates: Partial<AuditInput>) => {
    setInput((prev) => {
      const updated = { ...prev, ...updates };
      saveInput(updated);
      return updated;
    });
  }, []);

  const clearInput = useCallback(() => {
    setInput(getDefaultInput());
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    input,
    addTool,
    removeTool,
    updateTool,
    updateInput,
    clearInput,
  };
}

function getDefaultInput(): AuditInput {
  return {
    tools: [],
    teamSize: 'solo',
    useCases: [],
    totalMonthlySpend: 0,
  };
}

function getStoredInput(): AuditInput {
  if (typeof window === 'undefined') return getDefaultInput();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : getDefaultInput();
  } catch {
    return getDefaultInput();
  }
}

function saveInput(input: AuditInput) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(input));
}
