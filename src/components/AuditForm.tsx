'use client';

import { useState, useEffect } from 'react';
import { AITool } from '@/lib/audit/types';

const STORAGE_KEY = 'audit-tools';
const TOOLS_LIST = ['Cursor', 'GitHub Copilot', 'Claude', 'ChatGPT', 'Vertex AI', 'OpenAI API', 'Gemini', 'Windsurf'] as const;
const PLANS = ['free', 'pro', 'enterprise'] as const;
const USAGE_FREQUENCIES = ['daily', 'weekly', 'monthly', 'rare'] as const;
const TEAM_SIZES = ['solo', 'small', 'medium', 'large'] as const;

interface FormState {
  teamSize: 'solo' | 'small' | 'medium' | 'large';
  tools: AITool[];
  useCases: string;
}

type Plan = typeof PLANS[number];
type Usage = typeof USAGE_FREQUENCIES[number];

type NewToolState = {
  name: string;
  currentPlan: Plan;
  usageFrequency: Usage;
  monthlySpend: number;
};

export default function AuditForm({ onSubmit }: { onSubmit: (data: FormState) => void }) {
  const defaultState: FormState = {
    teamSize: 'small',
    tools: [],
    useCases: '',
  };

  const [formState, setFormState] = useState<FormState>(defaultState);
  const [isHydrated, setIsHydrated] = useState(false);

  const [newTool, setNewTool] = useState<NewToolState>({
    name: TOOLS_LIST[0],
    currentPlan: 'pro',
    usageFrequency: 'daily',
    monthlySpend: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Hydrate from localStorage once on client, and save on subsequent changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormState(JSON.parse(saved) as FormState);
      }
    } catch {
      // ignore parse errors
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formState));
    } catch {
      // ignore serialization errors
    }
  }, [formState]);

  const validateNewTool = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!newTool.name) {
      newErrors.name = 'Tool name is required';
    }

    if (newTool.monthlySpend === undefined || newTool.monthlySpend < 0) {
      newErrors.spend = 'Monthly spend must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addTool = () => {
    if (!validateNewTool()) return;

    const tool: AITool = {
      id: `${newTool.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name: newTool.name,
      currentPlan: newTool.currentPlan,
      monthlySpend: newTool.monthlySpend || 0,
      usageFrequency: newTool.usageFrequency,
    };

    setFormState((prev) => ({
      ...prev,
      tools: [...prev.tools, tool],
    }));

    // Reset form
    setNewTool({
      name: TOOLS_LIST[0],
      currentPlan: 'pro',
      usageFrequency: 'daily',
      monthlySpend: 0,
    });
    setErrors({});
  };

  const removeTool = (id: string) => {
    setFormState((prev) => ({
      ...prev,
      tools: prev.tools.filter((t) => t.id !== id),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formState.tools.length === 0) {
      setErrors({ tools: 'Please add at least one tool' });
      return;
    }

    onSubmit({
      ...formState,
      tools: formState.tools,
    });
  };

  const totalSpend = formState.tools.reduce((sum, tool) => sum + tool.monthlySpend, 0);

  // Defer rendering until hydration is complete to prevent hydration mismatch
  if (!isHydrated) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="bg-slate-100 rounded-lg p-8 animate-pulse">
          <div className="h-12 bg-slate-200 rounded mb-4" />
          <div className="h-8 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Team Size Selection */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <label className="block text-sm font-semibold text-slate-700 mb-4">
            Team Size
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TEAM_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setFormState((prev) => ({ ...prev, teamSize: size }))}
                className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  formState.teamSize === size
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Add Tool Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Add AI Tools</h3>

          <div className="space-y-4">
            {/* Tool Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tool Name
              </label>
              <select
                value={newTool.name || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewTool((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TOOLS_LIST.map((tool) => (
                  <option key={tool} value={tool}>
                    {tool}
                  </option>
                ))}
              </select>
            </div>

            {/* Monthly Spend */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Monthly Spend (USD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newTool.monthlySpend || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewTool((prev) => ({
                    ...prev,
                    monthlySpend: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 20"
              />
              {errors.spend && (
                <p className="text-red-600 text-sm mt-1">{errors.spend}</p>
              )}
            </div>

            {/* Current Plan */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Current Plan
              </label>
              <select
                value={newTool.currentPlan || 'pro'}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setNewTool((prev) => ({ ...prev, currentPlan: e.target.value as Plan }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PLANS.map((plan) => (
                  <option key={plan} value={plan}>
                    {plan.charAt(0).toUpperCase() + plan.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Usage Frequency */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Usage Frequency
              </label>
              <select
                value={newTool.usageFrequency || 'daily'}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setNewTool((prev) => ({
                    ...prev,
                    usageFrequency: e.target.value as Usage,
                  }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {USAGE_FREQUENCIES.map((freq) => (
                  <option key={freq} value={freq}>
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={addTool}
              className="w-full py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors"
            >
              Add Tool
            </button>
          </div>
        </div>

        {/* Tools List */}
        {formState.tools.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Added Tools ({formState.tools.length})
            </h3>

            <div className="space-y-3">
              {formState.tools.map((tool) => (
                <div
                  key={tool.id}
                  className="flex justify-between items-center p-4 bg-slate-50 rounded-md border border-slate-200"
                >
                  <div>
                    <p className="font-medium text-slate-900">{tool.name}</p>
                    <p className="text-sm text-slate-500">
                      {tool.currentPlan} • ${tool.monthlySpend}/mo • {tool.usageFrequency}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTool(tool.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200">
              <p className="text-sm font-medium text-blue-900">
                Total Monthly Spend: <span className="text-lg font-bold">${totalSpend.toFixed(2)}</span>
              </p>
            </div>
          </div>
        )}

        {/* Use Cases */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Primary Use Cases (optional)
          </label>
          <textarea
            value={formState.useCases}
            onChange={(e) => setFormState((prev) => ({ ...prev, useCases: e.target.value }))}
            placeholder="e.g., code generation, documentation, testing, debugging"
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        {/* Errors */}
        {errors.tools && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{errors.tools}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={formState.tools.length === 0}
        >
          Run Audit
        </button>
      </form>
    </div>
  );
}
