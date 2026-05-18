# AGENT.md

Operating manual for anyone (human or AI) extending **ai-infra-lab**. Read this end-to-end before making non-trivial changes. The project's value comes from internal consistency — small, careful additions are better than sweeping rewrites.

---

## 1. Mission

`ai-infra-lab` is a static, single-purpose teaching site for **infra engineers learning how large models are trained and served**. The reader is assumed to be an experienced backend / systems engineer, not an ML researcher.

The site is deliberately:

- **Static.** Plain HTML + CSS + a tiny JS file. No frameworks, no build step, no bundler.
- **Visual.** Every concept gets an inline SVG with a CSS animation. Diagrams beat paragraphs.
- **Hand-drawn / comic-notebook.** Cream paper, navy + orange palette, Caveat / Patrick Hand handwriting fonts, dashed borders, offset shadows. Inspired by sketch-style infra explainer images.
- **Phased.** A 5-step journey (Basics → Phase 1 → Phase 2 → Phase 3 → Phase 4). Each phase is self-contained: scope, LOE, deliverable.
- **Honest about effort.** LOE estimates and deliverables are visible up front. If a section can't be shipped, scope is cut, not added.

**Non-goals**: a comprehensive ML textbook, a tutorial that teaches Python, anything that requires a backend.

---

## 2. Architecture at a glance

Flat layout, no subdirectories for code (so all relative paths are simple):

```
ai-infra-lab/
├── index.html          # Landing / hub: 5 phase cards + accountability cadence
├── basics.html         # Building blocks of every neural network
├── phase-1.html        # Pretraining fundamentals
├── phase-2.html        # Pretraining systems + scale
├── phase-3.html        # Inference fundamentals
├── phase-4.html        # Training → Inference trade-offs
├── styles.css          # All styling (single file by design)
├── app.js              # One generic loop-track cycler; no-ops when DOM is absent
├── README.md           # User-facing intro
├── AGENT.md            # This file
├── labs/
│   └── mnist-mlp.py    # Hands-on companion: MLP on MNIST with LR sweep + dropout demo
└── content/
    ├── fundamentals.md            # Deep-dive notes for Basics page
    ├── phase-1.md                 # Notes for Phase 1
    └── lesson-1-batch-to-loss.md  # Tracing one batch through training
```

### Why a single CSS file
Easier to keep visual consistency. Every page has identical styling. If you find yourself wanting per-page CSS, the answer is almost always "use existing classes" or "add a new utility class everyone can share."

### Why six HTML files instead of templating
Static, no build step, no JS framework. Each page is fully self-contained and viewable directly with `open phase-1.html`. The repetition is manageable because the page **shell** is short — most lines are content.

---

## 3. The page template

Every page follows the same skeleton. **Copy this whole block** to start a new page; only change the four marked sections:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>AI Infra Lab · {PAGE NAME}</title>             <!-- 1: title -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&amp;family=Patrick+Hand&amp;display=swap" />
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <svg width="0" height="0" style="position:absolute" aria-hidden="true">
      <defs>
        <filter id="sketch" x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="3"/>
          <feDisplacementMap in="SourceGraphic" scale="1.4"/>
        </filter>
      </defs>
    </svg>
    <main class="shell">
      <nav class="phase-nav" aria-label="Phase navigation">
        <a href="index.html">Home</a>
        <a href="basics.html">Basics</a>
        <a href="phase-1.html">Phase 1</a>
        <a href="phase-2.html">Phase 2</a>
        <a href="phase-3.html">Phase 3</a>
        <a href="phase-4.html">Phase 4</a>
        <!-- 2: add `class="is-active"` to the link for the current page -->
      </nav>

      <header class="hero">
        <p class="kicker">{KICKER}</p>                       <!-- 3a: kicker -->
        <h1>{HEADLINE}</h1>                                  <!-- 3b: headline -->
        <p class="lede">{ONE OR TWO SENTENCES}</p>           <!-- 3c: lede -->
      </header>

      <!-- 4: page content (sections with concept cards, scope-strip, etc.) -->

      <nav class="page-footer" aria-label="Pagination">
        <a class="prev" href="...">&larr; Previous</a>
        <a class="next" href="...">Next &rarr;</a>
      </nav>
    </main>
    <script src="app.js"></script>
  </body>
</html>
```

### Page-level conventions
- **The `<nav class="phase-nav">` must list all six links in the same order on every page.** Mark the active page with `class="is-active"` on its link.
- **Every phase page (not the landing page) has a `.scope-strip` immediately after the hero** with three boxes: Scope / Time · LOE / Deliverable.
- **Every page ends with a `.page-footer`** containing prev/next links to keep the linear flow obvious.
- **Reading lists** stay at the bottom of each page in `<section class="sources">`. Page-specific reading lives there; cross-cutting reading lives on the landing page.

---

## 4. Design system

### 4.1 Colors (defined in `styles.css` `:root`)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#fbf3e2` | page background (cream) |
| `--bg-soft` | `#fff8ec` | recessed inner panels |
| `--paper` | `#ffffff` | card surfaces |
| `--paper-tint` | `#fffaf0` | nested cards |
| `--ink` | `#1f2547` | body text |
| `--ink-soft` | `#4a5680` | secondary text |
| `--blue` | `#3a55c4` | primary brand, headings |
| `--blue-deep` | `#2a3f9a` | strong text accents |
| `--orange` | `#ee8a30` | secondary brand, active state, emphasis |
| `--orange-deep` | `#d6741e` | hover/active variant |
| `--line` | `#2a3a8a` | thick borders |
| `--line-faint` | `rgba(42,58,138,0.20)` | dashed inner borders |
| `--shadow` | `4px 4px 0 rgba(31,37,71,0.07)` | the offset comic shadow |

**Rule of thumb:** blue = neutral / structural (forward, training, primary), orange = active / accent / surprise (backward, validation loss, current page, "stop here"). Don't introduce a third color without a reason.

### 4.2 Typography
- `--cursive: 'Caveat'` — all headings, kickers, labels, loop-node spans, accent text in viz.
- `--hand: 'Patrick Hand'` — body text, paragraphs, lists.
- Monospace (system) — code blocks and `.loop-node strong` (code-style titles).

Don't introduce a sans-serif body font without good reason. The notebook feel depends on the handwriting fonts being everywhere.

### 4.3 Reusable components

These class names are stable and shared across all pages. **Reuse them; don't fork.**

**Layout / panels**
- `.shell` — page container (max-width 1100px, centered)
- `.hero` — top of every page
- `.kicker` — orange cursive line above the H1
- `.lede` — paragraph under the H1
- `.lesson` — generic content section with paper card styling
- `.sources` — reading-list section
- `.page-footer` — prev/next pagination

**Navigation**
- `.phase-nav` — top pill bar; child `<a>` gets `.is-active` for the current page
- `.scope-strip` — three-cell banner: scope / time · LOE / deliverable
- `.summary-strip` — three-cell banner: mental model / why / how to use

**Grids of concept cards**
- `.lesson-grid` — 2-col grid of `<article>` cards
- `.fundamentals-grid` — 3-col variant (used on Basics + every phase page)
- `.curriculum-grid` — 2-col grid for hands-on checkpoints
- `.phase-grid` — 2-col grid of `.phase-card` (landing page only)
- `.grid` + `.card` — 4-col concept-card row used only on Phase 1 (Tokens / Embeddings / Attention / Systems). Optional `.pulse` + `.delay-{1,2,3}` for staggered float animation.

**Animated mini-elements**
- `.loop-track` + `.loop-node` — horizontal row of cards, one `.is-active` at a time. Used on Basics (4 stages) and Phase 1 (8 stages). Per-track cycle interval via `data-cycle-ms`.

**Glossary blocks**
- `.glossary` — dashed-border panel at the bottom of an animation section (Phase 1).
- `.glossary-grid` — 4-col grid of `<div><strong>Term</strong><p>Definition</p></div>` entries.

**Decorative**
- `.overfit-callout` — the dashed orange callout on the basics page
- `.cadence` — accountability section (landing page only)
- `.more-link` — pill button linking to a markdown deep-dive or a lab file

### 4.4 The visualization toolkit

Inside any card, a `<div class="viz">` holds an inline SVG. The catalog of viz primitives:

| Class | Element | Effect |
|---|---|---|
| `.viz` | container `<div>` | 130px tall paper-tinted panel with dashed border |
| `.viz-svg` | SVG | fills the panel; `viewBox="0 0 240 110"` is the standard frame |
| `.v-node` | circle | small blue node (input, source) |
| `.v-node-output` | circle | orange node (output, target, end of forward) |
| `.v-node-back` | circle | orange node, used in backward-pass diagrams |
| `.v-node-neuron` | circle | blue-bg fill + blue stroke (a neuron / hidden node) |
| `.v-edge-flow` | line/path | dashed cyan stroke that animates left-to-right |
| `.v-edge-flow-back` | line/path | dashed orange stroke that animates right-to-left |
| `.v-box` | rect | blue-bordered layer / module box (animates a soft pulse) |
| `.v-box-back` | rect | orange-bordered variant for backward / loss / failure paths |
| `.v-weight` | rect | small cell whose color cycles between blue/orange (parameter heatmap) |
| `.v-curve` | path/line | blue 2px curve (loss curve, parabola, fit) |
| `.v-curve-overfit` | path | orange jagged curve (overfit, validation loss) |
| `.v-data` | circle | small blue-deep dot (data point) |
| `.v-axis` | line | dashed faint axis line |
| `.v-text` | text | 12px Patrick Hand label |
| `.v-text-cyan` / `.v-text-red` | text | recolor a label blue/orange |
| `.v-text-strong` | text | 14px Caveat callout |
| `.v-contour` | ellipse | concentric loss contour |
| `.v-noisy-path` | path | orange dashed path that "draws itself" via stroke-dashoffset |
| `.v-target` | circle | orange dot (the optimum) |
| `.v-fail` / `.v-ok` | circle | red / green status dots (phase 2 failure timeline) |
| `.v-bar-base` | rect | blue-bordered bar for charts |

Plus three named animated balls used in specific viz: `.gd-ball` (gradient descent step), `.lr-small`/`.lr-good`/`.lr-large` (learning-rate panel triplet), and `.drop-d0`...`.drop-d6` (dropout cells with staggered cycles).

**Adding a new viz:** start from an existing one in a similar concept card, change coordinates, reuse classes. Keep `viewBox="0 0 240 110"`. Avoid introducing new keyframes unless the existing ones can't express what you need.

---

## 5. How to extend the site

### 5.1 Add a new concept card to an existing phase

1. Find the right grid (`.fundamentals-grid` or `.lesson-grid`) on the page.
2. Add an `<article>` like:

   ```html
   <article>
     <div class="viz" aria-hidden="true">
       <svg viewBox="0 0 240 110" class="viz-svg" preserveAspectRatio="xMidYMid meet">
         <!-- reuse v-edge-flow, v-node, v-box, etc. -->
       </svg>
     </div>
     <h3>Concept name</h3>
     <p>One short paragraph (2–3 sentences max).</p>
   </article>
   ```

3. **Don't** introduce new colors, fonts, or shadow recipes inline. If a primitive doesn't exist, add it to `styles.css` as a `.v-*` class and document it here.

### 5.2 Add a new page (new phase, sub-phase, or appendix)

1. Copy the page template in §3.
2. Add the page link to the `.phase-nav` block on **every** page (this is the manual cost of having no templating; do not skip pages).
3. Add a `.phase-card` to the landing page's `.phase-grid`.
4. Update prev/next `.page-footer` links on adjacent pages.
5. Add to README's "Pages" list.

### 5.3 Update content of an existing phase

- Concept cards: edit in place. Keep paragraphs short. Don't grow cards beyond ~4 lines of text.
- Curriculum: each `<article>` in `.curriculum-grid` should follow the existing pattern: short intro, `<ul>` of "Exercise:" / "Pass when:" lines.
- Reading: append to the page's `.sources` `<ul>`.

### 5.4 Restyling

Resist the urge. The handwriting + cream + navy/orange aesthetic is the project's identity. If you change it, change the whole site at once and update §4 of this file. Don't half-restyle one page.

### 5.5 Add a hands-on lab

The `labs/` directory holds runnable Python companions to the phases. Each lab is a single self-contained `.py` file with `# %%` cell markers so it copy-pastes cleanly into Google Colab or any Jupyter env.

Rules for new labs:

1. **One file per lab.** No dependencies between labs.
2. **Cells delimited with `# %%`.** Standard convention; Colab, VS Code, and Jupytext all understand it.
3. **Top-of-file docstring** explains: what concepts on the site this maps to, how to run (Colab, local, Jupyter), expected wall-clock time, expected final result.
4. **Map each line back to a site concept.** A reader who finished the Basics page should be able to point at every line and name the card it implements.
5. **Free + low-cost first.** Default to Colab T4 or CPU. Anything that requires paid GPUs (>$30 / month) needs a written justification at the top of the file.
6. **Link from the page.** Add a `.more-link` callout in the relevant phase's curriculum article pointing at the lab.

Existing labs:

- `labs/mnist-mlp.py` — Phase 1 warm-up. 3-layer MLP on MNIST with a learning-rate sweep (Basics → "Learning rate") and a dropout-vs-no-dropout demo on a small subset (Basics → "Regularization" and "Overfitting"). ~30 seconds on a T4, ~3 minutes on CPU.

---

## 6. JavaScript

`app.js` is intentionally tiny (~12 LOC) and contains a single generic cycler.

**The loop-track cycler** finds every `[data-loop-track]` element and rotates `.is-active` across its `[data-loop-node]` children at an interval defined by `data-cycle-ms` on the track (default 2200ms). Used on Basics (4 stages, 2.2s) and Phase 1 (8 stages, 3.6s). Gracefully no-ops on pages with no track.

Both are guarded by element-existence checks and gracefully no-op on pages that don't have the relevant DOM. **If you add new animated UI, prefer pure CSS first.** Only add JS if the animation requires logic (e.g., active-state stepping). Do not introduce new dependencies.

---

## 7. Conventions and rules

### Always
- Keep the 6-link `.phase-nav` in identical order on every page.
- Use ASCII in source files; encode special characters (`&rarr;`, `&middot;`, etc.) as HTML entities.
- Mark the SVG sketch filter `<defs>` and `aria-hidden` decorative SVGs.
- Match prev/next on adjacent pages when adding/removing pages.
- Run a smoke test (`python3 -m http.server`, click through all 6 pages) after non-trivial changes.

### Never
- Add a build step, framework, or bundler.
- Fork the page chrome (hero/nav/footer); reuse the template.
- Introduce per-page CSS files or `<style>` blocks.
- Add tracking, analytics, or any third-party scripts.
- Write JS that requires a server.
- Change the palette / fonts / shadow without updating §4 here.

### Prefer
- Visual demonstration over prose. If you can show it with an SVG, do.
- Short paragraphs. The reader is an engineer, not a student of literature.
- Concrete numbers. "8–12 hours" beats "a while". "$/1M tokens" beats "expensive".
- Reusing existing CSS classes over adding new ones.
- Removing things that are stale rather than maintaining them.

---

## 8. Local development

```bash
cd ai-infra-lab
python3 -m http.server 8000
# open http://localhost:8000/
```

There is no test runner. Validation = clicking through all 6 pages, checking that:

1. The active link in `.phase-nav` matches the current page.
2. All visualizations render and animate.
3. Prev/next links go where you expect.
4. No 404s in the browser console.

For a quick HTML well-formedness check:

```bash
python3 -c "
from html.parser import HTMLParser
import sys
class V(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack=[]; self.errs=[]
        self.void={'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr','animateMotion','animate','use','circle','rect','line','path','polygon','polyline','ellipse','feTurbulence','feDisplacementMap'}
    def handle_starttag(self,t,a):
        if t in self.void: return
        self.stack.append((t,self.getpos()))
    def handle_startendtag(self,t,a): pass
    def handle_endtag(self,t):
        if t in self.void: return
        if not self.stack or self.stack[-1][0]!=t: self.errs.append((t,self.getpos())); return
        self.stack.pop()
import glob
for f in sorted(glob.glob('*.html')):
    v=V(); v.feed(open(f).read())
    print(f, 'OK' if not v.stack and not v.errs else f'ERR {len(v.errs)} {len(v.stack)}')
"
```

---

## 9. What's done, what's open

### Done
- Six pages with consistent chrome (nav, hero, page-footer)
- Comic-notebook visual theme (cream + navy + orange + Caveat/Patrick Hand)
- ~25 inline-SVG animated visualizations across all phases
- Phase metadata (LOE, time, deliverable) on every phase page and the landing
- Accountability cadence on landing
- One markdown deep-dive (`content/fundamentals.md`) linked from Basics

### Open / future ideas

These are *invitations*, not commitments. Pick one, scope it tight, ship it.

- Markdown deep-dive notes for Phase 2/3/4 (parallel to `content/fundamentals.md`).
- Inline-rendered markdown (so `content/*.md` displays properly in the browser instead of as raw text).
- An interactive `y = 3x` widget on the Basics page — actually run the gradient-descent loop in JS, let the user step through it.
- Per-phase exit checklist that the reader can tick off (state in `localStorage`).
- Phase-specific glossaries (the Phase 1 glossary is a good template).
- A printable/PDF export of any single phase.
- Light / dark mode toggle (current theme is light-only).

### Anti-ideas (do not do without strong reason)
- A SPA / client router. The hard URLs are a feature.
- A CMS. The 6 pages are the right size for direct editing.
- Auto-generated diagrams from data. The hand-tuned SVGs are part of the aesthetic.
- "More phases." 5 is the planned scope; deeper goes in markdown notes.

---

## 10. When in doubt

**Read an existing page that's close to what you want, copy its structure, change only what's necessary.** The code isn't clever; the value is in the consistency. Preserve it.
