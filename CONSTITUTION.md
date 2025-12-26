# Repository Constitution

> **Purpose:** This repository serves as my professional development workspace, organized by life season and intention.

## Core Values

1. **CLARITY over cleverness** - Code should explain itself
2. **CONTEXT over categorization** - Meaning matters more than folder structure  
3. **KNOWLEDGE over code** - Preserve understanding, not just files
4. **MEANING over metrics** - Success is measured in growth, not just output

---

## Organization Principles

### 1. Seasonal Organization
Work is organized by **life seasons**, not just technology:
- Each season has clear purpose and timeframe
- Seasons are honored when complete, not deleted
- Transitions are documented with gratitude

### 2. Context-First Design
Every major directory contains:
- **CONTEXT.md** - Why this exists, what it means
- **Status markers** - ACTIVE, PENDING, COMPLETE
- **Clear boundaries** - What's in scope, what's not

### 3. AI Interpretability
Structure code so future AI collaborators can:
- Understand WHY each piece exists
- Distinguish between portfolio, active, and experimental code
- Provide meaningful assistance without hallucination

### 4. Personal Data Protection
- Personal files (CV, OTB, WMN, letters) are explicitly marked
- Never committed to main branches
- Always in designated personal/ directories with .gitignore

---

## Seasonal Transitions

When a life season completes (e.g., job search ends):

### Step 1: Celebrate Completion
Create `GRATITUDE.md` documenting:
- What was accomplished
- What was learned
- What it meant personally
- Value for future reference

### Step 2: Extract Learnings
Move reusable patterns to:
- `evergreen/` - Always-relevant code
- `meta/LEARNINGS.md` - Documented insights
- `meta/PATTERNS.md` - Reusable approaches

### Step 3: Archive with Dignity
```bash
# Mark as complete
rm ACTIVE
echo "$(date): Season complete - [reason]" > COMPLETE

# Move to archive
git mv contexts/SEASON-NAME contexts/archive/SEASON-NAME-COMPLETE

# Commit with gratitude
git commit -m "Season complete: [name] ends with gratitude"
```

### Step 4: Begin New Season
Create new context with:
- Clear CONTEXT.md explaining purpose
- ACTIVE marker showing current focus
- CONSTITUTION.md defining rules

---

## Ethical Guidelines

### For AI-Generated Content
1. All AI assistance must be transparent
2. AI-generated text (letters, documentation) must be reviewed
3. Never pass off AI work as entirely human without disclosure
4. Ground AI content in authentic personal voice

### For Personal Projects
1. Code should reflect genuine capabilities
2. Portfolio pieces should be work you understand deeply
3. Client work maintains highest integrity
4. Experimentation is encouraged but clearly labeled

### For Job Search (2025 Season)
1. Generated motivation letters must be authentic to my voice
2. No exaggeration of qualifications
3. Theoretical grounding (Buber, Levinas, Nagy) must be genuine
4. Human review required before any submission

---

## Repository Structure

```
workspace/
├── CONSTITUTION.md          (This file - guiding principles)
├── ARCHITECTURE.md          (How knowledge is organized)
│
├── contexts/
│   ├── 2025-job-search/     (Active: Job hunting)
│   │   ├── CONTEXT.md
│   │   ├── ACTIVE
│   │   └── [season code]
│   ├── evergreen/           (Always relevant)
│   │   └── [core tools]
│   └── archive/             (Completed seasons)
│       └── [past work]
│
├── portfolio/
│   └── [showcase pieces]
│
└── meta/
    ├── LEARNINGS.md         (Accumulated insights)
    ├── PATTERNS.md          (Reusable approaches)
    └── DECISIONS.md         (Architecture decisions)
```

---

## Success Criteria

This repository is successful if:

✅ **Future me understands past me** - Clear context preserves intent  
✅ **AI collaborators provide meaningful help** - No hallucination, accurate assistance  
✅ **Seasons are honored** - Completed work has dignity, not just deletion  
✅ **Knowledge compounds** - Learnings transfer across seasons  
✅ **Privacy is protected** - Personal data never leaks  
✅ **Portfolio shines** - Professional work is easily showcased  

---

## Living Document

This constitution evolves as I learn. Changes should be:
- Documented in git commits
- Reflected in seasonal practices
- Shared in meta/LEARNINGS.md

**Last Updated:** 2025-12-26  
**Current Season:** 2025 Job Search  
**Next Review:** When season transitions
