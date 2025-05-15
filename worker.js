addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

// Use environment variables with fallbacks
const ZONE_ID = ZONE_ID || 'REPLACE_WITH_ZONE_ID';
const API_TOKEN = API_TOKEN || 'REPLACE_WITH_SCOPED_API_TOKEN'; // Will be replaced by users
const DOMAIN_NAME = DOMAIN_NAME || 'taslabs.net'; // Default domain name, REPLACE WITH YOURS

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Handle GET request for the main page
  if (request.method === 'GET') {
    return new Response(generateHTML(DOMAIN_NAME, ZONE_ID), {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
  
  // Handle POST request for purge action
  if (request.method === 'POST' && url.pathname.includes('/purge')) {
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        purge_everything: true,
      }),
    });
    
    const data = await response.json();
    
    // Return detailed information about the purge operation
    return new Response(JSON.stringify({
      success: data.success,
      details: data,
      timestamp: new Date().toISOString(),
      zone: ZONE_ID,
      domain: DOMAIN_NAME,
      action: 'purge_everything'
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
      status: data.success ? 200 : 500,
    });
  }
  
  return new Response('Not found', { status: 404 });
}

function generateHTML(domainName, zoneId) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Cloudflare Cache Purge</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 1px solid #f0f0f0;
      padding-bottom: 20px;
    }
    h1 {
      color: #f48120;
    }
    .explanation {
      background-color: #f7f7f7;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .explanation h2 {
      margin-top: 0;
    }
    .explanation code {
      background-color: #e6e6e6;
      padding: 2px 5px;
      border-radius: 3px;
      font-family: monospace;
    }
    .action-panel {
      text-align: center;
      margin-bottom: 30px;
    }
    button {
      background-color: #f48120;
      color: white;
      font-size: 18px;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    button:hover {
      background-color: #e67300;
    }
    button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    .status-log {
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 15px;
      max-height: 300px;
      overflow-y: auto;
      background-color: #f9f9f9;
    }
    .log-entry {
      margin-bottom: 8px;
      padding: 8px;
      border-radius: 4px;
    }
    .log-entry.info {
      background-color: #e8f4fd;
    }
    .log-entry.success {
      background-color: #e6f7e9;
    }
    .log-entry.error {
      background-color: #ffebee;
    }
    .domain-info {
      text-align: center;
      font-size: 14px;
      color: #666;
      margin-top: 20px;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 12px;
      color: #999;
    }
  </style>
</head>
<body>
  <header>
    <h1>Cloudflare Cache Purge</h1>
  </header>
  
  <div class="explanation">
    <h2>About This Tool</h2>
    <p>This Worker allows you to purge the Cloudflare cache for <strong>${domainName}</strong> with a single click.</p>
    <p><strong>What happens when you click "Purge Cache":</strong></p>
    <ol>
      <li>The Worker makes a POST request to Cloudflare's API at <code>https://api.cloudflare.com/client/v4/zones/[ZONE_ID]/purge_cache</code></li>
      <li>The request includes an authorization token and instructs Cloudflare to purge everything in the cache</li>
      <li>Cloudflare processes the request and returns a success or error response</li>
      <li>The status log below shows the details of the operation</li>
    </ol>
    <p><strong>When to use:</strong> After making website updates that aren't appearing due to caching, or when you need to ensure visitors see the most current version of your site.</p>
  </div>
  
  <div class="action-panel">
    <button id="purge">Purge Cache</button>
    <p class="domain-info">Target domain: ${domainName} (Zone ID: ${zoneId.substring(0, 6)}...)</p>
  </div>
  
  <h3>Status Log:</h3>
  <div id="status-log" class="status-log">
    <div class="log-entry info">Ready to purge cache. Click the button above to start.</div>
  </div>
  
  <div class="footer">
    <p>
      Cache Purge Tool • 
      <a href="https://github.com/taslabs-net/cf_cache_purge" target="_blank">View on GitHub</a> • 
      <a href="https://deploy.workers.cloudflare.com/?url=https://github.com/taslabs-net/cf_cache_purge" target="_blank">
        Deploy your own
        <img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare Workers" style="height: 18px; vertical-align: middle; margin-left: 5px;">
      </a>
    </p>
  </div>

  <script>
    const logElement = document.getElementById('status-log');
    const purgeButton = document.getElementById('purge');
    
    function addLogEntry(message, type = 'info') {
      const entry = document.createElement('div');
      entry.className = \`log-entry \${type}\`;
      entry.textContent = \`[\${new Date().toLocaleTimeString()}] \${message}\`;
      logElement.appendChild(entry);
      logElement.scrollTop = logElement.scrollHeight;
    }
    
    purgeButton.addEventListener('click', async () => {
      // Disable button during operation
      purgeButton.disabled = true;
      
      try {
        addLogEntry('Sending purge request to Cloudflare API...', 'info');
        
        const startTime = new Date();
        // Use the current URL path to build the purge endpoint
        const purgeUrl = new URL('/purge', window.location.href).href;
        addLogEntry(\`Sending request to: \${purgeUrl}\`, 'info');
        
        const res = await fetch(purgeUrl, { method: 'POST' });
        
        if (!res.ok) {
          throw new Error(\`HTTP error! status: \${res.status} \${res.statusText}\`);
        }
        
        const data = await res.json();
        const endTime = new Date();
        const duration = (endTime - startTime) / 1000;
        
        if (data.success) {
          addLogEntry(\`✅ Cache purged successfully! (took \${duration}s)\`, 'success');
          
          if (data.details && data.details.result) {
            addLogEntry(\`Response from Cloudflare: \${JSON.stringify(data.details.result)}\`, 'success');
          }
          
          addLogEntry(\`Purge operation completed at \${data.timestamp}\`, 'info');
        } else {
          addLogEntry('❌ Failed to purge cache.', 'error');
          
          if (data.details && data.details.errors) {
            data.details.errors.forEach(error => {
              addLogEntry(\`Error: \${error.message} (Code: \${error.code})\`, 'error');
            });
          }
        }
      } catch (error) {
        addLogEntry(\`❌ Error: \${error.message}\`, 'error');
      } finally {
        // Re-enable button
        purgeButton.disabled = false;
      }
    });
  </script>
</body>
</html>`;
}
