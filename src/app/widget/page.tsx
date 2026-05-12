'use client';

import { useState } from 'react';

export default function WidgetPage() {
  const [showEmbed, setShowEmbed] = useState(false);

  const widgetId = 'ai-spend-audit-widget';
  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const embedCode = `<script async src="${appUrl}/widget.js" data-widget-id="${widgetId}"></script>
<div id="${widgetId}"></div>`;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900">AI Spend Audit Widget</h1>
          <p className="mt-2 text-xl text-slate-600">
            Embed the audit form directly on your website
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Embed Preview */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Live Preview</h2>
            <div className="bg-white rounded-lg border shadow-sm p-6 min-h-96">
              <h3 className="text-lg font-semibold mb-3">AI Spend Audit</h3>
              <p className="text-sm text-slate-600 mb-4">Quick analysis of your cloud spending and tool usage</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Number of tools/subscriptions:</label>
                  <input type="number" placeholder="e.g., 10" className="w-full px-3 py-2 border rounded-md" defaultValue="10" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Total monthly spend (USD):</label>
                  <input type="number" placeholder="e.g., 5000" className="w-full px-3 py-2 border rounded-md" defaultValue="5000" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Team size:</label>
                  <select className="w-full px-3 py-2 border rounded-md">
                    <option>1-5</option>
                    <option selected>6-20</option>
                    <option>21-50</option>
                    <option>50+</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Email (for detailed report):</label>
                  <input type="email" placeholder="your@email.com" className="w-full px-3 py-2 border rounded-md" />
                </div>
                
                <button className="w-full px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-700 font-medium">
                  Analyze Spending
                </button>
              </div>
            </div>
          </div>

          {/* Embed Code */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Installation</h2>
            <div className="space-y-4">
              <p className="text-slate-700">
                Copy and paste this code into your HTML to embed the audit form:
              </p>

              <div className="relative bg-slate-900 rounded-lg p-4 text-sm font-mono text-slate-100 overflow-auto max-h-40">
                <code>
                  {embedCode.split('\n').map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(embedCode);
                    alert('Embed code copied to clipboard!');
                  }}
                  className="absolute top-2 right-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                >
                  Copy
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Lightweight script injection</li>
                  <li>✓ No dependencies on your site</li>
                  <li>✓ Isolated styling (no conflicts)</li>
                  <li>✓ Audit results sent to your email</li>
                  <li>✓ Results also displayed in widget</li>
                </ul>
              </div>

              {!showEmbed && (
                <button
                  onClick={() => setShowEmbed(true)}
                  className="w-full px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-700 font-medium"
                >
                  Show HTML Structure
                </button>
              )}

              {showEmbed && (
                <div className="bg-slate-50 border rounded-lg p-4 text-sm">
                  <p className="font-semibold text-slate-900 mb-2">HTML for your page:</p>
                  <pre className="text-xs bg-white p-2 rounded border overflow-auto">
{`<!-- Place this where you want the widget to appear -->
<div id="ai-spend-audit-widget"></div>

<!-- Add this script at the end of body -->
<script async src="${appUrl}/widget.js"><\/script>`}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-lg border p-8">
          <h2 className="text-2xl font-semibold mb-4">FAQ</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900">Can I customize the appearance?</h3>
              <p className="text-slate-700 mt-2">
                The widget uses a default style that matches this site. Custom styling is available for premium plans.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Is my data secure?</h3>
              <p className="text-slate-700 mt-2">
                Yes. All data stays encrypted and is only used for audit analysis. We don&apos;t share your information.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">What if my site uses a different tech stack?</h3>
              <p className="text-slate-700 mt-2">
                The widget is framework-agnostic. It works with vanilla HTML, React, Vue, Angular, or any other framework.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
