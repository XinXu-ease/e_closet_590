# E-Wardrobe Figma → React Integration Plan

更新时间：2026-09-15

## 1. Current State

### Figma

- File: `590`
- File key: `7UmauOUmGRW7XMDdAkCosY`
- Page: `Page1` (`0:1`)
- Existing mobile frame: `Closet` (`1:7`)
- Frame size: `402 × 874`
- Connected library: `Simple Design System`
- The current Closet frame is visually empty
- UX notes exist outside the frame on the canvas

### Local project

Project folder:

```text
D:\DeskTOP\590proj_Ewardrobe
```

Current project contains only:

```text
UXDESIGN.md
```

There is no Next.js/React application yet.

### Local development environment

Already installed:

```text
Node.js v24.14.1 LTS
npm 11.11.0
Git 2.50.1
```

No additional Node.js installation is required.

## 2. Important Synchronization Constraint

Figma Code Connect does **not** automatically rewrite production React files whenever any visual layer changes. Code Connect maps published Figma components to existing code components and gives Figma Dev Mode or coding agents better implementation context.

Figma also does not provide a safe native feature that translates every arbitrary canvas edit into working application logic in real time.

Examples that cannot be reliably inferred from an arbitrary Figma edit alone:

- Database behavior
- API calls
- Form validation
- Upload logic
- IndexedDB behavior
- Drag-and-drop business rules
- Error handling
- Whether a visual element is decorative or interactive

Therefore, this project will use a constrained and predictable synchronization model.

## 3. Recommended Source-of-Truth Model

### Figma is authoritative for

- Screen structure
- Component selection
- Component labels
- Navigation destinations
- Colors, spacing, radius, and typography
- Mobile layout order
- Visible/hidden component variants

### React code is authoritative for

- Upload and remove.bg behavior
- IndexedDB and Dexie storage
- Form validation
- Canvas drag, resize, rotate, and layer behavior
- Runtime state and error handling
- Accessibility behavior
- PWA and browser behavior

### Generated sync layer

Supported Figma changes are converted into generated JSON rather than directly overwriting hand-written React files:

```text
Figma frames and component instances
               ↓
scripts/sync-figma.mjs
               ↓
src/generated/figma-layout.json
               ↓
React screen renderer and components
               ↓
localhost UI hot reload
```

This keeps generated design data separate from application logic.

## 4. What Will Synchronize

The sync bridge will support these properties:

- Screen name and route
- Text labels
- Component order
- Component visibility
- Auto-layout direction
- Width, height, padding, and gap
- Fill and stroke colors
- Border radius
- Font size and weight
- Basic component variants
- Navigation target stored through agreed node naming

The first version will not guarantee automatic conversion of:

- Arbitrary vectors or custom drawings
- Complex masks and effects
- New unknown component types
- Complex prototype conditions
- Animations
- Application business logic

Unknown nodes will produce a clear sync warning instead of silently generating broken UI.

## 5. Why Not Use Figma Webhooks for Local Live Sync

Figma provides a `FILE_UPDATE` webhook, but it fires after a period of editing inactivity and may take up to approximately 30 minutes. A public webhook also cannot directly call a private `localhost` address.

For local development, the practical workflow is:

```bash
npm run figma:sync -- --watch
```

The watcher will poll the selected Figma frames at a conservative interval, compare the Figma version, and update generated JSON only when the version changes.

For CI or a deployed environment, a webhook can later trigger a GitHub Action or deployment job.

## 6. Figma File Structure

Use one Figma page with three sections:

```text
Page1
├── 00 Foundations
│   ├── Color and spacing references
│   └── Typography references
├── 01 Components
│   ├── App Header
│   ├── Bottom Navigation
│   ├── Search Field
│   ├── Category Chip
│   ├── Clothing Card
│   ├── Outfit Card
│   ├── Primary / Secondary / Danger Button
│   └── Empty / Loading / Error State
└── 02 Screens
    ├── 01 Closet
    ├── 02 Add New Item
    ├── 03 Item Detail
    ├── 04 Create Outfit
    ├── 05 Saved Outfits
    ├── 06 Outfit Detail
    └── 07 Me Settings
```

All seven screens use the existing `402 × 874` mobile size.

Repeated elements must be component instances, not duplicated one-off layers.

## 7. Seven React Routes

| Page | Route | Main purpose |
| --- | --- | --- |
| Closet | `/closet` | View, search, and filter clothing |
| Add New Item | `/items/new` | Upload, remove background, categorize, save |
| Item Detail | `/items/[id]` | View, edit, delete, add to outfit |
| Create Outfit | `/create` | Matching Canvas and Category / Item Tray |
| Saved Outfits | `/outfits` | Saved outfit gallery |
| Outfit Detail | `/outfits/[id]` | Edit, delete, reopen in Matching Canvas |
| Me / Settings | `/settings` | Basic app preferences and local data |

The root route `/` redirects to `/closet`.

## 8. Prototype Navigation in Figma

Required clickable prototype links:

```text
Closet → Add New Item
Closet → Item Detail
Closet → Create Outfit
Closet → Saved Outfits
Closet → Me / Settings

Add New Item → Save Item → Closet
Add New Item → Cancel → Closet

Item Detail → Add to Outfit → Create Outfit
Item Detail → Delete Item → Closet

Create Outfit → Save Outfit → Outfit Detail

Saved Outfits → Outfit Detail
Saved Outfits → Create Outfit

Outfit Detail → Edit Outfit → Create Outfit
Outfit Detail → Delete Outfit → Saved Outfits
```

The Figma prototype demonstrates navigation and basic UI reactions. The localhost React app implements the same navigation and real state changes.

## 9. React Technology Stack

### Required

```text
Next.js 16
React
TypeScript
Tailwind CSS
Zustand
Dexie + dexie-react-hooks
React Konva + Konva
Lucide React
```

### Development and testing

```text
ESLint
Playwright
Vitest
Testing Library
```

### PWA, added after the seven-page prototype works

```text
Web App Manifest
Service Worker / Serwist
Mobile icons
Offline fallback page
```

## 10. Required Figma Tools and Plugins

### Already available

- Figma MCP connection
- Edit access to the target Figma file
- Simple Design System library
- Full seat on the Student plan

### No additional Figma Community plugin is required

The seven screens can be created and inspected through the connected Figma MCP tools.

### Code Connect limitation

Official Code Connect publishing requires published components and an Organization or Enterprise plan. The current Student plan should not be treated as having this capability.

Code Connect is optional for this MVP. If the account is upgraded later, mappings can be added for reusable components such as:

- `Button`
- `BottomNav`
- `CategoryChip`
- `ClothingCard`
- `OutfitCard`
- `SearchField`

Code Connect improves component mapping but still does not provide automatic arbitrary Figma-to-code synchronization.

## 11. Environment Variables

The project will use `.env.local`:

```env
REMOVE_BG_API_KEY=
FIGMA_FILE_KEY=7UmauOUmGRW7XMDdAkCosY
FIGMA_PAGE_ID=0:1
FIGMA_ACCESS_TOKEN=
```

Rules:

- `.env.local` must be added to `.gitignore`
- Never paste API keys or the Figma token into source files
- Never expose these values through variables prefixed with `NEXT_PUBLIC_`
- The user should create and enter the Figma token locally when the sync bridge is ready

The Figma token only needs read access to the file content for local synchronization.

## 12. Planned Project Structure

```text
590proj_Ewardrobe/
├── app/
│   ├── closet/page.tsx
│   ├── create/page.tsx
│   ├── items/new/page.tsx
│   ├── items/[id]/page.tsx
│   ├── outfits/page.tsx
│   ├── outfits/[id]/page.tsx
│   ├── settings/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── canvas/
│   ├── clothing/
│   ├── navigation/
│   └── ui/
├── db/
│   ├── database.ts
│   └── types.ts
├── stores/
│   └── outfit-store.ts
├── src/generated/
│   └── figma-layout.json
├── scripts/
│   ├── sync-figma.mjs
│   └── validate-figma-schema.mjs
├── public/
├── .env.example
├── .env.local
├── TECH_STACK.md
├── UXDESIGN.md
└── FIGMA_INTEGRATION_PLAN.md
```

## 13. Implementation Phases

### Phase 1 — Initialize localhost application

- Create the Next.js project in the existing project folder
- Configure TypeScript, Tailwind, ESLint, and mobile viewport
- Create seven routes
- Add shared bottom navigation
- Use mock local data
- Verify `npm run dev` at `http://localhost:3000`

### Phase 2 — Create Figma component foundations

- Inspect available Simple Design System components
- Reuse existing components when suitable
- Create only the project-specific reusable components that are missing
- Use Auto Layout and consistent names
- Keep the style low-fidelity, simple, and readable

### Phase 3 — Build seven Figma screens

- Build all seven `402 × 874` screens from `UXDESIGN.md`
- Connect page navigation in Prototype mode
- Validate every screen visually
- Confirm labels and routes match the specification

### Phase 4 — Implement seven interactive React pages

- Match the Figma screens
- Implement clickable navigation
- Implement basic form and dialog reactions
- Add empty, loading, error, and success states
- Keep API and database behavior mocked until UI navigation is verified

### Phase 5 — Add constrained Figma sync bridge

- Define an allowed Figma component schema
- Map Figma component IDs to React component names
- Fetch the seven selected frame trees from the Figma REST API
- Generate `src/generated/figma-layout.json`
- Add schema validation
- Add watch mode
- Prevent generated files from overwriting application logic

### Phase 6 — Add real MVP behavior

- Dexie / IndexedDB
- remove.bg Route Handler
- React Konva Matching Canvas
- Save and reopen outfits
- PWA installation and offline read access

## 14. Acceptance Criteria

The first UI milestone is complete when:

- All seven Figma screens exist at `402 × 874`
- All required components from `UXDESIGN.md` are visible
- The Figma prototype links work
- The localhost app contains the same seven routes
- Bottom navigation works
- Add, edit, delete, save, and confirmation controls visibly react
- The app works at a mobile viewport without horizontal overflow
- `npm run build` succeeds
- Playwright verifies the primary navigation flows
- Supported Figma label/layout changes can update generated design JSON
- Unsupported Figma nodes produce validation warnings

The project must not claim that every arbitrary Figma edit can safely rewrite application logic.

## 15. User Action Needed Later

No action is required to begin the Figma and localhost UI work.

Before enabling continuous local Figma polling, the user will need to:

1. Create a Figma personal access token with file-content read access
2. Put it in `FIGMA_ACCESS_TOKEN` inside `.env.local`
3. Never send the token in chat or commit it to Git

