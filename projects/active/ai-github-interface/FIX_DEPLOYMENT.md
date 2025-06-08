# Cloudflare Pages Deployment Fix Guide

## Issue Summary
The deployment is failing with error:
```
remote: Repository not found.
fatal: repository 'https://github.com/MCERQUA/echo2/' not found
```

## Root Cause
Cloudflare Pages is trying to access the repository with a trailing slash, or the GitHub integration has lost access permissions.

## Solution Steps

### Step 1: Check GitHub Integration
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** > **echo2**
3. Click **Settings** > **Builds & deployments**
4. Click **Edit** next to "Source code"
5. Verify the repository is set to `MCERQUA/echo2` (without trailing slash)

### Step 2: Re-authorize GitHub Access
1. In the same settings page, click **"Manage GitHub installation"**
2. You'll be redirected to GitHub
3. Ensure Cloudflare Pages has access to the `echo2` repository
4. If not visible, click **"Configure"** and add the repository

### Step 3: Update Build Configuration
1. Back in Cloudflare Pages settings:
   - **Framework preset**: None
   - **Build command**: (leave empty)
   - **Build output directory**: `projects/active/ai-github-interface/frontend`
   - **Root directory**: (leave empty)

### Step 4: Environment Variables
Add these in **Settings** > **Environment variables**:

1. **OPENAI_API_KEY**
   - Your OpenAI API key
   - Required for AI functionality

2. **GITHUB_TOKEN**
   - Your GitHub personal access token
   - Required for GitHub operations

3. **HUGGINGFACE_TOKEN** (optional)
   - Your Hugging Face API token
   - Enables higher rate limits for image generation

### Step 5: KV Namespace Binding
1. Go to **Settings** > **Functions** > **KV namespace bindings**
2. Add binding:
   - Variable name: `SESSIONS`
   - KV namespace: Select the existing "SESSIONS" namespace

### Step 6: Trigger New Deployment
1. Go to **Deployments** tab
2. Click **"Retry deployment"** on the failed deployment
3. Or trigger a new deployment by pushing any change to GitHub

## Alternative: Manual Deployment

If GitHub integration continues to fail:

1. **Download the frontend folder** from GitHub
2. In Cloudflare Pages, click **"Create a project"**
3. Choose **"Direct Upload"**
4. Upload the entire `frontend` folder
5. Configure the same environment variables and KV bindings

## Alternative: Deploy as Worker

Using the wrangler CLI:

```bash
# Clone the repository
git clone https://github.com/MCERQUA/echo2.git
cd echo2/projects/active/ai-github-interface/frontend

# Install wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy as Worker
wrangler deploy --name echo2-ai-interface
```

Then add environment variables:
```bash
wrangler secret put OPENAI_API_KEY
wrangler secret put GITHUB_TOKEN
wrangler secret put HUGGINGFACE_TOKEN
```

## Verification

Once deployed, verify the deployment:

1. Visit: `https://echo2.pages.dev/api/health`
2. Should return:
```json
{
  "status": "healthy",
  "model": "OpenAI gpt-4.1-nano",
  "features": ["session_threading", "github_tools", "huggingface_tools"],
  "tools": 9,
  "tool_categories": {
    "github": 5,
    "huggingface": 4
  }
}
```

## Updated Features
- ✅ GitHub tools (search, read, write, issues)
- ✅ Hugging Face tools (model search, image generation, analysis)
- ✅ Session persistence
- ✅ Cost tracking ($0.50-$1.00/month)

## Contact
If issues persist, the problem is likely with the GitHub OAuth app permissions. You may need to:
1. Remove Cloudflare Pages from GitHub integrations
2. Re-add it with fresh permissions
3. Ensure the OAuth app has access to the MCERQUA organization
