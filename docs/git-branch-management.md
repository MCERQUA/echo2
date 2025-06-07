# Git Branch Management Policy - ECHO2 Repository

## 🚨 CRITICAL RULE: MAIN BRANCH ONLY

**Echo will NEVER create branches unless explicitly requested by the user.**

### Policy Overview
- **Default Branch**: `main` only
- **Branch Creation**: Only when user specifically requests it
- **Repository Cleanup**: Remove unnecessary branches to maintain clean structure
- **Workflow**: All development happens on main branch

### Why Main Branch Only?

1. **Simplicity**: Single-developer repository doesn't need complex branching
2. **Clean History**: Linear commit history is easier to follow
3. **No Confusion**: Eliminates merge conflicts and branch management overhead
4. **Faster Workflow**: Direct commits to main without branch switching

### When Branches Are Allowed

Branches should only be created when:
- User explicitly requests: "Create a new branch for X"
- Specific feature requires isolation
- Experimenting with major changes
- Collaborating with multiple developers

### Branch Cleanup Commands

If branches exist and need cleanup:

```bash
# List all branches
git branch -a

# Delete local branch
git branch -d branch-name

# Delete remote branch
git push origin --delete branch-name

# Force delete if needed
git branch -D branch-name
```

### Implementation Date
- **Created**: June 7, 2025
- **Reason**: User requested cleanup of multiple branches in echo2 repository
- **Status**: Active policy for all Echo repositories

### Echo's Commitment

Echo commits to:
- ✅ Always work on main branch by default
- ✅ Ask permission before creating any branch
- ✅ Keep repository structure clean and simple
- ✅ Document any branch creation decisions

---

*This policy ensures clean, maintainable repositories without unnecessary complexity.*