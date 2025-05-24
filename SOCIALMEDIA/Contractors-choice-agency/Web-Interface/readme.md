# Image Approval System

## Overview
This web application allows clients to review and approve social media images. It displays images from a GitHub repository, enables approval/rejection with feedback notes, and captures responses via Netlify forms.

## Features
- Display images from GitHub repository
- Review interface for each image
- Approval system with note-taking capability
- Form submission through Netlify
- Responsive design for all devices

## Deployment
This site is designed to be deployed on Netlify with the following steps:

1. Connect this GitHub repository to Netlify
2. Set the publish directory to `SOCIALMEDIA/Contractors-choice-agency/Web-Interface`
3. No build command is required as this is a static site
4. Netlify will automatically detect the form in index.html

## Form Submissions
All form submissions are captured by Netlify and can be viewed in the Netlify dashboard under Forms.

## Development

### File Structure
- `index.html` - Main HTML structure
- `styles.css` - Styling for the application
- `app.js` - JavaScript functionality
- `netlify.toml` - Netlify configuration

### Updating Images
New images should be uploaded to the GitHub folder: `SOCIALMEDIA/Contractors-choice-agency/New-Uploads`
