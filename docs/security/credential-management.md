# Credential Management Security Protocol

## CRITICAL SECURITY INCIDENT
**Date**: June 7, 2025
**Issue**: GitHub revoked OAuth tokens due to API key exposure in code
**Impact**: Lost automatic deployments for Cloudflare, Netlify, and other integrations

## ZERO TOLERANCE POLICY
- **NEVER** write actual API keys, tokens, passwords, or credentials in code
- **ALWAYS** use environment variable placeholders
- **SCAN** all code before committing for exposed credentials

## Safe Patterns

### ✅ CORRECT - Environment Variables
```javascript
const apiKey = process.env.OPENAI_API_KEY;
const dbUrl = process.env.DATABASE_URL;
const token = process.env.GITHUB_TOKEN;

// Always validate required environment variables
if (!apiKey) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}
```

### ❌ WRONG - Hardcoded Credentials
```javascript
const apiKey = "sk-1234567890abcdef";  // NEVER DO THIS
const dbUrl = "postgres://user:pass@host";  // NEVER DO THIS
const token = "ghp_xxxxxxxxxxxx";  // NEVER DO THIS
```

## Pre-Commit Checklist
Before creating or updating any file:

1. [ ] Does this code access external APIs?
2. [ ] Are all credentials using environment variables?
3. [ ] Have I scanned for patterns like:
   - `sk-` (OpenAI keys)
   - `ghp_` (GitHub tokens)
   - `Bearer ` (Auth tokens)
   - Database connection strings
   - OAuth secrets
4. [ ] Have I created deployment instructions?

## Deployment Instructions Template
Always create separate documentation for required environment variables:

```markdown
## Environment Variables Required
- `OPENAI_API_KEY`: Your OpenAI API key
- `GITHUB_TOKEN`: GitHub Personal Access Token with repo permissions
- `DATABASE_URL`: PostgreSQL connection string
```

## Emergency Response
If credentials are accidentally committed:
1. Immediately revoke the exposed credentials
2. Generate new credentials
3. Update environment variables
4. Force push to remove from history (if possible)
5. Document the incident

## Tools Integration
When using MCP tools to edit code:
- Always use placeholder values
- Create environment setup documentation
- Never commit actual secrets through MCP operations

---
**Remember**: One exposed credential can compromise entire systems. When in doubt, use environment variables.
