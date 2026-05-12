
(function () {
  'use strict';

  // Get the container where widget should be inserted
  const containerId = document.currentScript?.getAttribute('data-widget-id') || 'ai-spend-audit-widget';
  const container = document.getElementById(containerId);

  if (!container) {
    console.warn(`[AI Spend Audit Widget] Container #${containerId} not found`);
    return;
  }

  // Determine base URL
  const scriptUrl = new URL(document.currentScript?.src || '');
  const baseUrl = scriptUrl.origin;

  // Create shadow DOM for style isolation
  const shadow = container.attachShadow({ mode: 'open' });

  // Create wrapper div
  const wrapper = document.createElement('div');
  wrapper.id = 'audit-widget-container';
  wrapper.style.cssText = 'all: initial; display: block; font-family: system-ui, -apple-system, sans-serif;';

  shadow.appendChild(wrapper);

  // Load and inject styles
  const styleContent = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :host {
      display: block;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      color: #1e293b;
    }

    #audit-widget-container {
      background: white;
      border-radius: 0.5rem;
      border: 1px solid #e2e8f0;
      padding: 1.5rem;
      max-width: 600px;
      margin: 0 auto;
    }

    h2 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    label {
      display: block;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }

    input[type="number"],
    select,
    textarea {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.375rem;
      font-size: 0.95rem;
    }

    input[type="number"]:focus,
    select:focus,
    textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 0.375rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #1e293b;
      color: white;
    }

    .btn-primary:hover {
      background: #0f172a;
    }

    .btn-secondary {
      background: #e2e8f0;
      color: #1e293b;
      margin-left: 0.5rem;
    }

    .btn-secondary:hover {
      background: #cbd5e1;
    }

    .success-message {
      background: #dcfce7;
      border: 1px solid #86efac;
      color: #166534;
      padding: 1rem;
      border-radius: 0.375rem;
      margin-bottom: 1rem;
    }

    .loading {
      text-align: center;
      padding: 2rem;
      color: #64748b;
    }

    .loader {
      display: inline-block;
      width: 1.2rem;
      height: 1.2rem;
      border: 0.2rem solid #e2e8f0;
      border-radius: 50%;
      border-top-color: #3b82f6;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .results {
      background: #f1f5f9;
      padding: 1.5rem;
      border-radius: 0.375rem;
      margin-top: 1.5rem;
    }

    .results h3 {
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .results-item {
      padding: 1rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
      margin-bottom: 0.75rem;
    }

    .results-item p {
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .savings {
      color: #059669;
      font-weight: 600;
    }

    .error {
      background: #fee2e2;
      border: 1px solid #fca5a5;
      color: #991b1b;
      padding: 1rem;
      border-radius: 0.375rem;
      margin-bottom: 1rem;
    }
  `;

  const style = document.createElement('style');
  style.textContent = styleContent;
  shadow.appendChild(style);

  // Create iframe to fully isolate content
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'border: none; width: 100%; height: auto;';
  iframe.sandbox.add('allow-same-origin', 'allow-scripts', 'allow-forms');
  wrapper.appendChild(iframe);

  // Initialize iframe content
  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; }
        .widget-content { background: white; }
        h2 { font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; }
        .form-group { margin-bottom: 1.25rem; }
        label { display: block; font-weight: 500; margin-bottom: 0.5rem; }
        input, select, textarea { width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 0.375rem; font-size: 0.95rem; }
        input:focus, select:focus, textarea:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        button { padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; font-weight: 500; cursor: pointer; }
        .btn-primary { background: #1e293b; color: white; }
        .btn-primary:hover { background: #0f172a; }
        .btn-secondary { background: #e2e8f0; color: #1e293b; margin-left: 0.5rem; }
        .btn-secondary:hover { background: #cbd5e1; }
        .loading { text-align: center; padding: 2rem; color: #64748b; }
        .success-message { background: #dcfce7; border: 1px solid #86efac; color: #166534; padding: 1rem; border-radius: 0.375rem; margin-bottom: 1rem; }
        .results { background: #f1f5f9; padding: 1.5rem; border-radius: 0.375rem; margin-top: 1.5rem; }
        .results h3 { font-weight: 600; margin-bottom: 1rem; }
        .results-item { padding: 1rem; background: white; border: 1px solid #e2e8f0; border-radius: 0.375rem; margin-bottom: 0.75rem; }
        .results-item p { margin-bottom: 0.5rem; font-size: 0.9rem; }
        .savings { color: #059669; font-weight: 600; }
        .error { background: #fee2e2; border: 1px solid #fca5a5; color: #991b1b; padding: 1rem; border-radius: 0.375rem; margin-bottom: 1rem; }
      </style>
    </head>
    <body>
      <div class="widget-content" id="widget-content"></div>
      <script>
        // Simple form implementation for embedded widget
        const content = document.getElementById('widget-content');
        
        // Check for cached results
        const cachedResult = localStorage.getItem('widget-audit-result');
        
        if (cachedResult) {
          try {
            const result = JSON.parse(cachedResult);
            displayResults(result);
          } catch (e) {
            showForm();
          }
        } else {
          showForm();
        }
        
        function showForm() {
          content.innerHTML = \`
            <h2>AI Spend Audit</h2>
            <p style="color: #64748b; margin-bottom: 1.5rem; font-size: 0.95rem;">
              Quick analysis of your cloud spending and tool usage
            </p>
            
            <div class="form-group">
              <label for="toolsCount">Number of tools/subscriptions:</label>
              <input type="number" id="toolsCount" min="1" max="1000" value="10" placeholder="e.g., 10">
            </div>
            
            <div class="form-group">
              <label for="monthlySpend">Total monthly spend (USD):</label>
              <input type="number" id="monthlySpend" min="0" step="100" value="5000" placeholder="e.g., 5000">
            </div>
            
            <div class="form-group">
              <label for="teamSize">Team size:</label>
              <select id="teamSize">
                <option value="1-5">1-5</option>
                <option value="6-20" selected>6-20</option>
                <option value="21-50">21-50</option>
                <option value="50+">50+</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="email">Email (for detailed report):</label>
              <input type="email" id="email" placeholder="your@email.com">
            </div>
            
            <button class="btn-primary" onclick="submitAudit()">Analyze Spending</button>
            <button class="btn-secondary" onclick="clearResults()">Clear Results</button>
          \`;
        }
        
        function displayResults(result) {
          const recommendations = result.recommendations || [];
          const totalSavings = recommendations.reduce((sum, r) => sum + r.estimatedSavings, 0);
          
          content.innerHTML = \`
            <div class="success-message">
              ✓ Analysis complete! Potential savings identified.
            </div>
            
            <h2 style="color: #059669;">Monthly Savings: \\\$\\\${totalSavings}</h2>
            
            <div class="results">
              <h3>Recommendations (\\${recommendations.length})</h3>
              \${recommendations.map((rec, idx) => \`
                <div class="results-item">
                  <p><strong>\\\${idx + 1}. \\\${rec.toolName}</strong></p>
                  <p>\\\${rec.reason}</p>
                  <p class="savings">\\\$\\\${rec.estimatedSavings}/month potential savings</p>
                </div>
              \`).join('')}
            </div>
            
            <button class="btn-primary" onclick="showNewAudit()">Run New Audit</button>
          \`;
        }
        
        function submitAudit() {
          const toolsCount = parseInt(document.getElementById('toolsCount').value);
          const monthlySpend = parseInt(document.getElementById('monthlySpend').value);
          const teamSize = document.getElementById('teamSize').value;
          const email = document.getElementById('email').value;
          
          const widget = document.getElementById('widget-content');
          widget.innerHTML = '<div class="loading"><div class="loader"></div><p>Analyzing your spending...</p></div>';
          
          // Send to API
          fetch('${baseUrl}/api/audit/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tools: Array.from({length: toolsCount}, (_, i) => ({name: \`Tool \\\${i+1}\`, monthlyCost: monthlySpend / toolsCount})),
              teamSize,
              totalMonthlySpend: monthlySpend,
              email
            })
          })
          .then(r => r.json())
          .then(data => {
            localStorage.setItem('widget-audit-result', JSON.stringify(data));
            displayResults(data);
          })
          .catch(err => {
            widget.innerHTML = '<div class="error">Error analyzing data. Please try again.</div>';
            showForm();
          });
        }
        
        function showNewAudit() {
          localStorage.removeItem('widget-audit-result');
          showForm();
        }
        
        function clearResults() {
          localStorage.removeItem('widget-audit-result');
          location.reload();
        }
      </script>
    </body>
    </html>
  `);
  iframeDoc.close();

  // Responsively resize iframe
  function resizeIframe() {
    try {
      const height = iframeDoc.documentElement.scrollHeight;
      iframe.style.height = (height + 20) + 'px';
    } catch {
      // Ignore cross-origin errors
    }
  }

  iframe.onload = function () {
    resizeIframe();
    const observer = new MutationObserver(resizeIframe);
    try {
      observer.observe(iframeDoc.body, { childList: true, subtree: true, attributes: true });
    } catch {
      // Fallback to periodic check
      setInterval(resizeIframe, 500);
    }
  };

  // Wait for iframe to load
  if (iframe.contentDocument?.readyState === 'loading') {
    iframe.onload = resizeIframe;
  } else {
    resizeIframe();
  }
})();
