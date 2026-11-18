# Typography tokens

## Foundations

E-Closet uses one typeface throughout the interface:

```css
font-family: "Old Standard TT", Georgia, serif;
```

Only two weights are used:

- `400` — regular
- `700` — emphasis

Typography has four text sizes:

| Foundation token | Value |
| --- | ---: |
| `--font-size-display` | 30px |
| `--font-size-title` | 24px |
| `--font-size-body` | 16px |
| `--font-size-ui` | 12px |

Icons are not text tokens. Search uses `--icon-size-search` (20px), while the larger close, add, and collapse symbols use `--icon-size-control` (24px).

## Semantic roles

| Role | Size | Weight | Default color | Use |
| --- | ---: | ---: | --- | --- |
| Page title | 30px | 700 | Ink | Top-level page heading |
| Detail or dialog title | 24px | 700 | Ink | Item detail, modal title, primary statistics |
| Body | 16px | 400 | Ink | Form values, dialog copy, profile rows |
| Body emphasis / button | 16px | 700 | Ink | Field labels, primary actions, emphasized content |
| Secondary text | 12px | 400 | Muted | Subtitles, helper copy, metadata, status text |
| UI label | 12px | 400 / 700 | Olive / Ink | Tabs, navigation, badges; use 700 with Ink when active |

`700` and an intentional color change are the only emphasis treatment. Emphasis never changes the text size.

## CSS usage

Use variables from `src/app/globals.css`; do not introduce literal text sizes, font families, or `600` font weight in component styles.

```css
.title {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-display);
  font-weight: var(--font-weight-bold);
}

.helper {
  color: var(--color-text-muted);
  font-size: var(--font-size-ui);
  font-weight: var(--font-weight-regular);
}
```

## Color roles

| Token | Value | Use |
| --- | --- | --- |
| `--color-text-primary` | `#29241f` | Standard text |
| `--color-text-muted` | `#756e63` | Secondary text |
| `--color-text-olive` | `#5b5200` | Inactive navigation and tabs |
| `--color-text-error` | `#a33f39` | Errors |
| `--color-text-success` | `#35643a` | Success states |

