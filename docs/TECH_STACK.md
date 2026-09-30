# E-Closet MVP Tech Stack and Architecture

更新时间：2026-09-29

## 1. Current Stack

| Area | Technology | Responsibility |
| --- | --- | --- |
| Framework | Next.js 16 App Router + React | Routes, layouts, static delivery, and client UI |
| Language | TypeScript | Typed UI, database, and canvas models |
| Styling | CSS Modules + global responsive CSS | Preserve the Figma visual system without a UI framework |
| Local database | IndexedDB through Dexie | Store clothing, image Blobs, and outfits in the browser |
| Reactive queries | `dexie-react-hooks` | Refresh views automatically after database mutations |
| Outfit canvas | `react-rnd` | Bounded dragging and locked-aspect-ratio resizing |
| Layer controls | React state + CSS `z-index` | Reorder, duplicate, select, and remove outfit pieces |
| Image processing | remove.bg through `/api/remove-background` | Produce transparent WebP cutouts without exposing the API key |
| Delivery | Vercel | Build and deploy the Next.js application |

The repository remains a Next.js application. It is **not** being migrated to Vite. In a Vite project, “the Vite client” means the JavaScript application that Vite bundles and the browser executes. This project has the same browser-side responsibilities—forms, IndexedDB, and canvas interaction—but Next.js provides the build, routes, and deployment integration instead of Vite.

Zustand, Konva, Tailwind, a server database, accounts, cloud sync, PWA tooling, and personal-photo try-on are outside this MVP.

## 2. Routes

| Route | Meaning |
| --- | --- |
| `/` | Redirect to Closet |
| `/closet` | Search, filter, add, and open clothing |
| `/items/new` | Item Detail in add mode |
| `/items/[id]` | Item Detail in edit mode |
| `/outfits/new` | Outfit Detail / Builder in create mode |
| `/outfits/[id]` | Outfit Detail / Builder in edit mode |
| `/outfits` | Saved Outfits gallery |

Dynamic App Router pages await the Next.js 16 `params` promise and pass the real record ID into their client component.

## 3. Local-First Data Architecture

```text
Next.js Client Components
  ├── Dexie useLiveQuery
  ├── forms and filters
  ├── react-rnd canvas draft
  └── IndexedDB: e-closet
      ├── clothingItems
      │   └── metadata + original/processed image Blob
      └── outfits
          └── name + normalized piece geometry
```

Data belongs to the current browser and origin. It survives refreshes, but clearing site data removes it. There is no initial demo seed.

```ts
type ClothingCategory =
  | "Tops" | "Bottoms" | "Shoes"
  | "Accessories" | "Outerwear" | "Others";

type ColorTagId =
  | "red" | "rose" | "sand" | "lime"
  | "green" | "blue" | "purple";

type ClothingItem = {
  id: string;
  name: string;
  category: ClothingCategory;
  colorTag: ColorTagId;
  originalImage: Blob;
  processedImage?: Blob;
  createdAt: number;
  updatedAt: number;
};

type OutfitPiece = {
  instanceId: string;
  clothingId: string;
  xPct: number;
  yPct: number;
  widthPct: number;
  heightPct: number;
  layer: number;
};
```

Dexie schema:

```ts
this.version(1).stores({
  clothingItems: "&id, name, category, colorTag, createdAt, updatedAt",
  outfits: "&id, name, createdAt, updatedAt",
});
```

Images remain binary Blob values. Components create temporary Object URLs for display and revoke them after use. Color tags store stable IDs rather than CSS values. Outfits store clothing IDs and `0–1` normalized canvas geometry rather than screenshots. Deleting clothing runs a Dexie transaction that removes its references from every saved outfit.

## 4. Image Processing

The browser accepts JPEG, PNG, and WebP uploads up to 10 MB and always stores the untouched original Blob. Before background removal, it creates a temporary WebP copy with a maximum edge of 2000 px. This keeps the proxied request below Vercel's Function payload limit without reducing the locally stored original.

```text
Browser selects original image
  → temporary client-side resize for transport
  → POST /api/remove-background
  → Next.js Route Handler reads REMOVE_BG_API_KEY
  → remove.bg returns a transparent WebP
  → browser stores originalImage + processedImage in IndexedDB
```

The API key is server-only and must be configured as `REMOVE_BG_API_KEY` in `.env.local` and in the Vercel project environment. The UI displays `processedImage ?? originalImage`; processing and retry states prevent an unprocessed new image from being saved accidentally.

## 5. State Boundaries

- React component state: search/filter values, form drafts, drawer state, selected canvas instance, and unsaved outfit pieces.
- IndexedDB: saved clothing, images, and outfits.
- `useLiveQuery`: reactive database reads for Closet, the Builder tray, Item Detail, and Saved Outfits.
- No global state library is required.

## 6. Deployment

Vercel runs the normal Next.js build and serves the generated application. IndexedDB still executes only in the browser; Vercel does not store wardrobe data. `/api/remove-background` runs as a server-side Next.js Route Handler, and `REMOVE_BG_API_KEY` must be set for Preview and Production deployments. The provider key is never included in the client bundle.

## 7. Verification

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build` (also generates/checks App Router route types)
- Manual mobile verification of file input, IndexedDB persistence, filtering, drawer behavior, touch dragging/resizing, save/reopen, and cascade cleanup
