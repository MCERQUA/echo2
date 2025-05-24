# Website Template Specifications

This document outlines the requirements and specifications for the website template system that will be used across Josh's domain portfolio.

## Core Requirements

1. **Working Blog Functionality**
   - Support for markdown files from GitHub repository
   - Automatic rendering of blog posts from markdown
   - Category and tag support
   - Pagination and archives
   - Featured images
   - SEO metadata

2. **Lead Generation Focus**
   - Prominent call-to-action elements
   - Multiple contact form options
   - Quote request functionality
   - Lead capture optimization

3. **Responsive Design**
   - Mobile-first approach
   - Tablet and desktop optimized
   - Performance focused
   - Accessibility compliant

4. **Consistent Branding**
   - Easy customization of colors and logos
   - Typography system
   - Consistent UI components

## Template Types

The system will include three primary template types that can be configured for specific domains:

### 1. Lead Generation Template

**Purpose**: Direct conversion of visitors into leads

**Key Features**:
- Hero section with strong value proposition
- Multiple call-to-action points
- Testimonials and social proof
- Simple, conversion-focused design
- Service highlights with benefits
- Quote calculator or estimator tools
- Mobile click-to-call functionality

**Best For**:
- Service-specific domains
- Location-specific domains
- Specific insurance product domains

### 2. Educational Resource Template

**Purpose**: Establish authority and provide valuable information

**Key Features**:
- Resource library structure
- Enhanced blog presentation
- Content organization by topics
- Downloadable resources
- Interactive tools and calculators
- Newsletter signup
- Premium content access

**Best For**:
- Institute/educational domains
- Informational domains
- Authority-building sites

### 3. Multilingual/Spanish Template

**Purpose**: Target Spanish-speaking market with culturally appropriate design

**Key Features**:
- Fully translated interface
- Culturally appropriate imagery and messaging
- Region-specific content
- Language toggle option
- Spanish-language resources
- Bilingual lead capture forms

**Best For**:
- Spanish language domains
- Domains targeting Hispanic market

## Technical Stack

### Frontend
- Next.js for static site generation and server components
- Tailwind CSS for styling
- TypeScript for type safety
- React for component architecture

### Blog System
- Markdown files stored in GitHub repository
- Automatic rendering through Next.js
- Frontmatter for metadata
- MDX support for interactive components

### Deployment
- Vercel for hosting and deployment
- GitHub Actions for continuous integration
- Automated testing before deployment
- Performance monitoring

### CMS Integration (Optional)
- Headless CMS options for non-technical content management
- Options include: Contentful, Sanity, or custom GitHub-based workflow
- API-based content retrieval
- Preview capabilities for draft content

## Component Library

The template system will include a standardized component library:

### Core Components
- Header (with navigation variants)
- Footer (with various information layouts)
- Hero sections (multiple styles)
- Call-to-action blocks
- Testimonial displays
- Service/Feature cards
- Contact forms
- Quote request forms
- Blog components (list, detail, sidebar)

### Interactive Elements
- FAQ accordions
- Insurance calculators
- Interactive quote builders
- Filter systems for content
- Progressive form systems

### Page Templates
- Homepage (multiple variants)
- Service pages
- About/Team pages
- Contact page
- Blog index and detail
- Resource library
- Landing page template
- Thank you/confirmation pages

## Blog Implementation Specifications

The blog system will be the most critical component of the template, addressing the challenges encountered in previous implementations:

### Architecture
- Markdown files stored in `/content/blog` directory in GitHub repository
- Static generation of blog pages at build time
- Incremental static regeneration for updates
- Category and tag taxonomy support
- Author information management

### Markdown Support
- Full GitHub Flavored Markdown support
- Frontmatter for metadata:
  ```yaml
  ---
  title: "Post Title"
  date: "2025-03-08"
  author: "Author Name"
  categories: ["Category1", "Category2"]
  tags: ["tag1", "tag2"]
  featured_image: "/images/posts/featured.jpg"
  excerpt: "Brief summary of the post"
  seo_title: "SEO-optimized title if different from main title"
  seo_description: "SEO meta description"
  ---
  ```
- Image handling with optimization
- Code block syntax highlighting
- Embedded components via MDX when needed

### Blog Features
- Related posts
- Popular posts tracking
- Search functionality
- Social sharing
- Commenting system (optional)
- Print-friendly formatting
- Reading time estimates
- Table of contents for longer posts

## Implementation Plan

1. **Template Development Phase**
   - Create base Next.js project structure
   - Implement core components
   - Develop blog functionality
   - Build template variants
   - Implement responsive design
   - Add theme customization

2. **Testing Phase**
   - Verify blog functionality with sample content
   - Test responsive behavior
   - Performance optimization
   - Accessibility compliance
   - Cross-browser testing

3. **Deployment System**
   - Set up Vercel project template
   - Configure GitHub integration
   - Implement domain connection process
   - Establish analytics integration
   - Create deployment documentation

4. **Content Management Workflow**
   - Document content creation process
   - Establish GitHub workflow for content updates
   - Create templates for blog posts
   - Develop style guide for content

## Next Steps

1. Create prototype of template with working blog using Next.js
2. Test blog functionality with GitHub markdown integration
3. Develop component library for rapid site development
4. Establish deployment pipeline for quick launch of new domains
