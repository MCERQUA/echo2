# WordPress Implementation Guide

**Project:** ICA Website Recreation  
**Platform:** WordPress with Divi Theme  
**Date:** May 27, 2025

## WordPress Configuration Requirements

### 1. Core WordPress Setup

#### 1.1 WordPress Installation
```
WordPress Version: Latest stable (6.x+)
PHP Version: 8.1 or higher
MySQL Version: 8.0 or higher
Memory Limit: 256MB minimum
Upload Limit: 64MB minimum
```

#### 1.2 Multi-Site Configuration
**Critical:** Current site uses `/sites/53/` structure in uploads
- Enable WordPress Multi-Site Network
- Configure Site ID: 53
- Upload path: `/wp-content/uploads/sites/53/`

#### 1.3 Permalink Structure
```
Custom Structure: /%postname%/
Category Base: (leave empty)
Tag Base: (leave empty)
```

### 2. Required Plugins

#### 2.1 Essential Plugins
1. **Divi Theme + Builder**
   - Primary theme used on current site
   - Required for layout recreation

2. **SmartCrawl SEO**
   - Current sitemap generation
   - XML sitemap: `/page-sitemap1.xml`

3. **Image Optimization Plugin**
   - Replace SmushCDN functionality
   - WebP format support
   - Auto-optimization for uploads

4. **Contact Form Plugin**
   - Contact form functionality
   - Lead routing and processing

#### 2.2 Optional Enhancement Plugins
- Security plugin (Wordfence or similar)
- Backup plugin for ongoing maintenance
- Analytics integration (Google Analytics)

### 3. Divi Theme Configuration

#### 3.1 Theme Setup
- Install Divi parent theme
- Configure global colors to match current site
- Set up global fonts and typography
- Configure responsive breakpoints

#### 3.2 Global Design Settings
```css
Primary Colors:
- Main Blue: #1e3c72 (estimated from pages)
- Accent Orange: #ff6b35 (estimated from CTAs)
- Text Dark: #333333
- Background: #ffffff

Typography:
- Headings: Arial or similar sans-serif
- Body: Arial, sans-serif
- Line Height: 1.6
```

### 4. Page Recreation Using Divi

#### 4.1 Homepage Layout Structure
**Use Divi Builder with these sections:**

1. **Header Section**
   - Text Module: Company tagline
   - Text Module: Main headline
   - Text Module: Subheadline

2. **Services Section** 
   - Section with 6 columns (2 rows of 3)
   - Each column: Blurb Module
     - Image + Title + Description
     - Link to service page where applicable

3. **Air Duct Cleaning Section**
   - Two column section
   - Image Module + Text Module

4. **Agricultural Tank Section**
   - Full-width section
   - Text Module + Image Module
   - Button Module (CTA to contact)
   - Four column section for tank types

5. **Credentials Section**
   - Three column section
   - Image Module + Text Modules
   - External links to verification

6. **Safety Section**
   - Text Module + Four column section
   - Feature descriptions

#### 4.2 Service Page Templates
**Create reusable template for:**
- Spray Foam Insulation page
- Fiberglass Insulation page  
- Insulation Removal page

**Template Structure:**
```
Header Section: Page title + tagline
Content Section: Service descriptions + images
Applications Section: Multiple columns with images
FAQ Section: Call-to-action text
```

#### 4.3 Contact Page Template
**Reuse for all contact/office pages:**
```
Intro Section: FAQ intro text
About Section: Image + credentials
Safety Section: Image + description
Reviews Section: External links
```

### 5. Content Migration Strategy

#### 5.1 Homepage Content Modules

**Section 1: Header**
```html
<h1>Insulation Contractors Of Arizona</h1>
<h2>Discover Premier Insulation Services in Arizona's Booming Cities!</h2>
<p>In the heart of Gilbert, Chandler, and Glendale's growth, we offer expert insulation solutions tailored to the unique needs of these dynamic communities.</p>
```

**Section 2: Services (6 Blurb Modules)**
```
Module 1: Open Cell Spray Foam
- Image: rsw_388h_194cg_true.webp
- Text: "This type of spray foam is perfect for homes in Arizona!!"

Module 2: Closed Cell Spray Foam  
- Image: crw_388h_194.webp
- Text: "This is a low expanding type of foam..."

[Continue for all 6 services]
```

#### 5.2 Image Integration
**Upload all images to exact paths:**
```
/wp-content/uploads/sites/53/2023/05/[filename]
/wp-content/uploads/sites/53/2024/02/[filename]
/wp-content/uploads/sites/53/2025/01/[filename]
/wp-content/uploads/sites/53/2025/04/[filename]
```

#### 5.3 Link Integration
**Internal Links:**
- Use relative URLs: `/fiberglass-insulation`
- Maintain exact paths: `/insulation_removal/` (underscore)

**External Links:**
- ROC verification: Full URL with license ID
- Insurance: sprayfoaminsurance.com with phone
- BBB: Full profile URL
- Reviews: Complete Google URL with parameters

### 6. Navigation Setup

#### 6.1 Primary Menu Configuration
```
Menu Name: Primary Navigation
Theme Location: Primary

Menu Structure:
├── Home (/)
├── Services (/services/)
│   ├── Spray Foam Insulation (/spray-foam-insulation/)
│   ├── Fiberglass Insulation (/fiberglass-insulation/)
│   └── Insulation Removal (/insulation_removal/)
├── Blog (/blog/)
├── Events (/events/)
│   └── Maricopa County Homeshow 2025 (/maricopa-county-homeshow-2025/)
└── Contact Us (/contact-us/)
    ├── Glendale Office (/glendale-office/)
    └── Wittmann Office (/wittmann-office/)
```

#### 6.2 Menu Settings
- Display location: Header
- Auto-add new top-level pages: No
- Mobile menu: Enable responsive behavior

### 7. SEO Configuration

#### 7.1 SmartCrawl Setup
```
Sitemap Settings:
- Enable XML sitemaps
- Include pages: Yes
- Include posts: Yes (for blog)
- Include images: Yes
- Sitemap URL: /page-sitemap1.xml
```

#### 7.2 Page-Specific SEO

**Homepage:**
```
Title: Insulation Contractors Of Arizona Homepage | Insulation Contractors of Arizona
Meta Description: [Current meta description]
URL: /
```

**Service Pages:**
```
Spray Foam: /spray-foam-insulation/
Fiberglass: /fiberglass-insulation/  
Removal: /insulation_removal/
```

### 8. Contact Form Integration

#### 8.1 Contact Form Setup
- Create contact form for agricultural CTA
- Route to: insulationcontractorsofaz@gmail.com
- Include phone integration for mobile

#### 8.2 Contact Information
**Glendale Office:**
```
Phone: (623)241-1939
Address: 10616 N 50th Ave, Glendale, AZ 85304
Email: insulationcontractorsofaz@gmail.com
```

**Wittmann Office:**
```
Phone: (602)907-8995
Address: 20944 W Jomax Rd, Wittmann, AZ 85361
Email: insulationcontractorsofarizona@gmail.com
```

### 9. Mobile Optimization

#### 9.1 Responsive Settings
- Test all sections on mobile
- Ensure image scaling works properly
- Verify navigation collapses correctly
- Test contact form functionality

#### 9.2 Performance Considerations
- Enable image lazy loading
- Configure WebP format delivery
- Optimize for Core Web Vitals
- Test page load speeds

### 10. Quality Assurance Checklist

#### 10.1 Content Verification
- [ ] All 14 pages created
- [ ] All text content matches exactly
- [ ] All images display correctly
- [ ] All contact information accurate

#### 10.2 Link Testing
- [ ] All internal links work
- [ ] External verification links functional
- [ ] Phone numbers clickable on mobile
- [ ] Email links open properly

#### 10.3 SEO Verification
- [ ] All page titles correct
- [ ] URL structure matches exactly
- [ ] Sitemap generates properly
- [ ] Meta descriptions in place

#### 10.4 Technical Testing
- [ ] Mobile responsiveness
- [ ] Page load speeds acceptable
- [ ] Contact forms processing
- [ ] SSL certificate active

### 11. Launch Process

#### 11.1 Pre-Launch
1. Complete all content migration
2. Test thoroughly on staging
3. Verify all links and forms
4. Check mobile experience
5. Confirm SEO elements

#### 11.2 Go-Live Steps
1. Point DNS to new hosting
2. Verify SSL certificate
3. Test site functionality
4. Submit sitemap to Google
5. Monitor for issues

#### 11.3 Post-Launch
1. Set up ongoing backups
2. Configure security monitoring
3. Install analytics tracking
4. Document maintenance procedures

### 12. Maintenance Requirements

#### 12.1 Ongoing Tasks
- Regular WordPress updates
- Plugin updates and testing
- Image optimization monitoring
- Backup verification
- Security monitoring

#### 12.2 Content Updates
- Event page updates as needed
- Contact information maintenance
- New service additions
- Blog content integration

**Implementation Status:** Ready for WordPress development team execution