# testgen

An AI-powered test case generator for QA engineers. Paste a spec, PRD, or acceptance criteria and get structured, exportable test cases in seconds.

---

## Features

- **Multi-provider** — Anthropic (Claude), OpenAI (GPT), Google (Gemini), OpenRouter (all providers with one key)
- **Spec input** — paste directly or upload `.txt` / `.md` files
- **Optional memory file** — inject project context, domain knowledge, or prior session notes into every generation
- **Optional custom instructions** — enforce QA conventions, naming rules, or coverage requirements
- **Configurable generation** — set exact test case count (1–100), toggle edge/security coverage
- **Selective edit** — modify a single test case with plain-English instructions; all others stay untouched
- **Filter by type** — positive, negative, edge, security, performance
- **Export** — JSON, Markdown, CSV

---

## Quick Start

```bash
# 1. Clone or copy project files
git clone https://github.com/your-org/testgen.git
cd testgen

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev

# 4. Open http://localhost:5173
```

---

## Project Structure

```
testgen/
├── src/
│   ├── App.jsx          # Main application (single-file React component)
│   └── main.jsx         # React entry point
├── public/
│   └── vite.svg
├── docs/
│   └── memory-schema.md # Memory file format reference
│   └── instructions-examples.md
├── examples/
│   ├── memory.json      # Example memory file
│   └── instructions.txt # Example custom instructions
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

---

## Providers & Models

| Provider | Models | Key format |
|---|---|---|
| **Anthropic** | Claude Opus 4.6, Sonnet 4.6, Haiku 4.5 | `sk-ant-api03-...` |
| **OpenAI** | GPT-5.4, GPT-5.4 Mini, GPT-5.4 Nano, o3, o4-mini, GPT-4o Mini | `sk-proj-...` |
| **Gemini** | Gemini 2.5 Pro, 2.5 Flash, 2.5 Flash Lite | `AIza...` |
| **OpenRouter** | Claude, GPT, Gemini, Llama, Mistral, and more | `sk-or-v1-...` |

> **OpenRouter** gives you a single API key for all providers with no extra installation. Sign up free at [openrouter.ai](https://openrouter.ai). You pay only for token usage at market rates.

---

## Memory File

An optional JSON or plain-text file injected into every generation prompt as background context. Useful for encoding project-specific knowledge that shouldn't be re-pasted every time.

**Example `memory.json`:**
```json
{
  "project": "Nivi Health Platform",
  "stack": "Node.js, PostgreSQL, WhatsApp Bot (Turn.io)",
  "conventions": {
    "id_format": "TC-XXX",
    "severity_levels": ["S1", "S2", "S3", "S4"],
    "environments": ["dev", "staging", "production"]
  },
  "known_risks": [
    "WhatsApp message delivery is async — tests should not assume immediate delivery",
    "Database writes must be tested for idempotency"
  ]
}
```

See [`docs/memory-schema.md`](./docs/memory-schema.md) for full schema reference.

---

## Custom Instructions File

A plain-text or Markdown file that prepends QA rules and conventions to the generation prompt. Think of it as a persistent system prompt for test generation.

**Example `instructions.txt`:**
```
Always include at least one test case for rate limiting on any API endpoint.
Tag all authentication-related cases with "auth".
Steps must start with the actor: "User clicks...", "System returns...", "Admin navigates..."
Preconditions must be explicit — never write "N/A".
```

See [`examples/instructions.txt`](./examples/instructions.txt) for a full example.

---

## Export Formats

| Format | Contents | Use case |
|---|---|---|
| **JSON** | Full structured data | Feed into other tools, CI scripts |
| **Markdown** | Human-readable report | Confluence, Notion, GitHub wikis |
| **CSV** | Flat table | Excel, Google Sheets, TestRail import |

---

## Selective Edit

Each generated test case has an **✎ edit** button. Click it to open an inline instruction field scoped to only that test case. The model receives only the target case and your instruction — no other cases are re-generated or touched.

**Example instructions:**
- `"Add a step to verify the confirmation email is sent to the correct address"`
- `"Change priority to high and add tags: auth, regression"`
- `"Split this into two separate cases — one for null input, one for empty string"`

---

## API Key Security

- API keys are stored **only in React component state** — they are never written to disk, localStorage, or sent anywhere except the provider's official API endpoint
- Keys are masked by default (password input) with a toggle to reveal
- No key is ever logged or transmitted through any proxy

---

## Development

```bash
npm run dev      # Start dev server (Vite, hot reload)
npm run build    # Production build → dist/
npm run preview  # Preview production build locally
```

### Adding or removing models

All models live in the `PROVIDERS` object at the top of `src/App.jsx`. Each provider has a `models` array — add or remove entries there.

**Model entry shape:**

```js
{ id: "model-id", label: "Display Name", tier: "powerful|balanced|fast|reasoning", desc: "Short description" }
```

| Field | Description |
|---|---|
| `id` | Exact model ID sent to the API. Must match what the provider expects. |
| `label` | Name shown in the UI dropdown. |
| `tier` | Badge colour: `powerful` (red), `balanced` (yellow), `fast` (green), `reasoning` (purple). |
| `desc` | One-line description shown under the label. |

**Example — adding a Gemini model:**

```js
gemini: {
  models: [
    { id: "gemini-2.0-flash",      label: "Gemini 2.0 Flash",      tier: "balanced", desc: "Fast & capable" },
    // add here:
    { id: "gemini-1.5-pro-002",    label: "Gemini 1.5 Pro 002",    tier: "powerful", desc: "Stable long context" },
  ],
},
```

To remove a model, delete its line. The first entry in the array becomes the default selection for that provider.

**Where to find valid model IDs:**

- **Anthropic** — https://docs.anthropic.com/en/docs/about-claude/models
  Use the full versioned ID (e.g. `claude-haiku-4-5-20251001`). Short aliases may not be accepted.
- **OpenAI** — https://platform.openai.com/docs/models
  Current flagship is the `gpt-5.4` series. `gpt-4o` is retired; `gpt-4.1` series is deprecated. Note: `o3` / `o4-mini` use `max_completion_tokens` instead of `max_tokens` — if you add an o-series model and get API errors, update `callOpenAICompat` in `App.jsx` accordingly.
- **Gemini** — https://ai.google.dev/gemini-api/docs/models
  Current stable IDs are `gemini-2.5-pro`, `gemini-2.5-flash`, and `gemini-2.5-flash-lite` (short aliases, no dated suffix). The 1.5 series is retired and the 2.0 series is deprecated — avoid both.
- **OpenRouter** — https://openrouter.ai/models
  IDs are always prefixed with the provider slug and use dots in version numbers, e.g. `anthropic/claude-sonnet-4.6` (note: dot, not hyphen). Current lineup includes `openai/gpt-5.4`, `google/gemini-3.1-pro-preview`, and `mistralai/mistral-small-2603`.

### Adding a new provider

1. Add an entry to the `PROVIDERS` object in `App.jsx`
2. Add a caller function (follow the pattern of `callAnthropic`, `callOpenAICompat`, `callGemini`)
3. Add a branch in `callModel()`

---

## License

MIT
