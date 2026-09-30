# E-Closet Figma Integration Plan

更新时间：2026-09-26

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

The repository currently contains an earlier Next.js seven-screen prototype and a Figma sync script. The approved target is now a React + Vite implementation with four core views.

This document records the Figma/code integration boundary. It does not repeat the complete page organization, information architecture, or screen requirements.

## 2. Documentation Ownership

To avoid maintaining the same UX specification in multiple places:

- `UXDESIGN.md` is the canonical and complete UX document. It owns information architecture, routes, navigation, view requirements, states, responsive behavior, and UX acceptance criteria.
- `TECH_STACK.md` owns application architecture, Vite/Vercel deployment, IndexedDB, the background-removal API, and `react-rnd`.
- `FIGMA_INTEGRATION_PLAN.md` owns only the current Figma baseline, design-to-code responsibility boundaries, synchronization constraints, and Figma migration steps.
- `PROGRESS_2026-09-16.md` records historical work and the current migration status.

When documents disagree, use `UXDESIGN.md` for product behavior and `TECH_STACK.md` for implementation decisions.

## 3. Revised Figma Scope

The active MVP prototype should represent the four views defined in `UXDESIGN.md`:

- Closet
- Item Detail, with add and edit variants
- Outfit Builder
- Saved Outfits

The previous Add New Item, Outfit Detail, and Me / Settings frames may remain in an Archive section for comparison, but they should not participate in the active prototype flow.

Required Figma adjustments:

- Merge Add New Item into Item Detail as a `mode=add` variant
- Keep the existing-item state as a `mode=edit` variant
- Use Cancel / Save in add mode
- Use Delete / Save in edit mode
- Remove Add to Outfit from Item Detail
- Do not show Remove Background in edit mode
- Reduce bottom navigation to Closet, Create, and Saved
- Link Saved Outfit cards directly to the reopened state of Outfit Builder
- Add a wider responsive reference in addition to the existing `402 × 874` mobile frames

Detailed content and state requirements remain in `UXDESIGN.md`.

## 4. Source-of-Truth Boundary

Figma is authoritative for:

- Visual structure and responsive layout intent
- Component appearance and variants
- Text labels
- Colors, spacing, radius, and typography
- Prototype navigation
- Add/edit visual variants for Item Detail

React code is authoritative for:

- Route and form state
- IndexedDB reads and writes
- Image upload and background-removal requests
- Validation and error handling
- `react-rnd` drag, resize, and layer behavior
- Saving and reopening outfits
- Accessibility and runtime browser behavior

Figma changes must not directly overwrite application logic.

## 5. Sync Constraints

Figma Code Connect or a custom sync script cannot safely translate arbitrary canvas edits into working application behavior.

The sync layer may read constrained design data such as:

- Screen and component names
- Text labels
- Component order and visibility
- Auto Layout direction, padding, and gap
- Size, fill, stroke, radius, and typography
- Explicit variants such as `mode=add` and `mode=edit`

It must not infer or generate:

- IndexedDB queries or migrations
- API credentials or request behavior
- Validation rules
- Canvas persistence logic
- Delete behavior
- Application state based only on arbitrary layer names

Generated Figma data should remain separate from hand-written React components.

## 6. Current Code Handoff

The earlier Figma REST synchronization script and generated layout JSON have been removed. They described the retired seven-screen prototype and were not used by the running application.

The current workflow is a reviewed, one-time handoff from Figma into React components. Visual updates are applied deliberately to the corresponding `Figma*.tsx` component instead of automatically overwriting application source files.

## 7. Locofy Design-to-Code Workflow

Locofy is the selected Figma-to-code tool for the revised MVP.

Locofy is used to generate and review the visual React foundation:

- React screen and component structure
- Responsive layout and CSS
- Reusable UI components and props
- Images, icons, fonts, and other visual assets
- Static interaction structure for buttons, inputs, and navigation

Locofy is not responsible for:

- IndexedDB / Dexie behavior
- Background-removal API calls or Vercel Function code
- Item Detail add/edit business rules
- `react-rnd` drag, resize, layer, and persistence behavior
- Data validation, deletion, saving, or reopening outfits

Recommended workflow:

```text
Prepare Figma Auto Layout and components
  → run Locofy in Figma Design Mode
  → create an E-Closet React project
  → convert one view with Locofy Lightning
  → inspect responsive preview
  → review structure in Locofy Builder
  → export components or screens as a ZIP
  → place output in a temporary folder
  → review the code diff
  → manually merge approved UI into the Vite project
  → implement application logic by hand
```

Project-specific settings:

- Framework: React
- Language: TypeScript when available in the code settings
- Styling: CSS Modules or plain responsive CSS
- UI library: none/custom, unless the project explicitly adopts one later
- First pilot view: Closet

Recommended conversion order:

1. Closet
2. Item Detail add/edit variants
3. Saved Outfits
4. Outfit Builder static layout

Outfit Builder should be exported only as a visual layout; its interactive canvas must be implemented with `react-rnd`.

Generated output must not overwrite files that already contain application logic. Repeated exports should go to a temporary folder first and be merged only after reviewing the diff.

The existing custom Figma sync script and Locofy serve different purposes: the sync script may continue to produce constrained design metadata, while Locofy generates reviewable UI code. Neither tool should rewrite business logic automatically.

## 8. Migration Sequence

1. Preserve the current frames and notes as a reference baseline
2. Create an Archive section for removed screens
3. Update Item Detail to share add and edit variants
4. Update the three-item bottom navigation
5. Connect Saved Outfit cards directly to Outfit Builder
6. Add a wider responsive reference
7. Review the four-view prototype against `UXDESIGN.md`
8. Convert Closet with Locofy as a code-quality pilot
9. Export the remaining approved views through Locofy
10. Migrate the codebase according to `TECH_STACK.md`
11. Update the Figma sync allowlist and generated metadata
12. Verify implementation behavior separately from the visual prototype

## 9. Acceptance Criteria

- The existing Figma file identifiers and baseline are documented
- `UXDESIGN.md` is the single complete UX and information-architecture source
- This document does not duplicate full page specifications
- The active prototype contains only the four revised views
- Item Detail demonstrates add and edit variants in one shared design
- Bottom navigation contains Closet, Create, and Saved
- Saved Outfit cards reopen Outfit Builder directly
- Removed frames are archived or clearly excluded from the active flow
- Mobile and wider responsive intent is visible
- Figma synchronization never claims to generate business logic automatically
- Locofy output is reviewed in a temporary location before being merged
- No Locofy export overwrites hand-written application logic

## 10. Current Repository Status

The repository code still reflects the earlier Next.js and seven-screen implementation. The Markdown files describe the approved target state; code, dependencies, routes, and the sync script must be updated in a separate implementation step.
