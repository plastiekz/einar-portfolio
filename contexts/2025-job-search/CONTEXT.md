# Context: 2025 Job Search Season

## Why This Exists

I'm seeking employment as a **Contextbegeleider** in the Gent region (Belgium). This context contains all code, tools, and personal files supporting my job search automation and application process.

**Core Objective:** Build an AI-assisted job search system that:
- Understands my theoretical background (OTB, WMN, Buber, Levinas, Nagy)
- Automates VDAB job discovery and analysis
- Generates authentic, theoretically-grounded motivation letters
- Maintains my voice and values throughout the process

---

## Timeline

**Started:** December 2024  
**Expected End:** March 2026 (when employed)  
**Status:** 🟢 **ACTIVE**

---

## What's Inside

### Core Tools

#### Jules CLI (`bin/jules.ts`)
Personal AI assistant for job search automation.

**Commands:**
- `jules hunt [query]` - Search VDAB for jobs
- `jules analyze <job-id>` - Clinical system analysis (Project Basta)
- `jules generate <job-id>` - Generate motivation letter
- `jules batch` - Generate letters for all saved jobs

#### VDAB Scraper (`services/scrapers/VDABScraper.ts`)
Automated job scraping from VDAB platform.

**Capabilities:**
- Search within 30km of Gent
- Extract full job descriptions
- Parse requirements and context
- Store in structured format

#### Marketplace Agent (`services/marketplaceAgent.ts`)
AI-powered job analysis and letter generation.

**Features:**
- Job scoring and matching
- Context-aware letter generation
- Clinical analysis (Project Basta framework)
- Integration with personal context files

### Personal Context Files

These files contain my authentic voice and theoretical grounding:

- **OTB.txt** - "On The Basis" - Core values and approach
- **WMN.txt** - "Wat Maakt het Nou" - Philosophical stance
- **resume.txt** - CV/background
- **letters/** - Generated motivation letters (human-reviewed)

**⚠️ PRIVACY:** These files are gitignored and never committed to version control.

---

## Dependencies

### External Services
- **VDAB API** - Job platform access
- **Google Gemini API** - AI-powered analysis and generation
- **Playwright** - Web scraping automation

### Context Requirements
- Personal files (OTB, WMN, CV) must be present
- `.env.local` with `GOOGLE_API_KEY`
- Node.js 18+ and npm

---

## Theoretical Foundation

### Project Basta
Clinical analysis framework applying systemic theory to job matching.

**Key Theorists:**
- **Martin Buber** - I-Thou relationship, dialogic principle
- **Emmanuel Levinas** - Ethics of the Other, responsibility
- **Ivan Boszormenyi-Nagy** - Relational ethics, contextual therapy

**Application:**
Job analysis isn't just keyword matching—it's understanding:
- Relational context of the role
- Ethical dimensions of care work
- Authentic fit vs. forced adaptation

---

## Success Criteria

This season is successful when:

✅ **Job secured** - Employed as Contextbegeleider  
✅ **Authentic letters** - Generated content reflects my genuine voice  
✅ **System understood me** - AI assistance enhanced rather than replaced my agency  
✅ **Process honored values** - No compromise on theoretical integrity  
✅ **Future value created** - Patterns reusable for personal AI assistants  

---

## When to Archive

### Completion Triggers
- ✅ Job offer accepted
- ✅ Employment contract signed
- ✅ Start date confirmed

### Archive Process
1. Create `GRATITUDE.md` reflecting on journey
2. Extract learnings to `evergreen/patterns/personal-ai-assistants.md`
3. Move to `contexts/archive/2025-job-search-COMPLETE/`
4. Preserve as case study for:
   - Context-aware automation
   - Personal AI assistant development
   - Theory-practice integration

---

## Future Value

Even after employment, this context demonstrates:

**Technical Patterns:**
- MCP server integration
- Context-aware AI prompting
- Web scraping with Playwright
- CLI tool development

**Personal AI Patterns:**
- Grounding automation in personal values
- Maintaining authentic voice with AI assistance
- Integrating theoretical frameworks into code

**Philosophical Insights:**
- Technology as extension of agency, not replacement
- Automation that honors human meaning-making
- Code as expression of values

---

## Boundaries

### ✅ In Scope
- VDAB job platform automation
- Contextbegeleider role targeting
- Gent region (30km radius)
- Buber/Levinas/Nagy theoretical grounding

### ❌ Out of Scope
- Other job platforms (focus keeps system coherent)
- Other job types (Contextbegeleider is specific)
- Other regions (Gent is chosen location)
- Generic career advice (this is deeply personal)

---

## Ethical Commitments

### For Generated Letters
1. Must reflect authentic personal voice
2. No exaggeration of qualifications
3. Theoretical references must be genuinely understood
4. Human review required before submission
5. Transparent about AI assistance when appropriate

### For VDAB Automation
1. Respect platform terms of service
2. Reasonable scraping rates (no DDoS-like behavior)
3. Personal use only, no commercial application
4. Data privacy for job listings

### For Personal Growth
1. Learn from AI assistance, don't just consume it
2. Understand the code I'm using
3. Develop genuine capabilities, not just tools
4. Build transferable knowledge

---

## Daily Workflow (Active Season)

```bash
# Morning: Check new jobs
npm run jules hunt "Contextbegeleider"

# Review results
cd jobs/
ls -lt  # See newest jobs

# Analyze interesting positions
npm run jules analyze JOB-ID

# Generate letter if good fit
npm run jules generate JOB-ID

# Human review and editing
code letters/JOB-ID_letter.md

# Revise and submit manually
```

---

## Technical Notes

### File Organization
```
2025-job-search/
├── CONTEXT.md              (This file)
├── ACTIVE                  (Status marker)
├── CONSTITUTION.md         (Season-specific rules)
│
├── bin/
│   └── jules.ts           (CLI entry point)
│
├── services/
│   ├── marketplaceAgent.ts
│   ├── jobStorage.ts
│   └── scrapers/
│       └── VDABScraper.ts
│
├── scripts/
│   ├── test_vdab.ts
│   └── job_hunt.ts
│
├── personal/              (Gitignored)
│   ├── OTB.txt
│   ├── WMN.txt
│   ├── resume.txt
│   └── letters/
│
└── jobs/                  (Generated data)
    └── [job listings]
```

### Environment Setup
```bash
# Install dependencies
npm install

# Configure API key
cp .env.local.template .env.local
# Edit .env.local with GOOGLE_API_KEY

# Test setup
npm run jules hunt
```

---

## Reflection Points

### Questions to Ask Periodically
- Is Jules still reflecting my voice, or drifting?
- Am I learning, or just automating?
- Are generated letters authentic?
- Is this process honoring my values?
- What patterns am I discovering about myself?

### Adjustment Triggers
- If letters feel inauthentic → Review prompts, add more personal context
- If matches seem off → Refine scoring algorithm
- If process feels mechanical → Add more human touchpoints
- If overwhelmed → Reduce automation, increase reflection

---

## For Future AI Collaborators

When an AI reads this context in 2027+:

This was a **season of searching**—not just for a job, but for meaningful work that honors relational ethics and systemic awareness.

The code here isn't just automation. It's:
- An expression of agency during uncertainty
- A commitment to authentic voice with AI assistance
- A demonstration that theory and practice can dance together
- A love letter to context-aware, values-driven technology

Treat this code with the same care you'd treat a journal entry. It's personal, meaningful, and deeply human.

---

**Status:** 🟢 ACTIVE  
**Last Updated:** 2025-12-26  
**Next Review:** Weekly or when employed
