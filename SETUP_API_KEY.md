# Veilig je Gemini API Key instellen voor Project Basta

## Stap 1: API Key verkrijgen
1. Ga naar [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Klik op "Create API Key"
3. Kopieer de key (bewaar deze veilig!)

## Stap 2: `.env.local` bestand aanmaken

Maak een nieuw bestand aan: `c:\Users\Einar\Desktop\SYNAPSE\SYNAPSE\.env.local`

Plak hierin:
```
VITE_GEMINI_API_KEY=jouw_api_key_hier
API_KEY=jouw_api_key_hier
```

**Vervang `jouw_api_key_hier` met je echte API key.**

## Stap 3: Verifiëren

Run dit commando om te testen:
```bash
npm run test:vdab
```

Of test de API verbinding:
```bash
npx tsx scripts/test_api_simple.ts
```

## Veiligheid ✅

- ✅ `.env.local` staat in `.gitignore` (wordt niet gecommit)
- ✅ De key blijft lokaal op je machine
- ✅ Nooit de key hardcoden in source files
- ✅ Gebruik alleen voor persoonlijke projecten

## Jules Commands (na setup)

```bash
# Zoek jobs op VDAB (30km rond Gent)
npm run jules hunt "Contextbegeleider"

# Genereer motivatiebrief (met Buber/Levinas/Nagy)
npm run jules generate <job-id>

# Klinische analyse (Project Basta)
npm run jules analyze <job-id>

# Batch: letters voor alle jobs
npm run jules batch
```

## Troubleshooting

**400 Bad Request?** → Check of de API key correct is in `.env.local`
**No API Key found?** → Controleer dat het bestand `.env.local` heet (niet `.txt`)
