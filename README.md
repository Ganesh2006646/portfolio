<div align="center">

# Ganesh Giridhar — Portfolio

**A cinematic, motion-first portfolio with an embedded AI Digital Twin powered by a custom RAG pipeline.**

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000?style=flat&logo=vercel)](https://brandofganesh.vercel.app)
[![AI Powered](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-4285F4?style=flat&logo=google)](https://ai.google.dev)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## Overview

This is not a basic static page. It is a crafted front-end experience with cinematic transitions, kinetic typography, custom cursor physics, and an **AI chatbot** that acts as a digital twin — answering recruiter questions about projects, skills, philosophy, and background in real time.

### ✨ Key Differentiators

| Feature | Description |
|---|---|
| **AI Digital Twin** | RAG-powered chatbot over a 317-chunk personal knowledge base |
| **SSE Streaming** | Real-time word-by-word response rendering (like ChatGPT) |
| **Conversational Memory** | Multi-turn chat with Gemini `startChat` history |
| **Rich Markdown Output** | Headers, lists, code blocks with copy buttons in bot responses |
| **Recruiter Onboarding** | Name/role capture on first visit, logged to Google Sheets |
| **Session Persistence** | Chat survives page refresh via `localStorage` |
| **Motion-First UX** | Cinematic transitions, parallax, kinetic typography |
| **Zero Frameworks** | Pure HTML/CSS/JS — fast, lightweight, no build step |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Portfolio Site                     │
│  ┌────────┐  ┌────────┐  ┌─────────┐  ┌──────────┐ │
│  │ Home   │  │ Work   │  │ Contact │  │ Chatbot  │ │
│  │ Page   │  │ Page   │  │ Page    │  │ Widget   │ │
│  └────────┘  └────────┘  └─────────┘  └────┬─────┘ │
└─────────────────────────────────────────────┼───────┘
                                              │ SSE Stream
                    ┌─────────────────────────▼───────┐
                    │     /api/chat (Serverless)       │
                    │  ┌──────────┐  ┌──────────────┐ │
                    │  │ Embed    │  │ Cosine       │ │
                    │  │ Query    │  │ Similarity   │ │
                    │  │ (Gemini) │  │ Search       │ │
                    │  └──────────┘  └──────────────┘ │
                    │  ┌──────────────────────────┐   │
                    │  │ Gemini 2.5 Flash         │   │
                    │  │ + System Prompt + Context │   │
                    │  │ + Chat History (Memory)   │   │
                    │  └──────────────────────────┘   │
                    └─────────────────────────────────┘
                              ▲
                    ┌─────────┴─────────┐
                    │  vectors.json     │
                    │  317 chunks       │
                    │  3072-dim vectors │
                    │  (gemini-embed-2) │
                    └───────────────────┘
```

---

## RAG Knowledge Base

The chatbot is backed by a curated personal knowledge base with **317 chunks across 15 categories**:

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

## UI/UX Features

### Portfolio Experience
- **Cinematic loading screen** — Circular rotating intro text + animated percentage counter
- **Route-level page transitions** — Multi-panel cover/reveal animations with dynamic route labeling
- **Advanced cursor system** — Dual-layer smoke/gas cursor with hover morphing + hero comet trail
- **Kinetic typography** — GSAP + SplitType text masking, character-level staging, cursor-proximity color effects
- **Scroll intelligence** — Consolidated RAF scroll loop, parallax depth layers, progressive reveal
- **Interaction polish** — Magnetic buttons, mobile menu choreography, 3D tilt work cards
- **Contact experience** — Structured collaboration fields, Google Sheets logging, mailto fallback

### AI Chatbot Widget
- **Glassmorphic floating panel** — Backdrop blur, radial gradients, smooth open/close animations
- **SSE real-time streaming** — Word-by-word response rendering with blinking cursor
- **Rich markdown output** — Headers, bullet lists, numbered lists, bold, italic, inline code, code blocks with copy buttons
- **Recruiter onboarding** — Name/role capture with Google Sheets logging
- **Smart suggestions** — Randomized prompt chips for quick interaction
- **Session persistence** — `localStorage` backed chat history survives page refresh
- **Conversational memory** — Multi-turn follow-up questions via Gemini chat sessions

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Animation** | GSAP, ScrollTrigger, SplitType |
| **AI Model** | Google Gemini 2.5 Flash |
| **Embeddings** | Gemini Embedding 2 (3072-dim) |
| **Backend** | Vercel Serverless Functions (Node.js) |
| **Hosting** | Vercel Edge Network |
| **Data Store** | JSON vector store (in-repo) |
| **Analytics** | Google Sheets (via Apps Script) |

---

## Project Structure

```text
portfolio/
├── index.html                  # Home page
├── work.html                   # Projects showcase
├── contact.html                # Contact & collaboration form
├── README.md
├── vercel.json                 # Vercel deployment config
├── package.json                # Dependencies (@google/generative-ai)
├── robots.txt
├── sitemap.xml
├── api/
│   ├── chat.js                 # RAG chatbot endpoint (SSE streaming)
│   └── log-visitor.js          # Visitor logging to Google Sheets
├── assets/
│   └── images/                 # Portfolio assets
├── css/
│   ├── styles.css              # Main portfolio styles
│   └── chatbot-widget.css      # Chatbot + markdown styles
├── js/
│   ├── main.js                 # Core portfolio logic
│   ├── chatbot-widget.js       # AI chatbot widget
│   ├── kinetic-text.js         # Typography animations
│   ├── comet-cursor.js         # Cursor effects
│   └── shield.js               # Source protection
├── data/
│   └── vectors.json            # 317 pre-embedded chunks (20MB)
└── documents/                  # Downloadable assets
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ | Google Gemini API key for embeddings and chat generation |

Set this in your Vercel project dashboard under **Settings → Environment Variables** for `Production` and `Preview` environments.

---

## Run Locally

### Option 1: VS Code Live Server
1. Open the folder in VS Code.
2. Start Live Server from `index.html`.
3. The chatbot requires the Vercel serverless function — it won't work on a static server without the API.

### Option 2: Vercel CLI (Full Features)
```bash
npm install -g vercel
npm install
vercel dev
```
This runs the serverless functions locally and provides full chatbot functionality.

### Option 3: Python Static Server (Portfolio Only)
```bash
python -m http.server 5500
```
Open `http://localhost:5500` — the portfolio UI works, but the chatbot requires the API backend.

---

## Deployment

The project auto-deploys on every push to `main` via Vercel:

1. Push to `main` branch on GitHub
2. Vercel detects the push and runs `npm install`
3. Static files are served from the root output directory
4. Serverless functions in `/api` are deployed as edge endpoints
5. Live in ~30 seconds

---

## Design Principles

- Strong typographic hierarchy with display, body, and serif accents
- Layered depth through grain, glow, blur, and parallax planes
- Narrative pacing through transitions, progressive reveals, and section rhythm
- Conversion-forward CTA placement for work exploration and recruiter contact
- Adaptive behavior across desktop and mobile breakpoints

---

## Author

**Kankatala Ganesh Giridhar**

- 🌐 [Portfolio](https://brandofganesh.vercel.app)
- 💼 [LinkedIn](https://www.linkedin.com/in/kankatala-ganesh-giridhar-071876322)
- 🐙 [GitHub](https://github.com/Ganesh2006646)

---

<div align="center">
<sub>Built with obsessive attention to detail. Powered by The Linear Paradigm.</sub>
</div>
