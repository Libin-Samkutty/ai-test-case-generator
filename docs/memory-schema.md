# Memory File Schema Reference

The memory file is an optional JSON or plain-text file you load into testgen to provide persistent background context for every generation session. It is injected directly into the AI prompt before your spec.

---

## When to use a memory file

- You work on the same project every day and don't want to re-paste tech stack, conventions, or domain context
- Your team has specific QA conventions the model should always follow (use `instructions.txt` for rules, memory for facts)
- You want to carry forward knowledge about known bugs, risky areas, or out-of-scope items

---

## Supported formats

| Format | Notes |
|---|---|
| `.json` | Recommended. Structured, easy to maintain. |
| `.txt` | Free-form text. Good for narrative context. |
| `.md` | Markdown. Good for mixed prose + structure. |

---

## JSON Schema (all fields optional)

```json
{
  "project": "string — project or product name",
  "version": "string — current version or sprint",

  "stack": {
    "frontend": "string",
    "backend": "string",
    "database": "string",
    "infrastructure": "string"
  },

  "conventions": {
    "id_format": "string — e.g. TC-XXX or PROJ-TC-XXX",
    "priority_levels": ["array", "of", "strings"],
    "severity_levels": ["array", "of", "strings"],
    "environments": ["array", "of", "strings"],
    "test_types": ["array", "of", "strings"]
  },

  "known_risks": [
    "string — describe known technical risks that should influence test design"
  ],

  "out_of_scope": [
    "string — what should NOT be tested (third-party systems, deferred features)"
  ],

  "personas": {
    "key": "string — describe a user persona the model can reference in test steps"
  },

  "custom": {
    "any_key": "any_value — add any domain-specific context you need"
  }
}
```

---

## Tips

- Keep the file under ~2000 tokens (~1500 words) for best results. Extremely large context files can dilute the model's focus on your actual spec.
- The memory file provides **facts**. Use `instructions.txt` for **rules** (what to do / how to format).
- Commit your memory file to version control alongside your specs so the whole team uses consistent context.
- You can maintain separate memory files per project or per sprint and swap them as needed.
