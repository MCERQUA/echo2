#!/bin/bash
# Setup script for echo2.pages.dev session storage

echo "🔧 Setting up KV namespace for echo2.pages.dev session storage..."

# Step 1: Create KV namespace
echo "Creating KV namespace..."
wrangler kv:namespace create "SESSIONS" --preview

echo ""
echo "📝 Copy the namespace ID from above output"
echo "Example: { binding = \"SESSIONS\", id = \"xxxxxx\" }"
echo ""
read -p "Enter the namespace ID: " NAMESPACE_ID

# Step 2: Create wrangler.toml for local testing
cat > wrangler.toml << EOF
name = "echo2"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "SESSIONS"
id = "${NAMESPACE_ID}"

[vars]
# Add your API keys here for local testing
# OPENAI_API_KEY = "sk-..."
# GITHUB_TOKEN = "ghp_..."
EOF

echo "✅ Created wrangler.toml"

# Step 3: Test KV operations
echo ""
echo "🧪 Testing KV namespace..."
cat > test-kv.js << 'EOF'
export default {
  async fetch(request, env) {
    try {
      // Test write
      await env.SESSIONS.put("test-key", "test-value", {
        expirationTtl: 60 // 1 minute
      });
      
      // Test read
      const value = await env.SESSIONS.get("test-key");
      
      return new Response(JSON.stringify({
        success: true,
        test: value === "test-value" ? "PASSED" : "FAILED",
        value: value
      }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};
EOF

echo "Running KV test..."
wrangler dev test-kv.js --local --port 8787 &
WRANGLER_PID=$!
sleep 5

# Test the KV
curl -s http://localhost:8787 | jq .

# Kill wrangler
kill $WRANGLER_PID

# Step 4: Instructions for Cloudflare Dashboard
echo ""
echo "📋 Now configure in Cloudflare Dashboard:"
echo ""
echo "1. Go to: https://dash.cloudflare.com"
echo "2. Select your account"
echo "3. Go to Pages → echo2"
echo "4. Settings → Functions → KV namespace bindings"
echo "5. Add new binding:"
echo "   - Variable name: SESSIONS"
echo "   - KV namespace: Select the one you just created"
echo ""
echo "6. Settings → Environment variables"
echo "   Add these if not already present:"
echo "   - OPENAI_API_KEY: Your OpenAI API key"
echo "   - GITHUB_TOKEN: Your GitHub personal access token"
echo ""
echo "7. Redeploy by going to Deployments → Retry deployment"
echo ""
echo "✅ Setup complete!"
echo ""
echo "🧪 To verify after deployment:"
echo "curl https://echo2.pages.dev/api/health"
echo ""
echo "Should show: \"features\": [\"session_threading\", ...]"
