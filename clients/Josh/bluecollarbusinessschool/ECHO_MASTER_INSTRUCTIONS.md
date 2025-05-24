# ECHO MASTER INSTRUCTIONS: Blue Collar Business School Project
**Claude Project Instructions for Autonomous Operation**

## PROJECT IDENTITY & ACCESS

### Initialization Command
```
echo init bluecollarbusinessschool
```

### GitHub Repository Structure
- **Main Repository**: https://github.com/MCERQUA/ECHO2
- **Project Directory**: `/clients/Josh/bluecollarbusinessschool/`
- **Working Files Location**: `/clients/Josh/bluecollarbusinessschool/website/`
- **Reference Materials**: `/clients/Josh/bluecollarbusinessschool/reference-materials/`

### Live Website
- **Development URL**: https://bluecollarbusinessschool.netlify.app/
- **Netlify Site ID**: To be added upon deployment
- **Primary Domain**: bluecollarbusinessschool.com (planned)

### Project Context
This is a comprehensive contractor business education platform designed as a "choose your starting point" course system covering all aspects of running a successful contracting business in the USA.

---

## AUTONOMOUS OPERATION PROTOCOL

### Session Startup Sequence
1. **Initialize Knowledge**: Always run `echo init bluecollarbusinessschool`
2. **Access Current Status**: Review `AUTONOMOUS_EXECUTION_PLAN.md`
3. **Check Priority Queue**: Identify next task from execution plan
4. **Review Related Files**: Access relevant documentation before starting
5. **Plan File Structure**: Break work into appropriately sized files

### Working Memory Management
- **Always Reference**: The execution plan for current priorities
- **Key Documents**: 
  - `comprehensive-course-outline.md` - Complete course structure
  - `contractors-playbook-comprehensive-guide.md` - Industry insights
  - `course-development-guide.md` - Content requirements
  - `AUTONOMOUS_EXECUTION_PLAN.md` - Current status and next steps

---

## FILE SIZE MANAGEMENT STRATEGY

### Code Organization Principles
**CRITICAL**: Avoid large monolithic files. Always break code into logical, manageable sections.

### HTML File Structure (Per Module)
**Target: 200-400 lines maximum per file**
```
/website/modules/stage-1/module-1-1/
├── index.html (main lesson page - 300 lines max)
├── quiz.html (assessment page - 200 lines max)
├── calculator.html (tool page - 250 lines max)
├── resources.html (downloads page - 150 lines max)
└── assets/
    ├── module-1-1.css (150 lines max)
    ├── module-1-1.js (200 lines max)
    └── quiz-logic.js (150 lines max)
```

### CSS Management
- **Shared Styles**: `/website/assets/css/global.css` (300 lines max)
- **Component Styles**: `/website/assets/css/components/` (100-150 lines each)
- **Module-Specific**: Co-located with HTML files (150 lines max)

### JavaScript Management
- **Core Functions**: `/website/assets/js/core.js` (200 lines max)
- **Calculator Logic**: Separate files per calculator (150 lines max)
- **Quiz Engine**: `/website/assets/js/quiz-engine.js` (200 lines max)
- **Progress Tracking**: `/website/assets/js/progress.js` (150 lines max)

### Content Management
- **Lesson Content**: HTML with embedded text (300 lines max)
- **Long Content**: Break into sections with navigation
- **Reference Materials**: Separate markdown files in `/reference-materials/`

---

## DEVELOPMENT WORKFLOW

### File Creation Strategy
1. **Plan File Structure First**: Map out all files needed for task
2. **Create Foundation Files**: Basic structure and navigation
3. **Build Core Functionality**: Essential features first
4. **Add Enhanced Features**: Progressive enhancement
5. **Test and Optimize**: Ensure mobile functionality

### Session Planning Guidelines
**Optimal Session Targets:**
- **1 Complete Module Lesson**: Main content page + assessment
- **1 Interactive Tool**: Calculator or quiz with full functionality
- **2-3 Supporting Files**: CSS, JavaScript, resources
- **Documentation Update**: Progress tracking and next steps

### Quality Checkpoints
Before completing any session:
- [ ] All files under target line limits
- [ ] Mobile responsiveness verified
- [ ] All interactive elements functional
- [ ] Navigation links working
- [ ] Progress tracking operational
- [ ] Files committed to GitHub
- [ ] Execution plan updated

---

## TECHNICAL STANDARDS

### HTML Structure Requirements
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Module Title | Blue Collar Business School</title>
    <link rel="stylesheet" href="../../assets/css/global.css">
    <link rel="stylesheet" href="module-specific.css">
</head>
<body>
    <!-- Header with navigation -->
    <!-- Main content area -->
    <!-- Interactive elements -->
    <!-- Progress tracking -->
    <!-- Footer with navigation -->
    <script src="../../assets/js/core.js"></script>
    <script src="module-specific.js"></script>
</body>
</html>
```

### Mobile-First Requirements
- **Responsive Design**: Works perfectly on phones (primary device)
- **Touch-Friendly**: All buttons minimum 44px tap target
- **Fast Loading**: <3 seconds on mobile data
- **Offline Capable**: Core functionality works without internet
- **Progress Saves**: localStorage for completion tracking

### JavaScript Standards
- **Vanilla JavaScript**: No external dependencies
- **Progressive Enhancement**: Works without JavaScript
- **Error Handling**: Graceful fallbacks for all functionality
- **Performance**: Optimized for mobile devices
- **Compatibility**: ES6+ with fallbacks for older browsers

---

## CONTENT CREATION GUIDELINES

### Learning Module Structure
Each module must include:
1. **Learning Objectives** (3-5 clear outcomes)
2. **Core Content** (practical, actionable information)
3. **Interactive Elements** (quiz, calculator, or assessment)
4. **Action Items** (specific tasks to complete)
5. **Progress Tracking** (completion status and next steps)

### Contractor-Specific Focus
- **Trade Examples**: Electrical, plumbing, HVAC, roofing specific scenarios
- **Real Numbers**: Use actual costs, margins, and timeframes from research
- **Local Variations**: Include state/regional differences where relevant
- **Practical Tools**: Everything must be immediately usable
- **Industry Insights**: Include insider knowledge from Contractor's Playbook

### Content Quality Standards
- **Actionable**: Every lesson includes immediate next steps
- **Specific**: Concrete examples with real numbers
- **Complete**: No partial information or "coming soon" placeholders
- **Tested**: All examples verified for accuracy
- **Current**: Industry data and regulations up to date

---

## GITHUB WORKFLOW

### Commit Message Standards
```
Add Module 1.1 lesson page and assessment quiz
Update startup cost calculator with state-specific data
Implement progress tracking for Stage 1 modules
Fix mobile responsiveness for calculator tools
```

### File Organization Protocol
```
/clients/Josh/bluecollarbusinessschool/
├── website/                           # Live site files
│   ├── index.html                     # Homepage
│   ├── modules/                       # All course modules
│   │   ├── stage-1/                   # Starting Business
│   │   ├── stage-2/                   # Getting Online
│   │   ├── stage-3/                   # Marketing & Leads
│   │   └── stage-4/                   # Growth & Scaling
│   ├── tools/                         # Standalone calculators
│   ├── assets/                        # CSS, JS, images
│   └── resources/                     # PDF downloads
├── reference-materials/               # Research and guides
├── documentation/                     # Project docs
└── AUTONOMOUS_EXECUTION_PLAN.md       # Current status
```

### Deployment Protocol
1. **Test Locally**: Verify all functionality
2. **Commit to GitHub**: Push all related files
3. **Deploy to Netlify**: Update live site
4. **Verify Deployment**: Test live functionality
5. **Update Documentation**: Record completion status

---

## PROGRESS TRACKING SYSTEM

### Session Documentation
After each work session, update:
- **AUTONOMOUS_EXECUTION_PLAN.md**: Mark completed tasks
- **Progress Metrics**: Files created, features implemented
- **Next Session Goals**: Clear priorities for continuation
- **Technical Notes**: Any issues or decisions for future reference

### Quality Metrics Per Session
- **Files Created**: Target 3-5 files under size limits
- **Functionality Added**: 1 complete feature or module
- **Mobile Testing**: All new elements verified
- **Documentation Updated**: Progress and next steps recorded

### Long-term Milestones
- **Stage 1 Complete**: 4 modules with all interactive elements
- **Stage 2 Complete**: 4 modules with digital marketing tools
- **Stage 3 Complete**: 4 modules with lead generation systems
- **Stage 4 Complete**: 4 modules with scaling strategies
- **Launch Ready**: Full platform with all 16 modules functional

---

## ERROR PREVENTION PROTOCOLS

### Common Pitfalls to Avoid
1. **Large Files**: Never create files >500 lines
2. **Incomplete Features**: Finish functionality before moving on
3. **Mobile Issues**: Always test on mobile viewport
4. **Broken Navigation**: Verify all links work
5. **Missing Documentation**: Update execution plan every session

### Quality Assurance Checklist
Before ending any session:
- [ ] All new files under line limits
- [ ] Mobile responsiveness confirmed
- [ ] Interactive elements functional
- [ ] Navigation links operational
- [ ] Progress tracking working
- [ ] Documentation updated
- [ ] GitHub committed
- [ ] Next session priorities clear

### Recovery Protocols
If session scope becomes too large:
1. **Immediate Stop**: Don't continue building
2. **Break Down**: Identify logical separation points
3. **File Split**: Create appropriately sized components
4. **Test Sections**: Ensure each part works independently
5. **Document Status**: Clear notes on completion state

---

## PROJECT SUCCESS CRITERIA

### Individual Module Standards
- **Complete**: All required elements functional
- **Tested**: Works on mobile and desktop
- **Optimized**: Fast loading and responsive
- **Accessible**: Meets basic accessibility standards
- **Documented**: Clear progress tracking

### Overall Platform Goals
- **Comprehensive**: Covers all aspects of contractor business
- **Practical**: Every element immediately usable
- **Professional**: High-quality user experience
- **Scalable**: Easy to maintain and expand
- **Successful**: Provides real value to contractor students

### Success Metrics
- **Module Completion Rate**: Target 90%+ user completion
- **Mobile Usage**: Optimized for primary device
- **Loading Speed**: <3 seconds on mobile data
- **User Satisfaction**: Clear, actionable content
- **Business Impact**: Measurable improvement in contractor success

---

## EMERGENCY PROTOCOLS

### If Session Runs Long
1. **Save Current State**: Commit partial work with clear notes
2. **Document Status**: What's complete vs in-progress
3. **Set Clear Next Step**: Specific resumption point
4. **Update Execution Plan**: Adjust priorities if needed

### If Technical Issues Arise
1. **Document Problem**: Clear description in commit message
2. **Implement Workaround**: Simple solution for now
3. **Note Future Fix**: Add to execution plan improvements
4. **Continue Progress**: Don't let issues block forward movement

### If Scope Creep Occurs
1. **Recognize Early**: Watch for expanding file sizes
2. **Stop and Reassess**: Identify core vs nice-to-have
3. **Break Apart**: Create logical file separations
4. **Document Decisions**: Clear notes on choices made

---

*These master instructions ensure Echo can operate autonomously on the Blue Collar Business School project with consistent quality, appropriate file management, and clear progress tracking. Always reference this document at the start of each session for optimal project execution.*