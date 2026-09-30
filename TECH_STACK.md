# E-Closet MVP Tech Stack and Architecture

更新时间：2026-09-26

## 1. Scope

The two-week MVP is a single-user, responsive wardrobe website with four core views: Closet, Item Detail, Outfit Builder, and Saved Outfits.

The implementation prioritizes a small static frontend, local persistence, and a complete add → browse → build → save → reopen workflow. Accounts, cloud sync, PWA features, personal-photo try-on, Outfit Detail, and Me / Settings are deferred.

## 2. Revised Stack

| Area | Technology | Responsibility |
| --- | --- | --- |
| Frontend | React + Vite | Client-side application and fast development workflow |
| Language | TypeScript | Typed item, outfit, database, and UI state models |
| Routing | Client-side routing | Routes for Closet, shared Item Detail modes, Outfit Builder, and Saved Outfits |
| Styling | Responsive CSS | Mobile-first layout that also adapts to tablet and desktop widths |
| Outfit canvas | `react-rnd` | Dragging and resizing clothing items on the outfit canvas |
| Local storage | IndexedDB | Persistent clothing, image Blob, and outfit data in the browser |
| IndexedDB wrapper | Dexie | Typed queries and mutations for local data |
| Image processing | Background-removal API | Converts uploaded clothing photos into sticker-like cutouts |
| Delivery | Vercel | Static Vite frontend plus one serverless background-removal endpoint |

Next.js, React Konva, Zustand, Tailwind CSS, a server database, and PWA tooling are not required by the revised MVP.

## 3. Application Architecture

```text
Browser
  └── React + Vite + TypeScript
      ├── Responsive CSS
      ├── Client-side routing
      ├── Item Detail add/edit state
      ├── react-rnd Outfit Builder
      └── Dexie
          └── IndexedDB
              ├── clothing items
              ├── original and processed image Blobs
              └── saved outfits and canvas positions

Image upload
  └── background-removal endpoint
      └── background-removal provider API
```

The frontend is static and has no server database. A small Vercel Function protects the background-removal provider key and forwards only image-processing requests. This does not change the local-first data model.

## 4. What “Vite Client” Means

Vite builds the React application into static HTML, CSS, and JavaScript files. Vercel serves those files from its CDN, and the application runs in the user's browser.

The Vite client is responsible for:

- Rendering the four views
- Handling client-side navigation
- Managing form and canvas interaction
- Reading and writing IndexedDB on the current device
- Sending the selected image to the same-origin `/api/remove-background` endpoint

The Vite client is not a secure server environment. Values exposed to client code, including variables prefixed with `VITE_`, are compiled into or made available to the browser bundle and must be treated as public. Therefore:

- Do not use `VITE_REMOVE_BG_API_KEY`
- Do not call the provider directly with a permanent secret from the browser
- Store `REMOVE_BG_API_KEY` in the Vercel project environment
- Read that secret only inside the Vercel Function

The deployed request flow is:

```text
Browser
  → POST /api/remove-background
  → Vercel Function reads REMOVE_BG_API_KEY
  → Function calls the background-removal provider
  → Function returns the processed image Blob
  → Browser saves the result to IndexedDB
```

This deployment is best described as a **static Vite frontend with a serverless API function**, not as a fully client-only site. The Function has no database and does not persist wardrobe data.

## 5. Routes and View Mapping

| Route | View | Mode |
| --- | --- | --- |
| `/` | Redirect | Opens `/closet` |
| `/closet` | Closet | Browse and filter |
| `/items/new` | Item Detail | Add mode |
| `/items/:id` | Item Detail | Edit mode |
| `/create` | Outfit Builder | New outfit |
| `/create?outfit=:id` | Outfit Builder | Reopen/edit saved outfit |
| `/outfits` | Saved Outfits | Gallery and reopen flow |

No `/outfits/:id` or `/settings` route is part of the revised MVP.

Static hosting must be configured to rewrite unknown application routes to `index.html` so that direct navigation and refresh work.

## 6. Data Model

```ts
type ClothingCategory =
  | "Tops"
  | "Bottoms"
  | "Shoes"
  | "Accessories"
  | "Outerwear"
  | "Others"

type ClothingItem = {
  id: string
  name: string
  category: ClothingCategory
  originalImage: Blob
  processedImage: Blob
  createdAt: number
  updatedAt: number
}

type OutfitPiece = {
  instanceId: string
  clothingId: string
  x: number
  y: number
  width: number
  height: number
  layer: number
}

type Outfit = {
  id: string
  name: string
  pieces: OutfitPiece[]
  createdAt: number
  updatedAt: number
}
```

Suggested Dexie schema:

```ts
this.version(1).stores({
  clothingItems: "id, name, category, createdAt, updatedAt",
  outfits: "id, name, createdAt, updatedAt",
})
```

Images are stored as Blob values in IndexedDB. Object URLs created for display must be revoked when their components unmount.

## 7. Item Detail Logic

One component handles both modes.

```text
route is /items/new
  → add mode
  → empty fields
  → clickable image picker
  → automatic background-removal request
  → Cancel / Save

route is /items/:id
  → edit mode
  → load item from IndexedDB
  → show stored image, name, and category
  → no Remove Background button
  → Delete / Save
```

The shared component should derive its mode from the route instead of duplicating the form and layout.

## 8. Background Removal

Recommended request flow:

```text
Select image
  → validate MIME type and size
  → show local preview
  → upload with FormData
  → receive transparent image Blob
  → show processed preview
  → save original and processed Blobs to IndexedDB
```

Requirements:

- Accept only supported image types
- Apply a clear upload size limit
- Show processing and retry states
- Apply a request timeout
- Do not expose the provider secret through a `VITE_*` variable
- Return safe user-facing errors without provider credentials or raw internal details
- Keep unsaved image Blobs out of permanent storage until Save is confirmed

The browser should call the same-origin route `/api/remove-background`; it does not need a public API endpoint environment variable in production. For local end-to-end testing of both the Vite app and the Function, use Vercel's local development workflow or run an equivalent local proxy. Provider credentials belong in the Function environment, never in browser code or the repository.

## 9. Outfit Builder with react-rnd

Each canvas element maps to one `OutfitPiece` record and one `Rnd` instance.

Minimum behavior:

- Add clothing from the item tray
- Drag within the canvas bounds
- Resize while preserving a usable minimum size
- Select one element at a time
- Bring forward and send backward
- Remove from canvas
- Reset a new draft
- Save a new outfit
- Load and update an existing outfit from `/create?outfit=:id`

Persist logical canvas values rather than DOM-only state. If the canvas changes size responsively, normalize or scale positions so reopened outfits remain visually consistent.

## 10. State Boundaries

Use component state for temporary UI state:

- Search and category filters
- Open dialogs
- Form drafts and validation
- Current canvas selection
- Unsaved outfit draft

Use IndexedDB for persistent data:

- Clothing items and image Blobs
- Saved outfits and canvas geometry

A separate global state library is unnecessary for this MVP unless implementation complexity later proves otherwise.

## 11. Vercel Deployment

One Vercel project deploys both parts:

```text
Vite build output
  → static frontend served by Vercel

api/remove-background.ts
  → Vercel Function
  → background-removal provider
```

Deployment requirements:

- Configure an SPA rewrite to `index.html` so direct visits to client routes work
- Keep `/api/remove-background` as a Vercel Function route
- HTTPS
- Store `REMOVE_BG_API_KEY` in Vercel Environment Variables for the required Preview and Production environments
- Redeploy after changing an environment variable because changes do not affect previous deployments
- Validate request method, content type, and file size inside the Function
- Add a request timeout and return controlled error messages
- No server database
- No uploaded image persistence inside the Function

Suggested project boundary after migration:

```text
/
├── api/
│   └── remove-background.ts
├── src/
│   └── React + Vite client
├── index.html
├── vite.config.ts
└── vercel.json
```

## 12. Deferred Technology

- Authentication and user accounts
- Cloud database and object storage
- Cross-device sync
- PWA manifest and service worker
- Personal-photo try-on or body segmentation
- Native application wrappers
- Analytics and social features

## 13. Technical Acceptance Criteria

- `npm run build` completes successfully after the code migration
- The application is built with React, Vite, and TypeScript
- The UI responds correctly at mobile and desktop widths
- Item and outfit data survives page refresh through IndexedDB
- Item Detail correctly switches between add and edit modes
- `react-rnd` positions and sizes persist when an outfit is saved and reopened
- Direct route refresh works on Vercel
- The browser calls the same-origin `/api/remove-background` route
- `REMOVE_BG_API_KEY` is available only to the Vercel Function
- No secret background-removal API key is present in the client bundle

## 14. Official References

- [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite)
- [Vercel Functions](https://vercel.com/docs/functions)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
