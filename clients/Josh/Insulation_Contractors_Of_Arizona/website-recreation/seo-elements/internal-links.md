# Internal and External Links Mapping

**Analysis Date:** May 27, 2025  
**Purpose:** Preserve all link relationships for exact website recreation

## Internal Links Inventory

### Homepage Internal Links
1. **Fiberglass Service Link**
   - **From:** Homepage fiberglass service description
   - **To:** https://insulationcontractorsofarizona.com/fiberglass-insulation
   - **Anchor Text:** "Fiberglass"
   - **Context:** Service description linking to dedicated page

2. **Contact Us CTA**
   - **From:** Homepage agricultural tank section
   - **To:** https://insulationcontractorsofarizona.com/contact-us/
   - **Anchor Text:** "Get a Free Quote"
   - **Context:** Call-to-action button

### Services Page Internal Links
- **Analysis:** Services page appears to contain similar content to homepage but may have different internal linking patterns
- **Note:** Requires detailed analysis to identify any unique links

### Contact Page Internal Links
1. **License Verification Link**
   - **From:** Contact page and office pages
   - **To:** https://roc.force.com/AZRoc/s/contractor-search?licenseId=a0o8y0000005GtuAAE
   - **Type:** External (but treated as verification)
   - **Purpose:** ROC license verification

2. **Google Reviews Link**
   - **From:** Contact page and office pages
   - **To:** https://www.google.com/search?ved=1t:65428&_ga=2.160958909.1246213432.1647226736-1941378057.1647226736&q=Insulation+Contractors+of+Arizona+LLC&ludocid=3692633637059205371&lsig=AB86z5WI2rxPlkQ2pBhXrnqzl45x#fpstate=lie
   - **Anchor Text:** "here."
   - **Purpose:** Customer reviews

3. **BBB Profile Link**
   - **From:** Contact page and office pages
   - **To:** https://www.bbb.org/us/az/glendale/profile/insulation-contractors/insulation-contractors-of-arizona-1126-1000090032
   - **Anchor Text:** "Click here"
   - **Purpose:** BBB accreditation verification

### Office Pages Internal Links
- **Glendale Office:** Contains same verification links as contact page
- **Wittmann Office:** Contains same verification links as contact page

### Events Page Internal Links
1. **Maricopa County Home Shows**
   - **From:** Events page
   - **To:** https://maricopacountyhomeshows.com/?utm_source=chatgpt.com
   - **Type:** External
   - **Context:** Event organizer website

### Maricopa County Homeshow 2025 Internal Links
1. **Event Website Link**
   - **From:** Event details page
   - **To:** https://maricopacountyhomeshows.com/
   - **Anchor Text:** "Maricopa County Home Shows website"
   - **Purpose:** Official event information

## External Links Inventory

### Business Verification Links
1. **Arizona ROC License Verification**
   - **URL:** https://roc.force.com/AZRoc/s/contractor-search?licenseId=a0o8y0000005GtuAAE
   - **Purpose:** License verification (ROC #326891)
   - **Pages:** Contact, Glendale Office, Wittmann Office

2. **Spray Foam Insurance**
   - **URL:** https://www.sprayfoaminsurance.com/
   - **Purpose:** Certificate of insurance requests
   - **Phone:** 844-967-5247
   - **Pages:** Homepage, Contact, Office pages

3. **BBB Profile**
   - **URL:** https://www.bbb.org/us/az/glendale/profile/insulation-contractors/insulation-contractors-of-arizona-1126-1000090032
   - **Purpose:** BBB accreditation verification
   - **Pages:** Contact, Office pages

### Review and Social Links
1. **Google Reviews**
   - **URL:** https://www.google.com/search?ved=1t:65428&_ga=2.160958909.1246213432.1647226736-1941378057.1647226736&q=Insulation+Contractors+of+Arizona+LLC&ludocid=3692633637059205371&lsig=AB86z5WI2rxPlkQ2pBhXrnqzl45x#fpstate=lie
   - **Purpose:** Customer reviews
   - **Pages:** Contact, Office pages

### Event and Partnership Links
1. **Maricopa County Home Shows**
   - **URL:** https://maricopacountyhomeshows.com/
   - **Additional URL:** https://maricopacountyhomeshows.com/?utm_source=chatgpt.com
   - **Purpose:** Event partnership/participation
   - **Pages:** Events, Maricopa County Homeshow 2025

## Critical Link Preservation Requirements

### 1. Internal Navigation Structure
- **All internal links must point to exact current URLs**
- **No broken internal links allowed**
- **Preserve anchor text exactly as currently written**

### 2. External Business Links
- **ROC license link contains specific license ID - must be preserved exactly**
- **Google Reviews link contains tracking parameters - preserve complete URL**
- **BBB link is specific to Glendale location - maintain exact URL**

### 3. Contact and Verification Links
- **Insurance phone number (844-967-5247) must be preserved**
- **ROC license number (#326891) must remain accurate**
- **All external verification links must remain functional**

### 4. Navigation Menu Structure
Based on page analysis, standard navigation includes:
- Home
- Services
  - Spray Foam Insulation
  - Fiberglass Insulation
  - Insulation Removal
- Blog
- Events
  - Maricopa County Homeshow 2025
- Contact Us
  - Glendale Office
  - Wittmann Office

## Link Testing Requirements for Recreation

### Pre-Launch Checklist
- [ ] All internal links resolve to correct pages
- [ ] All external verification links functional
- [ ] Contact phone numbers clickable on mobile
- [ ] Email addresses properly formatted as mailto links
- [ ] Navigation menu consistent across all pages
- [ ] Breadcrumb navigation (if present) functional

### Post-Launch Verification
- [ ] Google Reviews link opens correct business profile
- [ ] ROC license link shows correct contractor (#326891)
- [ ] BBB link displays current accreditation
- [ ] Event links show current/relevant information
- [ ] Insurance contact information functional

## Special Considerations

### URL Consistency Issues
- **insulation_removal/** uses underscore (not hyphen) - must preserve
- **Long URLs like spray-foam-insulation-in-arizona/** must be maintained
- **Contact form links must point to functional contact system**

### External Link Maintenance
- **Some external links may become outdated over time**
- **Business verification links are critical for credibility**
- **Event links may need updating as events conclude**

## Implementation Notes for WordPress

### Menu Structure
- Create custom menu matching current navigation
- Ensure all menu items point to correct internal pages
- Add office locations as sub-menu items under Contact

### Link Management
- Use relative URLs for internal links where possible
- Maintain absolute URLs for external business verification
- Implement proper nofollow attributes where appropriate

### Contact Integration
- Ensure contact forms link to proper email processing
- Maintain phone number formatting for click-to-call
- Preserve email formatting for proper mailto functionality

**Status:** Complete link inventory ready for recreation implementation