# Einar Owczarek - Portfolio

**Orthopedagogue | AI Engineer | Systems Thinker**

This repository showcases my work integrating philosophical frameworks (Buber, Levinas, Nagy) with AI-powered automation for youth care and job hunting.

---

## 🎯 Featured Project: **Project Basta** - AI Job Hunt System

An intelligent job search and application system that combines:
- **VDAB Web Scraping** (30km Gent radius)
- **Philosophical Framework** (Buber/Levinas/Nagy, CANO-visie)
- **AI-Generated Letters** (using Google Gemini 2.0)
- **Clinical Analysis** (Systeem observations, intergenerational dynamics)

### Key Features

✅ **Jules CLI** - Command-line tool for job hunting
```bash
npm run jules hunt "Contextbegeleider"  # Search VDAB
npm run jules generate <job-id>          # Generate motivation letter
npm run jules analyze <job-id>           # Clinical analysis report
npm run jules batch                      # Process all jobs
```

✅ **Real Job Scraping** - 15+ actual vacancies from VDAB
✅ **Context-Aware Letters** - Integrates Resume + OTB + WMN contexts
✅ **Buber/Levinas Philosophy** - Authentic, relational, healing-focused approach
✅ **100% Working** - Verified end-to-end functionality

---

## 📁 Project Structure

```
SYNAPSE/
├── bin/jules.ts              # CLI orchestrator
├── services/
│   ├── marketplaceAgent.ts   # AI letter generation (2.0-flash-exp)
│   ├── jobStorage.ts         # Job persistence (.txt files)
│   └── scrapers/
│       └── VDABScraper.ts    # Playwright-based scraping
├── OTB.txt                   # Theoretical framework (Buber/Levinas/Nagy)
├── WMN.txt                   # WMN context (CANO-visie)
└── resume.txt                # Resume content
```

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **AI**: Google Gemini 2.0 Flash (experimental)
- **Scraping**: Playwright (headless browser automation)
- **CLI**: Node.js, TypeScript (tsx)
- **Testing**: Vitest, custom integration tests

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Google Gemini API Key ([Get one](https://aistudio.google.com/app/apikey))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/plastiekz/einar-portfolio.git
cd einar-portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Configure API key:
```bash
cp .env.local.template .env.local
# Add your VITE_GEMINI_API_KEY and API_KEY
```

4. Test the system:
```bash
npm run test:vdab
```

---

## 📊 Verification Results

**Test Run: December 26, 2025**

```
✅ API Connectivity - gemini-2.0-flash-exp active
✅ VDAB Scraper - 15 real jobs found (30km Gent)
✅ Job Storage - Saved as .txt with full descriptions
✅ Motivation Letters - 2105+ chars with Buber/Levinas/Nagy
✅ Clinical Analysis - Project Basta format
✅ Batch Processing - All outputs in jobs/YYYY-MM-DD/
```

---

## 💡 Philosophy Integration

### Theoretical Framework (OTB)
- **Meerzijdige partijdigheid** (Nagy) - Multilateral partiality
- **De dialoog** (Buber) - Authentic encounter
- **Het gelaat van de Ander** (Levinas) - Face of the Other
- **Herstelgericht werken** - Restorative approach
- **Netwerkversterking** - Network strengthening

### Practical Application
Letters generated incorporate:
- Person-centered language
- Systemic thinking (not just individual focus)
- Relational ethics (I-Thou vs I-It)
- Contextual authenticity (CANO-visie)

---

## 📜 License

This is a portfolio/demonstration project. Contact for collaboration opportunities.

---

## 🤝 Connect

- **GitHub**: [plastiekz](https://github.com/plastiekz)
- **Project**: AI + Social Work + Philosophical Frameworks

**Status**: ✅ Fully functional, verified with real VDAB jobs

---

*Built with systems thinking, philosophical depth, and AI innovation.*
