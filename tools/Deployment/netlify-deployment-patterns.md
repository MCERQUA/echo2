# Netlify Deployment Patterns for Echo Projects

This document outlines the recommended patterns for deploying Echo projects to Netlify.

## Key Findings

Through extensive testing, we've discovered that direct Netlify deployments via the `createSiteFromGitHub` MCP function often encounter repository access issues, despite successful site creation in the Netlify dashboard. The most reliable approach uses GitHub Actions for deployment.

## Recommended Deployment Pattern

### 1. Repository Setup

Create a GitHub repository with the website files:

```javascript
// Create the repository
create_repository({
  name: "echo-project-name",
  description: "Description of the Echo project",
  autoInit: true
});

// Add files to the repository
create_or_update_file({
  owner: "MCERQUA",
  repo: "echo-project-name",
  path: "index.html",
  branch: "main",
  content: "<!DOCTYPE html>...",
  message: "Add index.html"
});

// Repeat for all project files
```

### 2. GitHub Actions Workflow

Create a GitHub Actions workflow file for Netlify deployment:

```javascript
create_or_update_file({
  owner: "MCERQUA",
  repo: "echo-project-name",
  path: ".github/workflows/netlify.yml",
  branch: "main",
  content: `name: Build and Deploy to Netlify

on:
  push:
    branches: [ main ]
    
jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v1.2
        with:
          publish-dir: '.'
          production-branch: main
          github-token: \${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
          enable-pull-request-comment: false
          enable-commit-comment: false
          overwrites-pull-request-comment: false
        env:
          NETLIFY_AUTH_TOKEN: \${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: \${{ secrets.NETLIFY_SITE_ID }}
          timeout-minutes: 1`,
  message: "Add GitHub Actions workflow for Netlify deployment"
});
```

### 3. Netlify Site Creation

Create the Netlify site using the MCP function (note that this will not successfully deploy the site, but will create the site configuration):

```javascript
createSiteFromGitHub({
  name: "echo-project-name",
  repo: "MCERQUA/echo-project-name",
  branch: "main",
  publishDir: ".",
  buildCommand: "echo \"No build needed for static HTML\""
});
```

### 4. GitHub Repository Secrets

The GitHub repository needs the following secrets configured:

- `NETLIFY_AUTH_TOKEN`: Netlify personal access token
- `NETLIFY_SITE_ID`: Netlify site API ID

These must be set manually in the GitHub repository settings.

## Why This Pattern Works

- The GitHub Actions workflow uses the `nwtgck/actions-netlify` action, which has proper authentication with Netlify
- This approach doesn't rely on Netlify's direct repository access, which can encounter permission issues
- GitHub Actions provides better error logging and deployment control
- This pattern aligns with successful Echo site deployments like the echo-demo-site

## Known Issues

- Attempting direct Netlify deployment with `createSiteFromGitHub` without GitHub Actions typically fails with:
  ```
  Host key verification failed. fatal: Could not read from remote repository. 
  Please make sure you have the correct access rights and the repository exists.
  ```
- The MCP function `createSiteFromGitHub` successfully creates the site configuration but fails at the actual build/deployment step
- Without GitHub Actions configured with proper secrets, sites will remain in a non-deployed state

## Example Repositories

- Successful pattern: [echo-demo-site](https://github.com/MCERQUA/echo-demo-site)
- With GitHub Actions: [echo-interface-gallery](https://github.com/MCERQUA/echo-interface-gallery)
- With GitHub Actions: [echo-interface-gallery-actions](https://github.com/MCERQUA/echo-interface-gallery-actions)

## Best Practices

1. Always include a GitHub Actions workflow file for Netlify deployment
2. Document needed repository secrets in the README.md
3. Use descriptive repository and site names
4. Keep the static website files in the repository root (set `publishDir` to `.`)
5. Use simplified build commands for static HTML sites

@memory_type: knowledge
@importance: high
@context: deployment, Netlify, GitHub Actions
@timestamp: 2025-03-15
