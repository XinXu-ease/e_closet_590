export const CLOTHING_CATEGORIES = [
  "Tops",
  "Bottoms",
  "Shoes",
  "Accessories",
  "Outerwear",
  "Others",
] as const;

export type ClothingCategory = (typeof CLOTHING_CATEGORIES)[number];

export const TAPE_COLORS = [
  "yellow",
  "red",
  "blue",
  "purple",
  "orange",
  "green",
] as const;

export type ColorTagId = (typeof TAPE_COLORS)[number];

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

