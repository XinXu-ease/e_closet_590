# E-Closet

E-Closet is a responsive, single-user digital wardrobe. Users can manage clothing, search and filter their closet, build outfits on a draggable canvas, and reopen saved looks.

## Features

- Add, edit, and delete clothing with category and color tags
- Remove image backgrounds through remove.bg
- Store clothing, image Blobs, and outfits locally in IndexedDB
- Search and filter the closet by name, category, and color
- Drag, resize, layer, duplicate, and remove outfit pieces
- Save and reopen outfits with responsive thumbnail previews
- Display local weather in the Outfit Builder with Open-Meteo

## Tech Stack

- Next.js 16, React, and TypeScript
- CSS Modules
- Dexie and IndexedDB
- `react-rnd`
- remove.bg and Open-Meteo APIs
- Vercel deployment

## Getting Started

```bash
npm install
```

Create `.env.local` in the project root:

```env
REMOVE_BG_API_KEY=your_remove_bg_api_key
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Data and Privacy

Wardrobe data remains in the current browser and origin. Clearing site data removes it. Uploaded images are sent to remove.bg for processing, and rounded browser coordinates are sent through the app's weather route to Open-Meteo. Location permission is optional and weather failure does not block outfit creation.

Additional product and architecture notes are available in [`docs/`](./docs/).
