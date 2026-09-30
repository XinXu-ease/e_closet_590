# E-Closet MVP UX Design

更新时间：2026-09-29

## 1. Product and Navigation

E-Closet is a single-user, local-first wardrobe website. The complete MVP journey is:

```text
Closet → Add/Edit Item → Outfit Builder → Save → Saved Outfits → Reopen Builder
```

The persistent bottom navigation contains only `Closet`, `Create`, and `Saved`. Add Item shares Item Detail; create/edit Outfit shares Outfit Detail / Builder. Profile, Settings, a separate Outfit Detail page, cloud sync, and try-on are deferred.

## 2. Closet

- A real name search and horizontally scrolling filters for `All` plus six categories.
- Search and category use AND logic; color tags do not participate in filtering.
- A two-column item grid displays the uploaded image, name, category, and one color dot.
- Add Item is the final grid card rather than a header plus button.
- Loading, empty closet, no-results, and IndexedDB error states are distinct.
- Dexie live queries update the list after add, edit, or delete without a refresh.

## 3. Item Detail

The same view serves `/items/new` and `/items/[id]`.

- Add mode starts empty and shows `Cancel / Save`.
- Edit mode loads the stored record and shows `Delete / Save`.
- The image area opens a JPEG/PNG/WebP picker with a 10 MB limit.
- Selecting a valid image automatically starts background removal. The original remains local, while the processed transparent result becomes the preview and saved display image.
- Processing disables Save; failures show a clear error and Retry action.
- Name is a real input (trimmed, maximum 60 characters).
- Category is a six-option select with a placeholder.
- Color Tag is a seven-color radio group. Only the selected circle receives a `1.5px #29241F` stroke.
- Image, name, category, and tag are required before an add can be saved.
- Delete confirms first and cleans the clothing reference from saved outfits.
- New and replacement images must finish background removal before Save.

## 4. Outfit Detail / Builder

### Canvas and name

- The canvas contains one controlled `Rnd` per clothing instance.
- Pieces stay within the canvas, resize from four corners, and preserve aspect ratio.
- Selection exposes `Front`, `Back`, `Duplicate`, and `Remove`; controls are disabled without selection.
- A clothing record may be added more than once.
- Draft changes remain local until Save. Saved coordinates and sizes use `0–1` proportions.
- Outfit name is a real input. Its placeholder is the browser-local date; leaving it blank saves that date as the name.
- Save requires at least one piece.

### Add from Closet

- Collapsed state shows `Tops`, `Bottoms`, `Shoes`, and `More` trays.
- `More` opens with `Accessories` selected.
- Expanded state keeps the `ADD FROM CLOSET` label, adds a collapse arrow, and shows all six category chips.
- Tray height and glyph/label transitions communicate expansion.
- A scrollable two-column grid is populated from IndexedDB.
- Choosing an item adds it to the canvas and leaves the panel open for consecutive additions.
- Empty database and empty category states provide specific guidance.

### Save modes

- `/outfits/new`: `Cancel / Save`; Save creates a new record and opens Saved Outfits.
- `/outfits/[id]`: `Delete / Save`; Save updates the record, Delete confirms and removes it.

## 5. Saved Outfits

- Reads real Outfit records with a live query.
- Cards preserve the existing visual proportions and draw a thumbnail collage from normalized piece geometry and current clothing image Blobs.
- No screenshot is stored.
- Tapping a card opens `/outfits/[id]` with name, pieces, sizes, positions, and layers restored.
- Empty and loading states are visible.

## 6. Persistence Feedback and Limits

- Data is private to the current browser/origin and disappears if site data is cleared.
- Saving and database errors are surfaced close to the relevant action.
- Uploaded images are never written into the repository or serialized as Base64 JSON.
- Touch and pointer interactions share the same controls; primary navigation remains fixed below the Builder drawer.

## 7. Acceptance Criteria

- Add/edit/delete clothing persists across refreshes and updates all live views.
- Search, each category, and combined filtering are correct.
- Upload validation and required form states prevent incomplete data.
- Drawer filtering and repeated canvas additions work without closing the panel.
- Pieces can be selected, dragged, locked-ratio resized, reordered, duplicated, and removed without leaving the canvas.
- Save/reopen retains normalized geometry and layers.
- Empty-name outfits receive the local date; empty-canvas outfits cannot be saved.
- Deleting clothing never leaves a broken image instance in a saved outfit.
