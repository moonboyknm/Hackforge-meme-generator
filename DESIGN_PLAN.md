# Meme Generator Redesign & Feature Improvement Plan

Goal: Create an engaging, modern, responsive interface that feels playful while enabling fast meme generation from live trends with template variety and clean captions.

## High-Level Objectives
- Elevate visual hierarchy: clear split between Trends, Template Picker, Meme Workspace.
- Add multi-template support with previews + randomizer.
- Improve caption quality (sanitize, length control, optional regenerate).
- Add theme system (light/dark toggle) with accessible contrast.
- Provide pleasant loading states (skeleton shimmer + micro-animations).
- Support mobile-first responsive layout.

## Information Architecture
- Header: App title, theme toggle, GitHub / About links (optional).
- Main: Two-row adaptive grid.
  - Left (Trends Panel): Search trends list, filter box, refresh button.
  - Center (Template Gallery): Scrollable horizontal (desktop) / collapsible (mobile) list of meme templates with preview thumbnails.
  - Right (Workspace / Output): Selected template large preview, caption display & edit controls, action buttons.
- Footer: Attribution for APIs.

## Component List
- TrendList
- TrendItem
- TemplatePicker
- TemplateCard
- MemeWorkspace
- CaptionControls
- ThemeToggle
- Skeleton (generic)
- Toast / InlineAlert

## Visual / Theming
### Palette (Light / Dark)

#### Light Theme
- bg: #ffffff
- bg-alt: #f5f7fa
- surface: #ffffff
- border: #e2e8f0
- text: #1a202c
- text-muted: #556070
- primary: #6366f1 (Indigo 500)
- primary-accent: linear-gradient(135deg,#6366f1,#8b5cf6)
- accent: #f59e0b
- danger: #ef4444

#### Dark Theme
- bg: #0d1117
- bg-alt: #161b22
- surface: #1e2430
- border: #2d333b
- text: #f1f5f9
- text-muted: #94a3b8
- primary: #818cf8
- primary-accent: linear-gradient(135deg,#6366f1,#8b5cf6)
- accent: #fbbf24
- danger: #f87171

## Typography
- Font stack: system-ui, Inter fallback
- Display size for main heading: clamp(1.9rem, 2.4vw, 2.6rem)
- Caption font: semi-bold 1.25rem with subtle text-shadow on dark
- Mono for template codes: ui-monospace, SFMono-Regular

## Layout / Responsive
- Breakpoints: sm 480, md 768, lg 1024, xl 1280
- Mobile: stacked sections (Trends collapsible -> Template horizontal scroll -> Workspace)
- Desktop: CSS grid (grid-template-columns: 280px 1fr 480px)
- Use container queries (progressive) or fallback media queries.

## Interaction / UX
- Hover lift & subtle gradient border for TemplateCard (box-shadow + border-color transition).
- Meme generation button: show spinner inside button while loading.
- Provide separate buttons: Generate Meme, Regenerate Caption, Download.
- Allow editing caption text before finalizing.
- Provide copy caption button.

## Loading & Empty States
- Skeleton rows (Trends)
- Skeleton template thumbnails
- Pulsing placeholder for meme area
- Empty state message with illustration when no meme yet

## Caption Sanitization (Backend)
Steps:
1. Trim whitespace
2. Remove wrapping quotes (single/double) via regex
3. Collapse multiple spaces
4. Strip leading/trailing hashtags and inline hashtag markers (#word -> word) for display; keep original for trend context? We only need clean caption.
5. Enforce max length ~120 chars (truncate with ellipsis)
6. Provide slug-safe encoded version for memegen (replace spaces with underscore etc.)

## Multi-Template Support
- Template list (initial subset): drake, distracted-boyfriend, two-buttons, doge, success-kid, gru-plan, change-my-mind, leonardo-dicaprio, buzz
- Data structure: templates = [{id:'drake', label:'Drake Hotline', sample:'/images/drake/...'}, ...]
- Random selection when "Random" pressed.

## API Changes
POST /api/generate-meme  
Body: { topic: string, template?: string, mode?: 'full'|'caption' }  
- mode=caption returns only sanitized caption (no memeUrl) for quick regenerate.  
Response:  
- full: { caption, memeUrl, template }  
- caption: { caption }

## Frontend State Additions
- selectedTemplate
- caption (allow user edits)
- mode loading flags: isGeneratingMeme, isRegeneratingCaption

## Download / Share
- Provide download button (anchor with download attribute)
- Add share to clipboard: copy memeUrl + caption

## Accessibility
- Focus outlines preserved
- ARIA live region for status (Generating meme...)
- Alt text: "Meme template <template name> with caption: <caption>"

## Implementation Order
1. Backend: caption sanitization + template param support
2. Frontend: add template picker & state wiring
3. Update generate function to pass template
4. Add caption regenerate path
5. Redesign layout + theming tokens in CSS variables
6. Add skeletons + loading polish
7. Add download/share
8. QA & refine

## CSS Strategy
- Root :root defines light theme vars; [data-theme='dark'] overrides.
- Utility classes for gradient borders and skeleton shimmer.

## Risks / Mitigations
- Long captions overflow: enforce max length & wrap with word-break.
- Template not found: default to 'drake'.
- Rate limits (Groq / SerpAPI): add minimal debounce (e.g., disable generate for 1.5s).

Done criteria: All objectives implemented, lighthouse a11y >= 90.

End.