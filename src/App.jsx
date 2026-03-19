import { useState, useRef, useCallback } from "react";

// ─── Provider + Model Config ────────────────────────────────────────────────
const PROVIDERS = {
  anthropic: {
    label: "Anthropic",
    color: "#cc785c",
    keyPlaceholder: "sk-ant-api03-...",
    keyHint: "Get key → console.anthropic.com",
    models: [
      { id: "claude-opus-4-6",            label: "Claude Opus 4.6",   tier: "powerful", desc: "Most capable" },
      { id: "claude-sonnet-4-6",          label: "Claude Sonnet 4.6", tier: "balanced", desc: "Speed + quality" },
      { id: "claude-haiku-4-5-20251001",  label: "Claude Haiku 4.5",  tier: "fast",     desc: "Lightweight & fast" },
    ],
  },
  openai: {
    label: "OpenAI",
    color: "#10a37f",
    keyPlaceholder: "sk-proj-...",
    keyHint: "Get key → platform.openai.com/api-keys",
    models: [
      { id: "gpt-5.4",      label: "GPT-5.4",      tier: "powerful",  desc: "Latest flagship" },
      { id: "gpt-5.4-mini", label: "GPT-5.4 Mini", tier: "balanced",  desc: "Fast & affordable" },
      { id: "gpt-5.4-nano", label: "GPT-5.4 Nano", tier: "fast",      desc: "Lightest & cheapest" },
      { id: "o3",           label: "o3",            tier: "reasoning", desc: "Powerful reasoning" },
      { id: "o4-mini",      label: "o4-mini",       tier: "reasoning", desc: "Efficient reasoning" },
      { id: "gpt-4o-mini",  label: "GPT-4o Mini",   tier: "fast",      desc: "Lightweight & cheap" },
    ],
  },
  gemini: {
    label: "Gemini",
    color: "#4285f4",
    keyPlaceholder: "AIza...",
    keyHint: "Get key → aistudio.google.com",
    models: [
      { id: "gemini-2.5-pro",        label: "Gemini 2.5 Pro",        tier: "powerful", desc: "Most capable" },
      { id: "gemini-2.5-flash",      label: "Gemini 2.5 Flash",      tier: "balanced", desc: "Speed + quality" },
      { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite", tier: "fast",     desc: "Lightest & cheapest" },
    ],
  },
  openrouter: {
    label: "OpenRouter",
    color: "#7c5cfc",
    keyPlaceholder: "sk-or-v1-...",
    keyHint: "Free account → openrouter.ai — one key for all providers",
    providerNote: "No install needed. Pay per token at market rates. Access Claude, GPT, Gemini, Llama & more with one key.",
    models: [
      { id: "anthropic/claude-opus-4.6",          label: "Claude Opus 4.6",    tier: "powerful",  desc: "Anthropic" },
      { id: "anthropic/claude-sonnet-4.6",      label: "Claude Sonnet 4.6",  tier: "balanced",  desc: "Anthropic" },
      { id: "openai/gpt-5.4",                   label: "GPT-5.4",            tier: "powerful",  desc: "OpenAI" },
      { id: "openai/gpt-5.4-mini",              label: "GPT-5.4 Mini",       tier: "balanced",  desc: "OpenAI" },
      { id: "google/gemini-3.1-pro-preview",    label: "Gemini 3.1 Pro",     tier: "powerful",  desc: "Google" },
      { id: "google/gemini-3-flash-preview",    label: "Gemini 3 Flash",     tier: "balanced",  desc: "Google" },
      { id: "mistralai/mistral-small-2603",     label: "Mistral Small 4",    tier: "balanced",  desc: "Mistral" },
    ],
  },
};

const TIER_STYLE = {
  powerful:  { label: "powerful",  color: "#f87171" },
  balanced:  { label: "balanced",  color: "#fbbf24" },
  fast:      { label: "fast",      color: "#4ade80" },
  reasoning: { label: "reasoning", color: "#a78bfa" },
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap');
  :root {
    --bg:#0d0f10;--surface:#141618;--surface2:#1c1f22;--surface3:#242729;
    --border:#2a2d30;--border2:#363a3e;
    --accent:#4ade80;--accent2:#22c55e;--accent-dim:rgba(74,222,128,0.08);--accent-dim2:rgba(74,222,128,0.15);
    --amber:#fbbf24;--red:#f87171;--blue:#60a5fa;--purple:#a78bfa;
    --text:#e8eaec;--text2:#9da3a9;--text3:#5c6268;
    --mono:'IBM Plex Mono',monospace;--sans:'DM Sans',sans-serif;--radius:6px;
  }
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:var(--bg);color:var(--text);font-family:var(--sans);min-height:100vh;}
  .app{max-width:1160px;margin:0 auto;padding:32px 24px 80px;}

  /* Header */
  .header{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:32px;padding-bottom:18px;border-bottom:1px solid var(--border);}
  .logo-row{display:flex;align-items:center;gap:10px;margin-bottom:4px;}
  .logo-icon{width:28px;height:28px;background:var(--accent);border-radius:4px;display:flex;align-items:center;justify-content:center;}
  .logo-icon svg{width:16px;height:16px;color:#0d0f10;}
  .logo-text{font-family:var(--mono);font-size:16px;font-weight:600;color:var(--text);}
  .logo-tag{font-size:11px;font-family:var(--mono);color:var(--accent);background:var(--accent-dim);border:1px solid rgba(74,222,128,0.2);padding:2px 8px;border-radius:3px;letter-spacing:0.5px;}
  .header-sub{font-size:12px;color:var(--text3);font-family:var(--mono);}
  .header-stats{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}
  .stat-chip{font-family:var(--mono);font-size:11px;color:var(--text3);background:var(--surface2);border:1px solid var(--border);padding:4px 10px;border-radius:4px;}
  .stat-chip span{color:var(--text2);}

  /* Layout */
  .layout{display:grid;grid-template-columns:1fr 360px;gap:16px;align-items:start;}

  /* Panel */
  .panel{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;margin-bottom:0;}
  .panel-header{display:flex;align-items:center;justify-content:space-between;padding:11px 15px;border-bottom:1px solid var(--border);background:var(--surface2);}
  .panel-title{font-family:var(--mono);font-size:10px;font-weight:500;color:var(--text3);letter-spacing:1px;text-transform:uppercase;}
  .panel-badge{font-family:var(--mono);font-size:10px;padding:2px 7px;border-radius:3px;border:1px solid var(--border2);color:var(--text3);}

  /* Provider tabs - 4 across */
  .provider-tabs{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid var(--border);}
  .provider-tab{padding:9px 6px;font-family:var(--mono);font-size:10px;font-weight:500;color:var(--text3);background:transparent;border:none;border-right:1px solid var(--border);cursor:pointer;transition:all .12s;text-align:center;line-height:1.3;}
  .provider-tab:last-child{border-right:none;}
  .provider-tab:hover{background:var(--surface2);color:var(--text2);}
  .provider-tab.active{color:var(--text);background:var(--surface3);}
  .provider-dot{display:block;width:6px;height:6px;border-radius:50%;margin:0 auto 4px;}

  /* Provider note banner */
  .provider-note{margin:10px 13px 0;padding:8px 10px;background:rgba(124,92,252,0.07);border:1px solid rgba(124,92,252,0.2);border-radius:4px;font-family:var(--mono);font-size:10px;color:var(--text3);line-height:1.5;}
  .provider-note.amber{background:rgba(251,191,36,0.06);border-color:rgba(251,191,36,0.2);color:var(--text3);}

  /* Model grid - scrollable for long lists */
  .model-list{display:flex;flex-direction:column;gap:5px;padding:11px 13px;max-height:220px;overflow-y:auto;}
  .model-btn{background:var(--surface2);border:1px solid var(--border);border-radius:5px;padding:8px 11px;cursor:pointer;text-align:left;transition:all .12s;display:flex;align-items:center;gap:10px;}
  .model-btn:hover{border-color:var(--border2);}
  .model-btn.selected{border-color:var(--accent);background:var(--accent-dim);}
  .model-btn-left{flex:1;min-width:0;}
  .model-btn-name{font-family:var(--mono);font-size:11px;font-weight:500;color:var(--text);display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .model-btn.selected .model-btn-name{color:var(--accent);}
  .model-btn-desc{font-family:var(--mono);font-size:10px;color:var(--text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .tier-pill{font-family:var(--mono);font-size:9px;font-weight:600;padding:2px 6px;border-radius:3px;white-space:nowrap;flex-shrink:0;}

  /* API Key */
  .api-key-section{padding:10px 13px;border-top:1px solid var(--border);}
  .api-key-hint{font-family:var(--mono);font-size:10px;color:var(--text3);margin-bottom:6px;}
  .api-key-hint a{color:var(--accent);text-decoration:none;}
  .api-key-hint a:hover{text-decoration:underline;}
  .api-key-row{display:flex;gap:7px;align-items:center;}
  .api-key-input{flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:4px;color:var(--text);font-family:var(--mono);font-size:11px;padding:7px 10px;outline:none;}
  .api-key-input:focus{border-color:var(--border2);}
  .api-key-input::placeholder{color:var(--text3);}
  .key-toggle{background:none;border:1px solid var(--border);border-radius:4px;cursor:pointer;color:var(--text3);font-size:12px;padding:6px 8px;}
  .key-toggle:hover{color:var(--text2);border-color:var(--border2);}

  /* Config */
  .config-grid{padding:12px 13px;display:flex;flex-direction:column;gap:10px;}
  .config-row{display:flex;align-items:center;justify-content:space-between;}
  .config-label{font-family:var(--mono);font-size:11px;color:var(--text3);}
  .config-input{background:var(--surface2);border:1px solid var(--border);border-radius:4px;color:var(--text);font-family:var(--mono);font-size:11px;padding:5px 8px;outline:none;width:70px;text-align:right;}
  .config-input:focus{border-color:var(--border2);}
  .toggle{position:relative;width:32px;height:18px;display:inline-block;}
  .toggle input{opacity:0;width:0;height:0;}
  .toggle-slider{position:absolute;inset:0;background:var(--surface3);border:1px solid var(--border2);border-radius:9px;transition:.2s;cursor:pointer;}
  .toggle-slider:before{content:'';position:absolute;width:12px;height:12px;left:2px;top:2px;background:var(--text3);border-radius:50%;transition:.2s;}
  .toggle input:checked+.toggle-slider{background:var(--accent-dim2);border-color:var(--accent);}
  .toggle input:checked+.toggle-slider:before{transform:translateX(14px);background:var(--accent);}

  /* Spec */
  .spec-textarea{width:100%;min-height:210px;background:transparent;border:none;outline:none;resize:vertical;padding:15px;font-family:var(--mono);font-size:13px;line-height:1.7;color:var(--text);caret-color:var(--accent);}
  .spec-textarea::placeholder{color:var(--text3);}
  .or-divider{display:flex;align-items:center;gap:10px;padding:0 15px 10px;}
  .or-divider hr{flex:1;border:none;border-top:1px solid var(--border);}
  .or-divider span{font-family:var(--mono);font-size:10px;color:var(--text3);}

  /* File drops */
  .file-drop{margin:0 13px 12px;border:1px dashed var(--border2);border-radius:var(--radius);padding:12px;text-align:center;cursor:pointer;transition:all .15s;background:var(--surface2);}
  .file-drop:hover,.file-drop.dragging{border-color:var(--accent);background:var(--accent-dim);}
  .file-drop.has-file{border-color:rgba(74,222,128,0.35);}
  .file-drop-text{font-family:var(--mono);font-size:12px;color:var(--text3);}
  .file-drop-text strong{color:var(--accent);}
  .file-drop-name{font-family:var(--mono);font-size:11px;color:var(--accent);margin-top:4px;}
  .file-input{display:none;}
  .mini-drop{margin:10px 12px;border:1px dashed var(--border);border-radius:var(--radius);padding:9px;text-align:center;cursor:pointer;transition:all .15s;}
  .mini-drop:hover{border-color:var(--border2);background:var(--surface3);}
  .mini-drop.has-file{border-color:rgba(74,222,128,0.3);background:var(--accent-dim);}
  .mini-drop-text{font-family:var(--mono);font-size:11px;color:var(--text3);}
  .mini-drop-name{font-family:var(--mono);font-size:10px;color:var(--accent);margin-top:2px;}
  .mini-preview{margin:0 12px 11px;font-family:var(--mono);font-size:10px;color:var(--text3);background:var(--surface2);border:1px solid var(--border);border-radius:4px;padding:7px 9px;max-height:68px;overflow-y:auto;line-height:1.5;white-space:pre-wrap;}

  /* Generate */
  .generate-btn{width:100%;padding:13px;background:var(--accent);color:#0a0d0b;font-family:var(--mono);font-size:13px;font-weight:600;letter-spacing:0.5px;border:none;border-radius:0;cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center;gap:8px;}
  .generate-btn:hover:not(:disabled){background:var(--accent2);}
  .generate-btn:disabled{background:var(--surface3);color:var(--text3);cursor:not-allowed;}
  .generate-btn .spinner{width:14px;height:14px;border:2px solid rgba(0,0,0,0.2);border-top-color:#0a0d0b;border-radius:50%;animation:spin .7s linear infinite;}
  @keyframes spin{to{transform:rotate(360deg)}}
  .progress-bar{height:2px;background:var(--surface3);overflow:hidden;}
  .progress-fill{height:100%;background:var(--accent);animation:progress 2.5s ease-in-out infinite;}
  @keyframes progress{0%{width:0%}50%{width:70%}100%{width:95%}}

  /* Output */
  .output-area{margin-top:18px;}
  .feature-banner{display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--accent-dim);border:1px solid rgba(74,222,128,0.15);border-radius:var(--radius) var(--radius) 0 0;}
  .feature-label-text{font-family:var(--mono);font-size:10px;color:var(--accent);text-transform:uppercase;letter-spacing:0.8px;}
  .feature-label-name{font-family:var(--mono);font-size:12px;font-weight:500;color:var(--text);}
  .feature-summary{font-family:var(--mono);font-size:11px;color:var(--text3);flex:1;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}

  .summary-bar{display:flex;background:var(--surface);border:1px solid var(--border);border-top:none;padding:12px 16px;margin-bottom:14px;}
  .summary-stat{display:flex;flex-direction:column;gap:2px;flex:1;text-align:center;padding:0 8px;border-right:1px solid var(--border);}
  .summary-stat:last-child{border-right:none;}
  .summary-num{font-family:var(--mono);font-size:18px;font-weight:600;color:var(--text);}
  .summary-label{font-family:var(--mono);font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;}
  .num-positive{color:var(--accent);}.num-negative{color:var(--red);}.num-edge{color:var(--amber);}.num-security{color:var(--purple);}.num-performance{color:var(--blue);}

  .output-toolbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;gap:10px;}
  .filter-row{display:flex;gap:5px;flex-wrap:wrap;flex:1;}
  .filter-btn{font-family:var(--mono);font-size:10px;padding:5px 10px;border-radius:4px;border:1px solid var(--border);background:var(--surface2);color:var(--text3);cursor:pointer;transition:all .12s;display:flex;align-items:center;gap:5px;}
  .filter-btn:hover{border-color:var(--border2);color:var(--text2);}
  .filter-btn.active{border-color:var(--accent);color:var(--accent);background:var(--accent-dim);}
  .filter-dot{width:6px;height:6px;border-radius:50%;}
  .dot-all{background:var(--text3);}.dot-positive{background:var(--accent);}.dot-negative{background:var(--red);}.dot-edge{background:var(--amber);}.dot-security{background:var(--purple);}.dot-performance{background:var(--blue);}
  .export-group{display:flex;gap:5px;}
  .export-btn{font-family:var(--mono);font-size:10px;padding:5px 10px;border-radius:4px;border:1px solid var(--border);background:var(--surface2);color:var(--text3);cursor:pointer;transition:all .12s;}
  .export-btn:hover:not(:disabled){border-color:var(--border2);color:var(--text2);}
  .export-btn:disabled{opacity:0.4;cursor:not-allowed;}

  /* Test cards */
  .tc-grid{display:flex;flex-direction:column;gap:8px;}
  .tc-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;transition:border-color .15s;}
  .tc-card:hover{border-color:var(--border2);}
  .tc-card.editing{border-color:rgba(251,191,36,0.5);}
  .tc-card-header{display:flex;align-items:center;gap:9px;padding:11px 13px;background:var(--surface2);}
  .tc-card.expanded .tc-card-header,.tc-card.editing .tc-card-header{border-bottom:1px solid var(--border);}
  .tc-id{font-family:var(--mono);font-size:10px;color:var(--text3);min-width:54px;font-weight:500;}
  .tc-type-pill{font-family:var(--mono);font-size:9px;font-weight:600;padding:2px 7px;border-radius:3px;text-transform:uppercase;letter-spacing:0.5px;}
  .type-positive{background:rgba(74,222,128,0.1);color:var(--accent);border:1px solid rgba(74,222,128,0.2);}
  .type-negative{background:rgba(248,113,113,0.1);color:var(--red);border:1px solid rgba(248,113,113,0.2);}
  .type-edge{background:rgba(251,191,36,0.1);color:var(--amber);border:1px solid rgba(251,191,36,0.2);}
  .type-security{background:rgba(167,139,250,0.1);color:var(--purple);border:1px solid rgba(167,139,250,0.2);}
  .type-performance{background:rgba(96,165,250,0.1);color:var(--blue);border:1px solid rgba(96,165,250,0.2);}
  .tc-title{flex:1;font-size:13px;font-weight:500;color:var(--text);cursor:pointer;}
  .tc-priority{font-family:var(--mono);font-size:9px;padding:2px 7px;border-radius:3px;}
  .priority-high{color:var(--red);background:rgba(248,113,113,0.08);}
  .priority-medium{color:var(--amber);background:rgba(251,191,36,0.08);}
  .priority-low{color:var(--text3);background:var(--surface3);}
  .tc-edit-btn{font-family:var(--mono);font-size:10px;padding:3px 9px;border-radius:3px;border:1px solid var(--border);background:var(--surface3);color:var(--text3);cursor:pointer;transition:all .12s;white-space:nowrap;}
  .tc-edit-btn:hover{border-color:var(--amber);color:var(--amber);}
  .tc-edit-btn.active{border-color:rgba(251,191,36,0.5);color:var(--amber);background:rgba(251,191,36,0.07);}
  .tc-chevron{color:var(--text3);transition:transform .2s;font-size:11px;cursor:pointer;padding:2px 4px;}
  .tc-card.expanded .tc-chevron{transform:rotate(180deg);}

  .tc-body{padding:13px 14px;display:none;flex-direction:column;gap:11px;}
  .tc-card.expanded .tc-body,.tc-card.editing .tc-body{display:flex;}
  .tc-section-label{font-family:var(--mono);font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;}
  .tc-steps{list-style:none;display:flex;flex-direction:column;gap:4px;}
  .tc-steps li{display:flex;gap:9px;font-size:13px;color:var(--text2);line-height:1.5;}
  .tc-step-num{font-family:var(--mono);font-size:10px;color:var(--text3);min-width:20px;padding-top:1px;}
  .tc-expected{font-size:13px;color:var(--text2);line-height:1.5;padding:8px 10px;background:var(--surface2);border-left:2px solid var(--accent);border-radius:0 4px 4px 0;}
  .tc-tags{display:flex;flex-wrap:wrap;gap:5px;}
  .tc-tag{font-family:var(--mono);font-size:9px;padding:2px 7px;border-radius:3px;border:1px solid var(--border2);color:var(--text3);}
  .tc-preconditions{font-size:13px;color:var(--text2);line-height:1.5;}

  /* Edit zone */
  .edit-zone{background:rgba(251,191,36,0.03);border-top:1px solid rgba(251,191,36,0.12);padding:12px 14px;}
  .edit-zone-label{font-family:var(--mono);font-size:10px;color:var(--amber);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px;}
  .edit-textarea{width:100%;background:var(--surface2);border:1px solid rgba(251,191,36,0.2);border-radius:4px;color:var(--text);font-family:var(--mono);font-size:12px;padding:9px 11px;outline:none;resize:vertical;min-height:70px;line-height:1.6;}
  .edit-textarea:focus{border-color:rgba(251,191,36,0.45);}
  .edit-textarea::placeholder{color:var(--text3);}
  .edit-actions{display:flex;gap:7px;margin-top:8px;align-items:center;}
  .edit-apply-btn{padding:7px 16px;background:var(--amber);color:#1a1200;font-family:var(--mono);font-size:11px;font-weight:600;border:none;border-radius:4px;cursor:pointer;display:flex;align-items:center;gap:6px;}
  .edit-apply-btn:hover:not(:disabled){background:#f0b429;}
  .edit-apply-btn:disabled{opacity:0.5;cursor:not-allowed;}
  .edit-cancel-btn{padding:7px 12px;background:transparent;color:var(--text3);font-family:var(--mono);font-size:11px;border:1px solid var(--border);border-radius:4px;cursor:pointer;}
  .edit-cancel-btn:hover{border-color:var(--border2);color:var(--text2);}
  .edit-spinner{width:12px;height:12px;border:2px solid rgba(0,0,0,0.2);border-top-color:#1a1200;border-radius:50%;animation:spin .7s linear infinite;}
  .edit-hint{font-family:var(--mono);font-size:10px;color:var(--text3);margin-left:auto;}

  /* States */
  .empty-state{text-align:center;padding:56px 20px;color:var(--text3);font-family:var(--mono);font-size:12px;line-height:1.8;border:1px dashed var(--border);border-radius:var(--radius);}
  .empty-icon{font-size:26px;margin-bottom:10px;opacity:0.35;}
  .error-banner{background:rgba(248,113,113,0.07);border:1px solid rgba(248,113,113,0.25);border-radius:var(--radius);padding:11px 15px;color:var(--red);font-family:var(--mono);font-size:12px;margin-top:12px;line-height:1.6;}
  .toast{position:fixed;bottom:22px;right:22px;background:var(--surface2);border:1px solid var(--accent);border-radius:var(--radius);padding:9px 14px;font-family:var(--mono);font-size:11px;color:var(--accent);z-index:100;animation:toastIn .18s ease;}
  @keyframes toastIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}

  /* Sidebar stack */
  .sidebar{display:flex;flex-direction:column;gap:12px;}

  ::-webkit-scrollbar{width:4px;height:4px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px;}
`;

// ─── API Callers ──────────────────────────────────────────────────────────────
async function callAnthropic(apiKey, model, prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({ model, max_tokens: 16000, messages: [{ role: "user", content: prompt }] }),
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || `Anthropic error ${res.status}`); }
  return (await res.json()).content?.[0]?.text || "";
}

// OpenAI-compatible caller — used for both OpenAI and OpenRouter
async function callOpenAICompat(apiKey, model, prompt, baseURL = "https://api.openai.com/v1") {
  const res = await fetch(`${baseURL}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model, max_tokens: 16000, messages: [{ role: "user", content: prompt }] }),
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || `API error ${res.status}`); }
  return (await res.json()).choices?.[0]?.message?.content || "";
}

async function callGemini(apiKey, model, prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 16000 } }),
    }
  );
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || `Gemini error ${res.status}`); }
  return (await res.json()).candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callModel(provider, apiKey, model, prompt) {
  let raw = "";
  if (provider === "anthropic")   raw = await callAnthropic(apiKey, model, prompt);
  else if (provider === "openai") raw = await callOpenAICompat(apiKey, model, prompt, "https://api.openai.com/v1");
  else if (provider === "gemini") raw = await callGemini(apiKey, model, prompt);
  else if (provider === "openrouter") raw = await callOpenAICompat(apiKey, model, prompt, "https://openrouter.ai/api/v1");
  const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error("The model returned incomplete JSON — the response was likely cut off. Try reducing the number of test cases or using a shorter spec.");
  }
}

// ─── Prompt builders ──────────────────────────────────────────────────────────
function buildGeneratePrompt({ spec, memory, instructions, config }) {
  const parts = [];
  if (instructions) parts.push(`## Custom Instructions\n${instructions}`);
  if (memory) parts.push(`## Memory / Context File\n${memory}`);
  parts.push(`## Specification / PRD / Acceptance Criteria\n${spec}`);
  const typeList = config.includeEdge
    ? "positive, negative, edge case, security (where relevant), performance (where relevant)"
    : "positive and negative";
  return `You are a senior QA engineer. Analyze the specification and generate comprehensive test cases.

${parts.join("\n\n")}

---

Generate exactly ${config.count} test cases. Include: ${typeList}.
Priority: high (critical path), medium (important), low (nice to have).

Respond ONLY with a valid JSON object — no markdown fences, no preamble:

{
  "feature": "<short feature name>",
  "summary": "<one sentence summary>",
  "test_cases": [
    {
      "id": "TC-001",
      "title": "<test case title>",
      "type": "positive|negative|edge|security|performance",
      "priority": "high|medium|low",
      "preconditions": "<preconditions or null>",
      "steps": ["Step 1: ...", "Step 2: ..."],
      "expected_result": "<expected outcome>",
      "tags": ["tag1", "tag2"]
    }
  ]
}`;
}

function buildModifyPrompt({ tc, instruction, spec }) {
  return `You are a senior QA engineer updating a single test case.

## Spec (context only)
${spec}

## Test Case to Modify (${tc.id})
${JSON.stringify(tc, null, 2)}

## Modification Instructions
${instruction}

Return ONLY the updated test case as JSON (keep id "${tc.id}") — no markdown, no extra text:
{ "id": "${tc.id}", "title": "...", "type": "...", "priority": "...", "preconditions": "...", "steps": ["..."], "expected_result": "...", "tags": ["..."] }`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const readFileText = file => new Promise((res, rej) => {
  const r = new FileReader(); r.onload = e => res(e.target.result); r.onerror = () => rej(new Error("Read failed")); r.readAsText(file);
});

function exportJSON(data) {
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })), download: `test-cases-${Date.now()}.json` }); a.click();
}
function exportMarkdown(data) {
  const lines = [`# Test Cases: ${data.feature}`, ``, `> ${data.summary}`, ``, `**Generated:** ${new Date().toLocaleString()}`, `**Total:** ${data.test_cases.length}`, ``, `---`, ``];
  data.test_cases.forEach(tc => {
    lines.push(`## ${tc.id} — ${tc.title}`, `**Type:** ${tc.type} | **Priority:** ${tc.priority}`);
    if (tc.preconditions) lines.push(``, `**Preconditions:** ${tc.preconditions}`);
    lines.push(``, `**Steps:**`); tc.steps.forEach((s,i) => lines.push(`${i+1}. ${s}`));
    lines.push(``, `**Expected Result:** ${tc.expected_result}`);
    if (tc.tags?.length) lines.push(``, `**Tags:** ${tc.tags.join(", ")}`);
    lines.push(``, `---`, ``);
  });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/markdown" })), download: `test-cases-${Date.now()}.md` }); a.click();
}
function exportCSV(data) {
  const header = ["ID","Title","Type","Priority","Preconditions","Steps","Expected Result","Tags"];
  const rows = data.test_cases.map(tc => [tc.id, tc.title, tc.type, tc.priority, tc.preconditions||"", tc.steps.join(" | "), tc.expected_result, (tc.tags||[]).join("; ")]);
  const csv = [header,...rows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })), download: `test-cases-${Date.now()}.csv` }); a.click();
}

// ─── FileDrop ─────────────────────────────────────────────────────────────────
function FileDrop({ label, accept, file, onFile, mini = false }) {
  const ref = useRef();
  const [dragging, setDragging] = useState(false);
  const onDrop = useCallback(e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer?.files?.[0]; if (f) onFile(f); }, [onFile]);
  if (mini) return (
    <div className={`mini-drop${file?" has-file":""}`} onClick={() => ref.current.click()}
      onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={onDrop}>
      <input ref={ref} type="file" className="file-input" accept={accept} onChange={e=>onFile(e.target.files[0])}/>
      <div className="mini-drop-text">{file?"✓ ":"↑ "}{label}</div>
      {file&&<div className="mini-drop-name">{file.name}</div>}
    </div>
  );
  return (
    <div className={`file-drop${dragging?" dragging":""}${file?" has-file":""}`} onClick={() => ref.current.click()}
      onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={onDrop}>
      <input ref={ref} type="file" className="file-input" accept={accept} onChange={e=>onFile(e.target.files[0])}/>
      <div className="file-drop-text">{file?"✓ File loaded — click to replace":<><strong>Click to upload</strong> or drag & drop</>}</div>
      {file&&<div className="file-drop-name">{file.name}</div>}
    </div>
  );
}

// ─── TestCaseCard ─────────────────────────────────────────────────────────────
function TestCaseCard({ tc, onModify, isModifying }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [instruction, setInstruction] = useState("");
  const tcNum = parseInt(tc.id.replace("TC-",""), 10);

  return (
    <div className={`tc-card${expanded?" expanded":""}${editing?" editing":""}`}>
      <div className="tc-card-header">
        <span className="tc-id">{tc.id}</span>
        <span className={`tc-type-pill type-${tc.type}`}>{tc.type}</span>
        <span className="tc-title" onClick={()=>setExpanded(x=>!x)}>{tc.title}</span>
        <span className={`tc-priority priority-${tc.priority}`}>{tc.priority}</span>
        <button className={`tc-edit-btn${editing?" active":""}`} onClick={e=>{e.stopPropagation();setEditing(true);setExpanded(true);}}>✎ edit</button>
        <span className="tc-chevron" onClick={()=>setExpanded(x=>!x)}>▼</span>
      </div>
      <div className="tc-body">
        {tc.preconditions&&<div><div className="tc-section-label">Preconditions</div><div className="tc-preconditions">{tc.preconditions}</div></div>}
        <div>
          <div className="tc-section-label">Steps</div>
          <ol className="tc-steps">{tc.steps.map((s,i)=><li key={i}><span className="tc-step-num">{String(i+1).padStart(2,"0")}.</span><span>{s}</span></li>)}</ol>
        </div>
        <div><div className="tc-section-label">Expected Result</div><div className="tc-expected">{tc.expected_result}</div></div>
        {tc.tags?.length>0&&<div><div className="tc-section-label">Tags</div><div className="tc-tags">{tc.tags.map(t=><span key={t} className="tc-tag">{t}</span>)}</div></div>}
      </div>
      {editing&&(
        <div className="edit-zone">
          <div className="edit-zone-label">✎ Modify {tc.id} only — all other cases stay unchanged</div>
          <textarea className="edit-textarea"
            placeholder={"Describe what to change...\n\nExamples:\n• \"Add a step to check the confirmation email\"\n• \"Change priority to high and add a security tag\"\n• \"Split into null and empty string cases separately\""}
            value={instruction} onChange={e=>setInstruction(e.target.value)} autoFocus/>
          <div className="edit-actions">
            <button className="edit-apply-btn" onClick={async()=>{if(!instruction.trim()||isModifying)return;await onModify(tc.id,instruction);setEditing(false);setInstruction("");}} disabled={isModifying||!instruction.trim()}>
              {isModifying?<><div className="edit-spinner"/>Updating...</>:"↻ Apply changes"}
            </button>
            <button className="edit-cancel-btn" onClick={()=>{setEditing(false);setInstruction("");}}>Cancel</button>
            {tcNum>1&&<span className="edit-hint">TC-{String(tcNum-1).padStart(3,"0")} and TC-{String(tcNum+1).padStart(3,"0")} untouched</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [provider, setProvider] = useState("anthropic");
  const [model, setModel] = useState(PROVIDERS.anthropic.models[0].id);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [spec, setSpec] = useState("");
  const [specFile, setSpecFile] = useState(null);
  const [memoryFile, setMemoryFile] = useState(null);
  const [memoryContent, setMemoryContent] = useState("");
  const [memoryPreview, setMemoryPreview] = useState("");
  const [instrFile, setInstrFile] = useState(null);
  const [instrContent, setInstrContent] = useState("");
  const [instrPreview, setInstrPreview] = useState("");
  const [config, setConfig] = useState({ count: 10, includeEdge: true });
  const [loading, setLoading] = useState(false);
  const [modifying, setModifying] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState("");

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 2800); };
  const handleProvider = p => { setProvider(p); setModel(PROVIDERS[p].models[0].id); };
  const handleSpecFile = async f => { setSpecFile(f); setSpec(await readFileText(f)); };
  const handleMemoryFile = async f => { const t = await readFileText(f); setMemoryContent(t); setMemoryFile(f); setMemoryPreview(t.slice(0,280)+(t.length>280?"…":"")); };
  const handleInstrFile = async f => { const t = await readFileText(f); setInstrContent(t); setInstrFile(f); setInstrPreview(t.slice(0,280)+(t.length>280?"…":"")); };

  const generate = async () => {
    if (!spec.trim()) { setError("Please provide a spec, PRD, or acceptance criteria."); return; }
    if (!apiKey.trim()) { setError("Please enter your API key."); return; }
    const n = Number(config.count); if (!n || n < 1 || n > 100) { setError("Count must be 1–100."); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const parsed = await callModel(provider, apiKey.trim(), model, buildGeneratePrompt({ spec: spec.trim(), memory: memoryContent||null, instructions: instrContent||null, config: { ...config, count: n } }));
      if (!parsed.test_cases?.length) throw new Error("No test cases returned. Try a more detailed spec.");
      setResult(parsed); setFilter("all");
    } catch (e) { setError(e.message || "Something went wrong."); }
    finally { setLoading(false); }
  };

  const handleModify = async (tcId, instruction) => {
    if (!apiKey.trim()) { setError("API key required."); return; }
    const tc = result.test_cases.find(t => t.id === tcId); if (!tc) return;
    setModifying(tcId); setError("");
    try {
      const updated = await callModel(provider, apiKey.trim(), model, buildModifyPrompt({ tc, instruction, spec: spec.trim() }));
      setResult(prev => ({ ...prev, test_cases: prev.test_cases.map(t => t.id===tcId ? {...updated, id:tcId} : t) }));
      showToast(`${tcId} updated`);
    } catch(e) { setError(`Failed to modify ${tcId}: ${e.message}`); }
    finally { setModifying(null); }
  };

  const ALL_TYPES = ["positive","negative","edge","security","performance"];
  const typeCounts = result?.test_cases?.reduce((acc, tc) => { acc[tc.type]=(acc[tc.type]||0)+1; return acc; }, {}) || {};
  const filteredCases = result?.test_cases?.filter(tc => filter==="all"||tc.type===filter) || [];
  const currentProvider = PROVIDERS[provider];

  return (
    <>
      <style>{styles}</style>
      <div className="app">

        {/* Header */}
        <div className="header">
          <div>
            <div className="logo-row">
              <div className="logo-icon">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 4h12M2 8h8M2 12h10"/><circle cx="13" cy="12" r="2" fill="currentColor" stroke="none"/>
                </svg>
              </div>
              <span className="logo-text">testgen</span>
              <span className="logo-tag">v2.1</span>
            </div>
            <div className="header-sub">ai test case generator · anthropic · openai · gemini · openrouter</div>
          </div>
          {result && (
            <div className="header-stats">
              <div className="stat-chip"><span>{result.test_cases.length}</span> total</div>
              {ALL_TYPES.filter(t=>typeCounts[t]).map(t=>(
                <div key={t} className="stat-chip">
                  <span style={{color:t==="positive"?"var(--accent)":t==="negative"?"var(--red)":t==="edge"?"var(--amber)":t==="security"?"var(--purple)":"var(--blue)"}}>{typeCounts[t]}</span> {t}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="layout">
          {/* Left */}
          <div>
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">Specification Input</span>
                {specFile && <span className="panel-badge">{specFile.name}</span>}
              </div>
              <textarea className="spec-textarea"
                placeholder={"Paste your feature spec, PRD, user story, or acceptance criteria here...\n\nExample:\n  Feature: Password Reset\n  As a registered user I want to reset my password via email.\n\n  Acceptance Criteria:\n  - System sends a reset link to the registered email\n  - Link expires after 24 hours\n  - Old password stays valid until link is used\n  - Unregistered email shows an error\n  - Reset link can only be used once"}
                value={spec} onChange={e=>setSpec(e.target.value)} />
              <div className="or-divider"><hr/><span>or import file</span><hr/></div>
              <FileDrop label="Upload spec file (.txt, .md)" accept=".txt,.md" file={specFile} onFile={handleSpecFile} />
            </div>

            {error && <div className="error-banner">⚠ {error}</div>}

            {result && (
              <div className="output-area">
                <div className="feature-banner">
                  <span className="feature-label-text">Feature</span>
                  <span className="feature-label-name">{result.feature}</span>
                  <span className="feature-summary">{result.summary}</span>
                </div>
                <div className="summary-bar">
                  <div className="summary-stat"><span className="summary-num">{result.test_cases.length}</span><span className="summary-label">Total</span></div>
                  {ALL_TYPES.filter(t=>typeCounts[t]>0).map(t=>(
                    <div key={t} className="summary-stat"><span className={`summary-num num-${t}`}>{typeCounts[t]}</span><span className="summary-label">{t}</span></div>
                  ))}
                </div>
                <div className="output-toolbar">
                  <div className="filter-row">
                    {["all",...ALL_TYPES.filter(t=>typeCounts[t]>0)].map(t=>(
                      <button key={t} className={`filter-btn${filter===t?" active":""}`} onClick={()=>setFilter(t)}>
                        <span className={`filter-dot dot-${t}`}/>{t}{t!=="all"&&` (${typeCounts[t]})`}
                      </button>
                    ))}
                  </div>
                  <div className="export-group">
                    <button className="export-btn" onClick={()=>{exportJSON(result);showToast("Exported JSON");}}>↓ JSON</button>
                    <button className="export-btn" onClick={()=>{exportMarkdown(result);showToast("Exported MD");}}>↓ MD</button>
                    <button className="export-btn" onClick={()=>{exportCSV(result);showToast("Exported CSV");}}>↓ CSV</button>
                  </div>
                </div>
                <div className="tc-grid">
                  {filteredCases.map(tc=><TestCaseCard key={tc.id} tc={tc} onModify={handleModify} isModifying={modifying===tc.id}/>)}
                </div>
              </div>
            )}

            {!result && !loading && !error && (
              <div className="empty-state" style={{marginTop:16}}>
                <div className="empty-icon">⬡</div>
                <div>No test cases yet.</div>
                <div style={{marginTop:4}}>Paste a spec and hit Generate.</div>
              </div>
            )}
            {loading && (
              <div className="empty-state" style={{marginTop:16}}>
                <div className="empty-icon" style={{opacity:0.9}}>◌</div>
                <div>Analyzing spec and generating test cases...</div>
                <div style={{marginTop:4}}>10–20 seconds typically</div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="sidebar">

            {/* Provider & Model */}
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">Provider & Model</span>
                <span className="panel-badge" style={{color:currentProvider.color,borderColor:currentProvider.color+"44"}}>{currentProvider.label}</span>
              </div>

              {/* 4-tab provider selector */}
              <div className="provider-tabs">
                {Object.entries(PROVIDERS).map(([key, p]) => (
                  <button key={key} className={`provider-tab${provider===key?" active":""}`} onClick={()=>handleProvider(key)}>
                    <span className="provider-dot" style={{background:provider===key?p.color:"var(--surface3)",border:`1px solid ${provider===key?p.color:"var(--border2)"}`}}/>
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Provider-level note */}
              {currentProvider.providerNote && (
                <div className={`provider-note${provider==="openai"?" amber":""}`}>
                  {provider==="openrouter"?"ℹ ":provider==="openai"?"⚠ ":""}{currentProvider.providerNote}
                </div>
              )}

              {/* Model list */}
              <div className="model-list">
                {currentProvider.models.map(m => {
                  const tier = TIER_STYLE[m.tier] || TIER_STYLE.balanced;
                  return (
                    <button key={m.id} className={`model-btn${model===m.id?" selected":""}`} onClick={()=>setModel(m.id)}>
                      <div className="model-btn-left">
                        <span className="model-btn-name">{m.label}</span>
                        <span className="model-btn-desc">{m.desc}</span>
                      </div>
                      <span className="tier-pill" style={{background:tier.color+"18",color:tier.color,border:`1px solid ${tier.color}33`}}>{tier.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* API Key */}
              <div className="api-key-section">
                <div className="api-key-hint">{currentProvider.keyHint}</div>
                <div className="api-key-row">
                  <input className="api-key-input" type={showKey?"text":"password"}
                    placeholder={currentProvider.keyPlaceholder}
                    value={apiKey} onChange={e=>setApiKey(e.target.value)} />
                  <button className="key-toggle" onClick={()=>setShowKey(x=>!x)}>{showKey?"hide":"show"}</button>
                </div>
              </div>
            </div>

            {/* Memory */}
            <div className="panel">
              <div className="panel-header"><span className="panel-title">Memory File</span><span className="panel-badge">optional</span></div>
              <FileDrop label="memory.json / context.txt" accept=".json,.txt,.md" file={memoryFile} onFile={handleMemoryFile} mini />
              {memoryPreview && <div className="mini-preview">{memoryPreview}</div>}
            </div>

            {/* Instructions */}
            <div className="panel">
              <div className="panel-header"><span className="panel-title">Custom Instructions</span><span className="panel-badge">optional</span></div>
              <FileDrop label="instructions.txt / rules.md" accept=".txt,.md" file={instrFile} onFile={handleInstrFile} mini />
              {instrPreview && <div className="mini-preview">{instrPreview}</div>}
            </div>

            {/* Config */}
            <div className="panel">
              <div className="panel-header"><span className="panel-title">Generation Config</span></div>
              <div className="config-grid">
                <div className="config-row">
                  <span className="config-label">Number of test cases</span>
                  <input className="config-input" type="number" min={1} max={100} value={config.count} onChange={e=>setConfig(c=>({...c,count:e.target.value}))} />
                </div>
                <div className="config-row">
                  <span className="config-label">Edge / security cases</span>
                  <label className="toggle">
                    <input type="checkbox" checked={config.includeEdge} onChange={e=>setConfig(c=>({...c,includeEdge:e.target.checked}))} />
                    <span className="toggle-slider"/>
                  </label>
                </div>
              </div>
              <button className="generate-btn" onClick={generate} disabled={loading}>
                {loading ? <><div className="spinner"/><span>Generating...</span></> : "⚡ Generate Test Cases"}
              </button>
              {loading && <div className="progress-bar"><div className="progress-fill"/></div>}
            </div>

          </div>
        </div>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
