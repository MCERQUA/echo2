# OnPoint Insulation Website Link Audit Checklist

## Overview
This document provides a comprehensive audit of all buttons and links on the OnPoint Insulation website that require manual destination setup in Divi. The audit was performed on March 21, 2025.

## Status Legend
- ❌ **Needs Action**: Link is missing, using a placeholder (#), or potentially incorrect
- ✅ **Correct**: Link is properly set up and functioning as expected
- ⚠️ **Review**: Link exists but may not be optimal (e.g., linking to the same page)
- ✓ **Fixed**: Issue has been resolved (to be marked once fixed)

## Homepage (https://on-point-insulation.com/)
| Element | Current Status | Target URL | Notes |
|---------|----------------|------------|-------|
| "Discover Our Services" (hero) | ✅ | /services/ | Correctly linked |
| "Explore Our Insulation Solutions" | ❌ | /services/ | Text/heading needs link |
| "Learn More" (Attic Insulation) | ✅ | /services/ | Correctly linked |
| "Get a Free Quote" (Basement) | ✅ | /contact/ | Correctly linked |
| "Request a Quote" (bottom) | ✅ | /contact/ | Correctly linked |

## Services Page (https://on-point-insulation.com/services/)
| Element | Current Status | Target URL | Notes |
|---------|----------------|------------|-------|
| "Discover Our Services" (top) | ❌ | /services/ | No link assigned |
| "Learn More" (Residential) | ❌ | /services/#residential | Needs anchor link |
| "Learn More" (Commercial) | ❌ | /services/#commercial | Needs anchor link |
| "Learn More" (Types) | ❌ | /services/#types | Needs anchor link |
| "Learn More" (Air Sealing) | ❌ | /services/#air-sealing | Needs anchor link |
| "Explore Packages" | ⚠️ | /performance/ | Currently links to same page |
| "Request a Quote" (bottom) | ✅ | /contact/ | Correctly linked |

## About Page (https://on-point-insulation.com/about/)
| Element | Current Status | Target URL | Notes |
|---------|----------------|------------|-------|
| "Learn More About Our Mission" | ❌ | /about/#mission | Currently links to /faqs/ |
| "Learn More" (Residential) | ❌ | /services/#residential | Currently links to /contact/ |
| "Discover More" (Commercial) | ✅ | /services/ | Correctly linked |
| "Request a Free Quote" | ✅ | /contact/ | Correctly linked |

## Contact Page (https://on-point-insulation.com/contact/)
| Element | Current Status | Target URL | Notes |
|---------|----------------|------------|-------|
| "Request a Quote" (top) | ❌ | #contact-form | No link assigned |
| "Explore Our Services" | ❌ | /services/ | No link assigned |
| "View Our Services" | ❌ | /services/ | No link assigned |
| Social Media "Follow" (3) | ❌ | Facebook/Twitter/Instagram URLs | All using "#" |
| "Request a Quote" (bottom) | ❌ | #contact-form | Using "#" placeholder |

## FAQs Page (https://on-point-insulation.com/faqs/)
| Element | Current Status | Target URL | Notes |
|---------|----------------|------------|-------|
| "Explore Our Services" | ❌ | /services/ | No link assigned |
| "General" category | ❌ | /faqs/#general | Needs anchor link |
| "Technical" category | ❌ | /faqs/#technical | Needs anchor link |
| "Process" category | ❌ | /faqs/#process | Needs anchor link |
| "Cost" category | ❌ | /faqs/#cost | Needs anchor link |
| "Eco-Friendly" category | ❌ | /faqs/#eco-friendly | Needs anchor link |
| "Local Services" category | ❌ | /faqs/#local-services | Needs anchor link |
| "Benefits" category | ❌ | /faqs/#benefits | Needs anchor link |
| "FAQs" category | ❌ | /faqs/#all-faqs | Needs anchor link |
| Social Media "Follow" (3) | ❌ | Facebook/Twitter/Instagram URLs | All using "#" |
| "Get a Free Quote" | ❌ | /contact/ | No link assigned |

## Energy Page (https://on-point-insulation.com/energy/)
| Element | Current Status | Target URL | Notes |
|---------|----------------|------------|-------|
| "Explore Our Solutions" | ✅ | /services/ | Correctly linked |
| "Learn About Savings" | ❌ | /energy/#savings | Needs anchor link |
| "Improve Your Comfort" | ❌ | /energy/#comfort | Needs anchor link |
| "Go Green Today" | ❌ | /energy/#environmental | Needs anchor link |
| "Increase Your Home's Value" | ❌ | /energy/#home-value | Needs anchor link |
| "Explore Rebates Now" | ❌ | /energy/#rebates | Currently links to /faqs/ |
| "Get Your Free Quote" | ✅ | /contact/ | Correctly linked |

## Priority Focus Areas
1. Fix all contact form links to ensure users can easily request quotes
2. Set up service category links to improve navigation within service pages
3. Correct social media links on Contact and FAQ pages
4. Fix main call-to-action buttons on each page

## Next Steps After Link Fixes
1. Verify all links are working correctly
2. Implement anchor links for within-page navigation
3. Create the Performance page to replace the current 404 error
4. Review user journey and navigation flow

## Performance Page Recommendations
Since the "Performance" menu item exists but leads to a 404 error, creating this page should be a priority. Based on project documentation, this page should include:
1. Home performance assessments
2. Air sealing package details
3. Building science education
4. Energy efficiency solutions

## Changelog
| Date | Editor | Changes Made |
|------|--------|--------------|
| 2025-03-21 | Echo | Initial audit completed |
|  |  |  |
