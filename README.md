# testgen

An AI-powered test case generator for QA engineers. Paste a spec, PRD, or acceptance criteria and get structured, exportable test cases in seconds.

---

## Features

- **Multi-provider** — Anthropic (Claude), OpenAI (GPT), Google (Gemini), OpenRouter (all providers with one key)
- **Spec input** — paste directly or upload `.txt` / `.md` files
- **Generation presets** — one-click Smoke, Regression, Security, or Custom profiles
- **Session persistence** — spec, config, and results survive page refresh automatically
- **Session history** — last 10 generations saved; click any entry to restore it
- **Optional memory** — inject project context via file upload or inline text
- **Optional custom instructions** — enforce QA conventions, naming rules, or coverage requirements
- **Configurable generation** — set exact test case count (1–100), toggle edge/security coverage
- **Incremental generation** — add more test cases to an existing set without replacing it
- **Inline manual editing** — click ✏ on any card to edit fields directly (no AI call, no tokens)
- **AI-assisted edit** — click ✦ AI on any card for plain-English AI modifications to a single case
- **Delete test cases** — remove individual cases from the set in inline edit mode
- **Filter by type** — positive, negative, edge, security, performance
- **Export** — JSON, Markdown, CSV, TestRail CSV, XRAY/Jira CSV

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

## Session Persistence

Your work is saved automatically. Every time the spec, config, or generated results change, they are written to `localStorage`. On the next page load, everything is restored — no manual saving needed.

**What persists across refresh:**
- Specification text
- Provider, model, and generation config
- All generated and manually edited test cases

**API key (opt-in):** Check "Remember key in browser" below the key input to persist it in `localStorage`. Leave it unchecked to keep the key in memory only (cleared on refresh).

---

## Generation Presets

Four preset profiles are available above the config inputs:

| Preset | Count | Edge/Security | Focus |
|---|---|---|---|
| **Smoke** | 5 | Off | Critical happy-path flows only |
| **Regression** | 20 | On | Full coverage: positive, negative, edge, boundary |
| **Security** | 10 | On | Auth, injection, data-validation attack vectors |
| **Custom** | Manual | Manual | Free-form — add your own focus instructions |

Clicking a preset pre-fills the count and edge toggle and injects a focus instruction. Selecting **Custom** shows a free-text field for your own instructions; you still control count and edge toggle manually.

---

## Session History

The last 10 generations are saved automatically in `localStorage`. The **History** panel in the sidebar lists each entry with the feature name, timestamp, and test case count.

- Click any entry to **restore** that session (spec + all test cases)
- Click **clear** to wipe all history

---

## Incremental Generation ("Add More")

After generating an initial set, click **＋ More** in the output toolbar. This sends a new generation request that avoids repeating any existing test case IDs and appends the results with correctly renumbered IDs (`TC-00N` continuing from the last).

Use this to grow a suite iteratively — generate a Smoke set first, then add more edge cases — without losing manual edits.

---

## Inline Manual Editing

Each generated test case has a **✏** (pencil) button in the card header. Clicking it switches the card into direct editing mode — no AI call, no waiting, no token cost.

**What you can edit inline:**
- Title, type (dropdown), and priority (dropdown)
- Preconditions
- Steps — edit each step, add new rows with **+**, remove with **×**
- Expected result
- Tags — click existing tags to remove, type a new tag and press Enter or comma to add

Click **✓ Save** to apply or **Discard** to revert. A **🗑 Delete** button removes the case from the set.

---

## AI-Assisted Edit

Each card also has a **✦ AI** button for model-powered modifications to a single case. The model receives only that test case and your instruction — all other cases stay untouched.

**Example instructions:**
- `"Add a step to verify the confirmation email is sent to the correct address"`
- `"Change priority to high and add tags: auth, regression"`
- `"Split this into two separate cases — one for null input, one for empty string"`

---

## Memory

An optional context block injected into every generation prompt as background knowledge. Useful for project-specific terminology, stack details, known risks, or QA conventions that shouldn't be re-pasted each time.

**Two ways to provide memory:**
1. Upload a `.json`, `.txt`, or `.md` file via the Memory panel
2. Type or paste directly into the inline text area below the file drop

**Example content:**
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

## Custom Instructions

A plain-text or Markdown block that prepends QA rules and conventions to every generation prompt. Think of it as a persistent system prompt for test generation.

**Two ways to provide instructions:**
1. Upload a `.txt` or `.md` file via the Custom Instructions panel
2. Type or paste directly into the inline text area below the file drop

> Note: Selecting a preset (Smoke, Regression, Security) will replace the instructions field with the preset's focus text. Switch to **Custom** or clear the field to write your own.

**Example content:**
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
| **CSV** | Flat table | Excel, Google Sheets |
| **TestRail CSV** | Title, Section, Template, Type, Priority, Steps, Expected Result | Direct TestRail import |
| **XRAY CSV** | Issue ID, Issue Type, Summary, Description, Steps, Expected Result, Labels, Priority | Jira XRAY import |

All export buttons appear in the output toolbar once test cases are generated.

---

## API Key Security

- API keys are stored **only in React component state** by default — never written to disk and never sent anywhere except the provider's official API endpoint
- **"Remember key in browser"** checkbox (below the key input) is **opt-in** — only when checked is the key written to `localStorage`
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
    { id: "gemini-2.5-pro",   label: "Gemini 2.5 Pro",   tier: "powerful", desc: "Most capable" },
    // add here:
    { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", tier: "balanced", desc: "Speed + quality" },
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
