export const CLOTHING_CATEGORIES = [
  "Tops",
  "Bottoms",
  "Shoes",
  "Accessories",
  "Outerwear",
  "Others",
] as const;

export type ClothingCategory = (typeof CLOTHING_CATEGORIES)[number];

export const COLOR_TAGS = {
  red: "#DD6C66",
  rose: "#EDC2B8",
  sand: "#E8CFA8",
  lime: "#EBF521",
  green: "#AAD9AC",
  blue: "#A9C6F2",
  purple: "#A99BE8",
} as const;

export type ColorTagId = keyof typeof COLOR_TAGS;

export type ClothingItem = {
  id: string;
  name: string;
  category: ClothingCategory;
  colorTag: ColorTagId;
  originalImage: Blob;
  processedImage?: Blob;
  createdAt: number;
  updatedAt: number;
};

export type OutfitPiece = {
  instanceId: string;
  clothingId: string;
  xPct: number;
  yPct: number;
  widthPct: number;
  heightPct: number;
  layer: number;
};

export type Outfit = {
  id: string;
  name: string;
  pieces: OutfitPiece[];
  createdAt: number;
  updatedAt: number;
};

export const getDisplayImage = (item: ClothingItem) =>
  item.processedImage ?? item.originalImage;

export const isClothingCategory = (
  value: string,
): value is ClothingCategory =>
  CLOTHING_CATEGORIES.includes(value as ClothingCategory);

