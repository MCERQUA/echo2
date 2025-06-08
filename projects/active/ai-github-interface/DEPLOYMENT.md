# Cloudflare Pages Configuration

## Build Settings
- **Framework preset**: None
- **Build command**: (leave empty)
- **Build output directory**: `/projects/active/ai-github-interface/frontend`
- **Root directory**: (leave empty)

## Environment Variables Required
- `OPENAI_API_KEY`: Your OpenAI API key
- `GITHUB_TOKEN`: Your GitHub personal access token  
- `HUGGINGFACE_TOKEN`: Your Hugging Face API token (optional but recommended)

## KV Namespace Binding
- Create a KV namespace called "SESSIONS" or "KV"
- Bind it to the Pages project for session storage

## Repository Settings
- Repository: `MCERQUA/echo2` (without trailing slash)
- Branch: `main`
- Auto deployments: Enabled

## Notes
- The deployment pulls from the echo2 repository on GitHub
- The frontend files are in `/projects/active/ai-github-interface/frontend`
- No build step is required as files are already built
