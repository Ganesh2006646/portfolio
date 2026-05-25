<div align="center">

# Kankatala Ganesh Giridhar — Portfolio

[![Deploy Status](https://img.shields.io/badge/deployed-vercel-black?logo=vercel&logoColor=white)](https://brandofganesh.vercel.app)
[![Analytics](https://img.shields.io/badge/analytics-vercel-blue?logo=vercel)](https://vercel.com/analytics)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/HTML)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/docs/Web/JavaScript)
[![Three.js](https://img.shields.io/badge/Three.js-black?logo=threedotjs)](https://threejs.org)
[![GSAP](https://img.shields.io/badge/GSAP-88CE02?logo=greensock&logoColor=black)](https://gsap.com)
[![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-4285F4?logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Vercel](https://img.shields.io/badge/Serverless-Vercel_Functions-black?logo=vercel)](https://vercel.com/docs/functions)

**A cinematic, motion-first portfolio with an embedded AI Digital Twin powered by a custom RAG pipeline.**

**[brandofganesh.vercel.app](https://brandofganesh.vercel.app)**

</div>

---

## Overview

This is not a basic static site. It is a full-stack production application combining a zero-dependency cinematic portfolio frontend with a serverless AI chatbot backend — a recruiter-facing "Digital Twin" that answers questions about Ganesh's skills, projects, and experience in real time using Retrieval-Augmented Generation.

---

## ✨ What Makes This Different

| Feature | Details |
|---|---|
| 🤖 **AI Digital Twin** | Gemini 2.5 Flash RAG chatbot with streaming SSE, 399 vector chunks, conversational memory |
| 🎬 **Cinematic UX** | Multi-panel page transitions, WebGL hero, comet cursor, kinetic typography |
| 🔮 **3D Tech Stack** | Three.js physics sphere cluster with scroll-driven Fibonacci assembly + mouse repulsion |
| ⚡ **Zero Build Step** | Pure HTML/CSS/Vanilla JS frontend — no bundler, no framework |
| 📡 **Serverless Backend** | Vercel Edge Functions for RAG chat and visitor logging |
| 📊 **Dual Analytics** | Vercel Web Analytics + Google Sheets visitor/lead capture |

---

## 🤖 AI Digital Twin — Architecture

The chatbot is a full RAG pipeline running on Vercel Serverless Functions:

```
User Message
      │
      ▼
chatbot-widget.js (Frontend)
  ┌───────────┐  ┌───────────┐  ┌─────────────┐  ┌──────────────┐
  │ Markdown  │  │ Session   │  │ Recruiter   │  │ Smart        │
  │ Renderer  │  │ Persist   │  │ Onboarding  │  │ Suggestions  │
  │           │  │ (Local    │  │ (Name/Role  │  │ (Prompt      │
  │           │  │ Storage)  │  │  Capture)   │  │  Chips)      │
  └───────────┘  └───────────┘  └─────────────┘  └──────┬───────┘
└─────────────────────────────────────────────────────────┼───────┘
                                                          │ SSE Stream
                              ┌───────────────────────────▼────────┐
                              │     /api/chat (Serverless)         │
                              │  ┌──────────┐  ┌──────────────┐   │
                              │  │ Embed    │  │ Cosine       │   │
                              │  │ Query    │  │ Similarity   │   │
                              │  │ (Gemini) │  │ Search       │   │
                              │  └──────────┘  └──────────────┘   │
                              │  ┌────────────────────────────┐   │
                              │  │ Gemini 2.5 Flash           │   │
                              │  │ + System Prompt + Context  │   │
                              │  │ + Chat History (Memory)    │   │
                              │  └────────────────────────────┘   │
                              └────────────────────────────────────┘
                                            ▲
                              ┌─────────────┴──────────────┐
                              │  data/vectors.json          │
                              │  399 chunks · 3072-dim      │
                              │  (gemini-embedding-exp-03)  │
                              └────────────────────────────┘
```

---

## 📚 RAG Knowledge Base

The chatbot is backed by a curated personal knowledge base across **15 categories**:

| Category | Chunks | Coverage |
|---|---|---|
| Skills & Tech Stack | 43 | Languages, frameworks, tools, proficiency levels |
| Experience | 32 | Internships, roles, responsibilities |
| Interview Prep | 31 | STAR-L format behavioral answers |
| Timeline | 30 | Academic and professional milestones |
| Learning | 27 | Courses, certifications, self-study topics |
| Network & Community | 23 | Collaborations, mentors, communities |
| Projects | 21 | RiceAgent Pro, ExecuCode, FLIP WARS, Spectra-Shield |
| Identity | 19 | Background, philosophy, The Linear Paradigm |
| Content & Writing | 18 | Blogs, documentation, technical writing |
| Values & Beliefs | 17 | Engineering morality, principles |
| Achievements | 16 | Awards, hackathons, recognitions |
| Goals | 14 | 5-year vision, career targets |
| Communication Style | 12 | Voice, tone, presentation approach |
| Psychology | 9 | Work style, decision-making patterns |
| Prompts | 5 | System prompt templates |

---

## 🎬 Portfolio Experience Architecture

### Home — `index.html`
| Section | Content |
|---|---|
| Hero | Full-viewport title with WebGL particle background, comet cursor, parallax fade on scroll |
| About | Bento-grid bio, CGPA/hackathon stats, service cells with profile image spotlight |
| Technical Arsenal | Scroll-assembled Three.js physics sphere cluster; mobile graceful fallback grid |
| Proof of Impact | 4 featured projects with stack tags and GitHub links |
| Competitive Spirit | Hackathon timeline (Synaptics, Google Gemini, Meta OpenEnv, HDFC) |
| Experience & Research | CodSoft internship, Live-in-Labs rural research, Sustainable AI initiative |
| Upskilling | Certifications and competitive programming (LeetCode, CodeChef) |

### Work — `work.html`
9 projects with vertical scroll-progress bar, 3D tilt perspective cards, project imagery, and repository links.

### Contact — `contact.html`
Collaboration-intent radio selectors + Google Sheets logging via iframe POST (CORS-bypassed) + auto-generated `mailto:` fallback.

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Animation** | GSAP 3.12.5, ScrollTrigger, SplitType |
| **3D / WebGL** | Three.js r128 |
| **AI Model** | Google Gemini 2.5 Flash |
| **Embeddings** | Gemini Embedding Exp-03 (3072-dim) |
| **Backend** | Vercel Serverless Functions (Node.js) |
| **Hosting** | Vercel Edge Network |
| **Data Store** | JSON vector store (in-repo) |
| **Analytics** | Vercel Web Analytics + Google Sheets (Apps Script) |

---

## 📁 Project Structure

```
portfolio/
├── index.html                  # Home — brand identity, about, tech arsenal, projects
├── work.html                   # Projects showcase with 3D tilt cards
├── contact.html                # Collaboration form + Google Sheets logging
├── vercel.json                 # Vercel deployment config
├── package.json                # Dependencies (@google/generative-ai)
├── robots.txt                  # SEO crawler directives
├── sitemap.xml                 # XML sitemap (3 URLs)
│
├── api/
│   ├── chat.js                 # RAG chatbot endpoint (SSE streaming)
│   └── log-visitor.js          # Visitor lead logging to Google Sheets
│
├── css/
│   ├── styles.css              # Monolithic portfolio design system (~83 KB)
│   └── chatbot-widget.css      # Chatbot panel + markdown renderer styles
│
├── js/
│   ├── main.js                 # Core orchestrator — cursor, loader, nav, scroll, forms (~720 LOC)
│   ├── chatbot-widget.js       # AI chatbot widget with SSE streaming + markdown
│   ├── techstack.js            # Three.js 3D physics sphere simulation (~578 LOC)
│   ├── hero-bg.js              # WebGL hero particle background
│   ├── kinetic-text.js         # GSAP + SplitType kinetic typography engine
│   ├── comet-cursor.js         # Canvas comet particle trail (hero-only)
│   └── shield.js               # Source-protection layer
│
├── data/
│   └── vectors.json            # 399 pre-embedded RAG chunks (24.8 MB)
│
├── assets/
│   └── images/                 # WebP-optimised portfolio assets
│
└── documents/                  # Downloadable CV and assets
```

---

## ⚡ Performance Architecture

- **Single rAF scroll loop** — one `requestAnimationFrame` handler manages parallax, header state, scroll-progress bar, and top-bar (zero stacked scroll listeners)
- **Passive event listeners** — all scroll/touch handlers use `{ passive: true }`
- **WebP assets** — all images served in WebP; PNG originals as source fallback
- **`loading="lazy"`** — applied to all below-fold images
- **Pixel ratio cap** — Three.js renderer capped at `Math.min(devicePixelRatio, 2)`
- **`prefers-reduced-motion`** — all animations fully respect the OS accessibility setting
- **IntersectionObserver** — scroll-reveal unobserves elements after first trigger
- **SSE streaming** — chatbot responses stream word-by-word, no blocking fetch

---

## 🔒 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ | Google Gemini API key for embeddings and chat generation |

Set in your Vercel project: **Settings → Environment Variables** (Production + Preview).

---

## 🚀 Run Locally

### Option 1 — Vercel CLI (Full features, including chatbot)
```bash
npm install -g vercel
npm install
vercel dev
```

### Option 2 — VS Code Live Server (Portfolio UI only)
1. Open the folder in VS Code
2. Right-click `index.html` → **Open with Live Server**

> ⚠️ The chatbot requires the `/api/chat` serverless function and `GEMINI_API_KEY`. It will not work on a plain static server.

### Option 3 — Python (Portfolio UI only)
```bash
python -m http.server 5500
# Open http://localhost:5500
```

---

## 🚢 Deployment

Auto-deploys on every push to `main` via Vercel:

1. Push to `main` on GitHub
2. Vercel detects the push and runs `npm install`
3. Static files served from root; serverless functions in `/api` deployed as edge endpoints
4. Live in ~30 seconds

---

## 🖼️ Featured Projects

| # | Project | Stack | Year |
|---|---|---|---|
| 01 | **Dispute De-Escalator** | Gemini AI, Next.js, Node.js, PostgreSQL | 2026 |
| 02 | **Flip Wars** | Java, Game Theory, Minimax, Alpha-Beta Pruning | 2025 |
| 03 | **ExecuCode** | FastAPI, Gemini AI, Python, RL Wrappers | 2026 |
| 04 | **Spectra-Shield** | Gemini, Pathway, LiteLLM, Python | 2025 |
| 05 | **ShopEase** | MERN Stack, Context API, JWT Auth | 2025 |
| 06 | **RiceAgent Pro** | Flutter, Firebase, Dart | 2025 |
| 07 | **Virtual Court** | Node.js, Express, MongoDB | 2026 |
| 08 | **Mess Management** | React, Node.js, PostgreSQL | 2025 |
| 09 | **Travel Planner** | HTML5, CSS3, JavaScript | 2025 |

---

## 📊 Analytics

- **Vercel Web Analytics** — page view tracking via `/_vercel/insights/script.js` on all pages
- **Google Sheets** — contact form leads and chatbot recruiter onboarding logged via Apps Script

---

## 🧑‍💻 Author

**Kankatala Ganesh Giridhar**
B.Tech Computer Science — Amrita Vishwa Vidyapeetham (CGPA: 8.4)

| Platform | Link |
|---|---|
| 🌐 Portfolio | [brandofganesh.vercel.app](https://brandofganesh.vercel.app) |
| 💼 LinkedIn | [kankatala-ganesh-giridhar-071876322](https://www.linkedin.com/in/kankatala-ganesh-giridhar-071876322) |
| 🐙 GitHub | [Ganesh2006646](https://github.com/Ganesh2006646) |
| 📧 Email | [kankatalaganeshgiridhar@gmail.com](mailto:kankatalaganeshgiridhar@gmail.com) |

---

<div align="center">
<sub>Built with obsessive attention to detail. Powered by The Linear Paradigm.</sub>
</div>
