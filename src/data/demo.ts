export const categories = ["All Items", "Tops", "Bottoms", "Shoes", "Accessories", "Outerwear", "Others"] as const;

export const clothes = [
  { id: "linen-shirt", name: "Linen shirt", category: "Tops", glyph: "♧", tone: "sand" },
  { id: "wide-trouser", name: "Wide trousers", category: "Bottoms", glyph: "Ⅱ", tone: "blue" },
  { id: "daily-sneaker", name: "Daily sneakers", category: "Shoes", glyph: "⌁", tone: "peach" },
  { id: "soft-tote", name: "Soft tote", category: "Accessories", glyph: "▱", tone: "sage" },
  { id: "light-jacket", name: "Light jacket", category: "Outerwear", glyph: "♢", tone: "lilac" },
  { id: "silk-scarf", name: "Silk scarf", category: "Accessories", glyph: "〰", tone: "rose" },
];

export const outfits = [
  { id: "slow-sunday", name: "Slow Sunday", pieces: ["♧", "Ⅱ", "⌁"], note: "3 pieces" },
  { id: "studio-day", name: "Studio Day", pieces: ["♢", "Ⅱ", "▱"], note: "3 pieces" },
  { id: "soft-layers", name: "Soft Layers", pieces: ["♧", "〰", "▱"], note: "3 pieces" },
];
