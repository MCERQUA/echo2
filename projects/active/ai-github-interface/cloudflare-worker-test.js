addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI GitHub Interface - Quick Test</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
    <h1>AI GitHub Interface</h1>
    <p>Quick test to verify Cloudflare Workers deployment.</p>
    <button onclick="testAPI()">Test API Connection</button>
    <div id="result"></div>
    
    <script>
    async function testAPI() {
      const result = document.getElementById('result');
      result.innerHTML = 'Testing...';
      
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        result.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
      } catch (error) {
        result.innerHTML = 'Error: ' + error.message;
      }
    }
    </script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}
