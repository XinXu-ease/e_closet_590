# E-Closet MVP UX Design

更新时间：2026-09-26

## 1. Product Summary

E-Closet is a single-user, responsive wardrobe website for organizing clothing and building outfits. The two-week MVP focuses on one complete local workflow: add or edit clothing, browse the closet, create an outfit, save it, and reopen it later.

The MVP contains four core views:

1. Closet
2. Item Detail
3. Outfit Builder
4. Saved Outfits

`Add New Item` is not a separate view. It is the add mode of Item Detail. `Outfit Detail` and `Me / Settings` are removed from the MVP because the core journey can be completed without them.

## 2. MVP User Journey

```text
Closet
  → open Item Detail in add mode
  → choose an image and enter item information
  → save the item locally
  → browse or filter the Closet
  → open Outfit Builder
  → arrange clothing on the canvas
  → save the outfit locally
  → open Saved Outfits
  → reopen the saved outfit in Outfit Builder
```

All wardrobe and outfit data is stored in the current browser through IndexedDB. No account or cloud sync is required.

## 3. Information Architecture

| Core view | Suggested route | Purpose |
| --- | --- | --- |
| Closet | `/closet` | Browse, search, and filter clothing |
| Item Detail — add mode | `/items/new` | Add a new clothing item using the shared Item Detail layout |
| Item Detail — edit mode | `/items/:id` | View, edit, or delete an existing item |
| Outfit Builder | `/create` | Create a new outfit or reopen an existing one |
| Saved Outfits | `/outfits` | Browse saved outfits and reopen one in Outfit Builder |

The root route `/` should open or redirect to `/closet`.

### Primary navigation

The persistent bottom navigation has three destinations:

| Navigation item | Destination |
| --- | --- |
| Closet | Closet |
| Create | Outfit Builder |
| Saved | Saved Outfits |

Item Detail is reached from Closet and uses a back action instead of a bottom-navigation item.

## 4. View Specifications

### 4.1 Closet

**Purpose:** Let the user browse, search, filter, add, and open clothing items.

**Must include:**

- Page title: `Closet`
- Plus button that opens Item Detail in add mode
- Search field
- Category filters: All Items, Tops, Bottoms, Shoes, Accessories, Outerwear, and Others
- Responsive clothing grid
- Item cards containing image, name, and category
- Bottom navigation

**Main interactions:**

- Tap the plus button to open `/items/new`
- Tap an item to open `/items/:id`
- Enter a search term to filter by item name
- Select a category to filter the grid

**Required states:**

- Loading local data
- Empty closet with an Add Item action
- No matching search or filter results
- Normal clothing grid

### 4.2 Item Detail — shared add/edit view

Item Detail uses one shared layout and changes its content and actions according to the entry path.

#### Shared layout

- Back button to Closet
- Large image container at the top
- Item name field
- Category field
- Bottom action row
- Clear validation, processing, success, and error feedback

#### Add mode

**Entry:** The user taps the plus button in Closet.

**Behavior:**

- The page opens with an empty image container, empty name, and default category
- The image container is clickable and opens the browser image picker
- After image selection, background removal starts automatically
- The container shows the selected image, processing state, or cutout result
- Name and Category keep the same form UI used in edit mode
- Bottom actions are `Cancel` and `Save`
- `Cancel` returns to Closet without creating an item
- `Save` writes the item and processed image to IndexedDB, then returns to Closet

**Validation states:**

- Unsupported file type
- File too large
- Background removal in progress
- Background removal failed with a retry action
- Save disabled until image, name, and category are valid

#### Edit mode

**Entry:** The user taps an existing item in Closet.

**Behavior:**

- The page loads the item image, name, and category
- The existing image appears in the top container
- There is no `Remove Background` button
- The user can edit name and category directly
- Bottom actions are `Delete` and `Save`
- `Delete` asks for confirmation, removes the item, and returns to Closet
- `Save` updates the item in IndexedDB and returns to Closet

Item Detail does not include `Add to Outfit`.

### 4.3 Outfit Builder

**Purpose:** Let the user create a new outfit or continue editing a saved outfit.

**Must include:**

- Page title: `Outfit Builder`
- Responsive outfit canvas
- Clothing tray populated from IndexedDB
- Category filters for the tray
- Draggable and resizable clothing elements implemented with `react-rnd`
- Selected-item controls for layer order and removal
- Reset action
- `Save Outfit` action
- Bottom navigation

**Main interactions:**

- Tap a clothing item to add it to the canvas
- Drag an item to reposition it
- Resize an item with visible handles
- Move an item forward or backward
- Remove an item from the canvas
- Save a new outfit with a name
- Update an existing outfit after reopening it from Saved Outfits

**Required states:**

- Empty canvas with brief instructions
- Canvas with items
- Selected item with resize and layer controls
- Empty Closet guidance when no clothing is available
- Save-name dialog
- Save error and success feedback

### 4.4 Saved Outfits

**Purpose:** Let the user browse saved outfits and reopen them for editing.

**Must include:**

- Page title: `Saved Outfits`
- Responsive outfit grid
- Outfit preview, name, and item count
- Create Outfit action
- Bottom navigation

**Main interactions:**

- Tap an outfit card to reopen that outfit directly in Outfit Builder
- Tap Create Outfit to open a blank Outfit Builder
- Delete an outfit from the Saved Outfits view with confirmation if deletion is included

There is no separate Outfit Detail view in the MVP.

## 5. Responsive Behavior

The interface is mobile-first but must work as a responsive website rather than a fixed phone mockup.

- Start from a compact mobile layout around 390 px wide
- Keep touch targets at least 44 × 44 px where practical
- Use one-column forms on mobile
- Allow clothing and outfit grids to gain columns on wider screens
- Keep the builder usable on touch and pointer devices
- Keep primary actions visible without covering editable content
- Respect safe-area insets for mobile bottom navigation
- Avoid interactions that depend only on hover

## 6. Local Data and Feedback

- Clothing items and outfits persist in IndexedDB
- Refreshing the page must not erase saved data
- The UI must distinguish loading, empty, processing, success, and error states
- Removing an item that appears in saved outfits must not leave broken canvas elements
- If background removal requires a network connection, the UI must explain network failures clearly

## 7. Deferred Beyond the Two-Week MVP

- Accounts and authentication
- Cloud database or cross-device sync
- PWA installation and offline asset caching
- Personal-photo virtual try-on
- Outfit Detail page
- Me / Settings page
- Social sharing, collaboration, and recommendations
- Native iOS or Android apps

## 8. UX Acceptance Criteria

- The product exposes only the four core views defined above
- Add and edit use the same Item Detail layout with the correct conditional actions
- Add mode has `Cancel` and `Save`; edit mode has `Delete` and `Save`
- Edit mode has no Remove Background button
- Item Detail has no Add to Outfit action
- A newly saved item appears in Closet immediately
- A saved outfit appears in Saved Outfits immediately
- Tapping a saved outfit reopens it in Outfit Builder with its arrangement preserved
- The complete journey works at mobile and desktop widths
- No removed or deferred view is required to finish the core journey
