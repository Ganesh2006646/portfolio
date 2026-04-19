# Ganesh Giridhar Portfolio

High-impact personal portfolio focused on AI systems engineering, product storytelling, and motion-rich UX.

This project is not a basic static page. It is a crafted front-end experience with cinematic transitions, kinetic typography, custom cursor physics, and a recruiter-oriented content flow across Home, Work, and Contact pages.

## Why This Portfolio Stands Out

- Motion-first experience with layered micro and macro interactions.
- Premium visual language built from a custom design system.
- Fast, framework-free architecture using vanilla HTML/CSS/JS.
- Recruiter-focused information architecture with clear conversion paths.

## Featured UI/UX Enhancements

- Cinematic loading screen:
  - Circular rotating intro text
  - Animated percentage counter
- Route-level page transitions:
  - Multi-panel cover and reveal animations
  - Dynamic route name labeling
- Advanced cursor system:
  - Dual-layer smoke and gas cursor
  - Hover and click state morphing
  - Hero-only comet particle trail on canvas
- Kinetic typography:
  - GSAP + SplitType text masking and reveal
  - Character-level animation staging
  - Cursor-proximity hero text color effects
- Scroll intelligence:
  - Consolidated requestAnimationFrame scroll loop
  - Parallax depth layers and progressive reveal
  - Work-page vertical progress indicator
- Interaction polish:
  - Magnetic buttons
  - Mobile menu choreography
  - 3D tilt effects on work cards
- Contact experience:
  - Structured collaboration intent fields
  - Google Sheets logging via Apps Script endpoint
  - Auto-generated mail draft fallback using mailto

## Experience Architecture

- Home ([index.html](index.html))
  - Brand identity, engineering narrative, technical arsenal, achievements, and CTA flow.
- Work ([work.html](work.html))
  - Ranked showcase of projects with context, stack, and repository links.
- Contact ([contact.html](contact.html))
  - Conversion-focused collaboration form and direct contact routes.

## Tech Stack

- HTML5
- CSS3 (custom design system + responsive layouts)
- Vanilla JavaScript (modular behavior scripts)
- GSAP (animation orchestration)
- ScrollTrigger (scroll-driven motion)
- SplitType (kinetic text splitting)

## Project Structure

```text
portfolio/
|- index.html
|- work.html
|- contact.html
|- README.md
|- assets/
|  |- images/
|- css/
|  |- styles.css
|- js/
|  |- main.js
|  |- kinetic-text.js
|  |- comet-cursor.js
|  |- shield.js
|- documents/
```

## Run Locally

Because this is a static front-end project, you can run it using any local static server.

Option 1: VS Code Live Server

1. Open the folder in VS Code.
2. Start Live Server from [index.html](index.html).

Option 2: Python static server

```bash
python -m http.server 5500
```

Then open `http://localhost:5500` in your browser.

## UI/UX Design Principles Applied

- Strong typographic hierarchy with display, body, and serif accents.
- Layered depth through grain, glow, blur, and parallax planes.
- Narrative pacing through transitions, progressive reveals, and section rhythm.
- Conversion-forward CTA placement for work exploration and recruiter contact.
- Adaptive behavior across desktop and mobile breakpoints.

## Notes

- Source-protection behavior is implemented in [js/shield.js](js/shield.js).
- Form submissions are sent to a Google Apps Script endpoint and also support email draft fallback.
- External CDNs are used for GSAP/ScrollTrigger/SplitType.

## Author

Kankatala Ganesh Giridhar

- LinkedIn: https://www.linkedin.com/in/kankatala-ganesh-giridhar-071876322
- GitHub: https://github.com/Ganesh2006646
