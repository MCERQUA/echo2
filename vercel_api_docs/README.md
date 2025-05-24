# Vercel API Documentation

This folder contains documentation and OpenAPI specifications for the Vercel API.

The Vercel REST API is a REST-styled API that gives full control over the entire Vercel platform. It allows developers to interact programmatically with their Vercel account and services using HTTP requests.

## Contents

- `vercel-openapi.json` - OpenAPI 3.0 specification for the Vercel API
- Documentation on how to use the Vercel API with Echo's tools

## Key Features

- Deploy new applications
- Manage domains and DNS
- Configure projects
- Work with environment variables
- Manage teams and users
- View logs and metrics

## Authentication

The Vercel API uses OAuth2 token-based authentication. Access tokens can be created in the Vercel dashboard under Account Settings > Tokens.

Add the token to the Authorization header of your requests:
```
Authorization: Bearer <YOUR_TOKEN>
```

## References

- [Official Vercel API Documentation](https://vercel.com/docs/rest-api)
