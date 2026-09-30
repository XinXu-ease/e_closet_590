"use client";
/* eslint-disable @next/next/no-img-element -- IndexedDB Blob URLs are local and cannot use the Next image optimizer. */

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useObjectUrl } from "@/hooks/useObjectUrl";
import { db, deleteClothingItemCascade } from "@/lib/db";
import {
  CLOTHING_CATEGORIES,
  COLOR_TAGS,
  getDisplayImage,
  type ClothingCategory,
  type ColorTagId,
} from "@/lib/types";
import styles from "./FigmaItemDetail.module.css";

type FigmaItemDetailProps = { mode: "add" | "edit"; itemId?: string };

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PROCESSING_EDGE = 2000;

async function prepareImageForRemoval(file: File) {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_PROCESSING_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image canvas is unavailable.");
    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", 0.88);
    });
    if (!blob) throw new Error("The image could not be prepared.");
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "clothing"}.webp`, {
      type: "image/webp",
    });
  } finally {
    bitmap.close();
  }
}

async function responseError(response: Response) {
  try {
    const payload = await response.json() as { error?: string };
    return payload.error || "Background removal failed.";
  } catch {
    return "Background removal failed.";
  }
}

function formatError(error: unknown) {
  if (error instanceof DOMException && error.name === "QuotaExceededError") {
    return "This browser does not have enough local storage for that image.";
  }
  return "The change could not be saved. Check that local browser storage is available.";
}

export default function FigmaItemDetail({ mode, itemId }: FigmaItemDetailProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemQuery = useLiveQuery(async () => {
    try {
      return { item: itemId ? (await db.clothingItems.get(itemId)) ?? null : null, error: "" };
    } catch {
      return { item: null, error: "Your local closet could not be opened in this browser." };
    }
  }, [itemId]);
  const item = itemQuery?.item;
  const loadError = itemQuery?.error ?? "";
  const [initializedId, setInitializedId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ClothingCategory | "">("");
  const [colorTag, setColorTag] = useState<ColorTagId | "">("");
  const [newImage, setNewImage] = useState<File>();
  const [processedImage, setProcessedImage] = useState<Blob>();
  const [processing, setProcessing] = useState(false);
  const [processingError, setProcessingError] = useState("");
  const processingRequest = useRef(0);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode === "edit" && item && initializedId !== item.id) {
      // A live database record initializes this local, editable draft once.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(item.name);
      setCategory(item.category);
      setColorTag(item.colorTag);
      setInitializedId(item.id);
    }
  }, [initializedId, item, mode]);

  const displayBlob = newImage
    ? processedImage ?? newImage
    : item ? getDisplayImage(item) : undefined;
  const imageUrl = useObjectUrl(displayBlob);
  const isLoading = mode === "edit" && itemId && itemQuery === undefined;
  const isMissing = mode === "edit" && itemId && itemQuery !== undefined && !loadError && item === null;
  const isUnavailable = mode === "edit" && Boolean(loadError);
  const isBlocked = Boolean(isMissing || isUnavailable);
  const newImageNeedsProcessing = Boolean(newImage && !processedImage);
  const isAddInvalid = mode === "add" && (!newImage || !processedImage || !name.trim() || !category || !colorTag);

  const removeBackground = async (file: File) => {
    const requestId = ++processingRequest.current;
    setProcessing(true);
    setProcessingError("");
    setProcessedImage(undefined);
    try {
      const preparedImage = await prepareImageForRemoval(file);
      const body = new FormData();
      body.append("image", preparedImage);
      const response = await fetch("/api/remove-background", {
        method: "POST",
        body,
      });
      if (!response.ok) throw new Error(await responseError(response));
      const result = await response.blob();
      if (!result.type.startsWith("image/")) {
        throw new Error("Background removal returned an invalid image.");
      }
      if (processingRequest.current === requestId) {
        setProcessedImage(result);
      }
    } catch (processingFailure) {
      if (processingRequest.current === requestId) {
        setProcessingError(
          processingFailure instanceof Error
            ? processingFailure.message
            : "Background removal failed.",
        );
      }
    } finally {
      if (processingRequest.current === requestId) setProcessing(false);
    }
  };

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Choose a JPEG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("The image must be 10 MB or smaller.");
      event.target.value = "";
      return;
    }
    setNewImage(file);
    setProcessedImage(undefined);
    setError("");
    void removeBackground(file);
  };

  const validate = () => {
    if (!displayBlob) return "Add an image before saving.";
    if (processing) return "Wait for background removal to finish.";
    if (newImageNeedsProcessing) return "Remove the background before saving.";
    if (!name.trim()) return "Enter a name before saving.";
    if (!category) return "Choose a category before saving.";
    if (!colorTag) return "Choose a color tag before saving.";
    return "";
  };

  const save = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const now = Date.now();
      if (mode === "add") {
        await db.clothingItems.add({
          id: crypto.randomUUID(),
          name: name.trim(),
          category: category as ClothingCategory,
          colorTag: colorTag as ColorTagId,
          originalImage: newImage as Blob,
          processedImage: processedImage as Blob,
          createdAt: now,
          updatedAt: now,
        });
      } else if (item) {
        await db.clothingItems.put({
          ...item,
          name: name.trim(),
          category: category as ClothingCategory,
          colorTag: colorTag as ColorTagId,
          originalImage: newImage ?? item.originalImage,
          processedImage: newImage ? processedImage : item.processedImage,
          updatedAt: now,
        });
      }
      router.push("/closet");
    } catch (saveError) {
      setError(formatError(saveError));
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!item || !window.confirm(`Delete “${item.name}” from your closet?`)) return;
    setSaving(true);
    setError("");
    try {
      await deleteClothingItemCascade(item.id);
      router.push("/closet");
    } catch (deleteError) {
      setError(formatError(deleteError));
      setSaving(false);
    }
  };

  return <div data-layer={mode === "edit" ? "AUTO / Item Detail — Edit" : "AUTO / Item Detail — Add"} className={styles.screen}>
    {isBlocked ? <div className={styles.notFound}>{loadError || "This clothing item no longer exists."}<br /><button type="button" onClick={() => router.push("/closet")}>Return to Closet</button></div> : null}

    {!isBlocked ? <form className={styles.form} onSubmit={(event) => { event.preventDefault(); void save(); }}>
      <button type="button" data-layer={imageUrl ? "Image / Existing item" : "Image picker / Empty"} className={`${styles.imageButton} ${imageUrl ? styles.hasImage : ""}`} onClick={() => fileInputRef.current?.click()} disabled={saving}>
        {imageUrl ? <img src={imageUrl} alt="Selected clothing" /> : <>
          <span className={styles.uploadIcon} aria-hidden="true">＋</span>
          <span className={styles.uploadPrompt}>Tap to choose a photo</span>
          <span className={styles.uploadHelper}>JPEG, PNG or WebP · max 10 MB</span>
        </>}
      </button>
      <input ref={fileInputRef} className={styles.hiddenInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} />

      <div data-layer="Frame 6" className={styles.fields}>
        <label data-layer="Frame 7" className={styles.field}>Name
          <input data-layer="Field / Name" className={styles.control} value={name} maxLength={60} placeholder="Item name" onChange={(event) => setName(event.target.value)} disabled={saving} />
        </label>
        <label data-layer="Frame 8" className={styles.field}>Category
          <select data-layer="Field / Category" className={styles.control} value={category} onChange={(event) => setCategory(event.target.value as ClothingCategory | "")} disabled={saving} required>
            <option value="" disabled>Choose a category</option>
            {CLOTHING_CATEGORIES.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <fieldset data-layer="Frame 9" className={styles.field} style={{ border: 0, padding: 0, margin: 0 }}>
          <legend>Tag</legend>
          <div data-layer="Frame 10" className={styles.tags}>
            {(Object.entries(COLOR_TAGS) as [ColorTagId, string][]).map(([id, color]) => <label key={id} className={styles.tagLabel} aria-label={id}>
              <input className={styles.tagInput} type="radio" name="color-tag" value={id} checked={colorTag === id} onChange={() => setColorTag(id)} disabled={saving} />
              <span className={styles.tagCircle} style={{ backgroundColor: color }} />
            </label>)}
          </div>
        </fieldset>
      </div>
      <div className={`${styles.status} ${error || processingError ? styles.error : ""}`} role="status">
        {isLoading ? "Loading item…" : error || processingError || (processing ? "Removing background…" : processedImage && newImage ? "Background removed." : saving ? "Saving…" : "")}
        {processingError && newImage ? <button type="button" className={styles.retry} onClick={() => void removeBackground(newImage)} disabled={processing}>Retry</button> : null}
      </div>
    </form> : null}

    {!isBlocked ? <div data-layer="Frame 16" className={styles.actions}>
      {mode === "edit" ? <button type="button" className={`${styles.action} ${styles.danger}`} onClick={() => void remove()} disabled={saving || !item}>Delete</button> : <button type="button" className={`${styles.action} ${styles.secondary}`} onClick={() => router.push("/closet")} disabled={saving}>Cancel</button>}
      <button type="button" className={`${styles.action} ${styles.primary}`} onClick={() => void save()} disabled={saving || processing || Boolean(isLoading) || isAddInvalid || newImageNeedsProcessing}>Save</button>
    </div> : null}

    <header data-layer="Frame 5" className={styles.topBar}>
      <button type="button" aria-label="Back to Closet" className={styles.back} onClick={() => router.push("/closet")}>←</button>
      <div data-layer="Title" className={styles.title}>Item Detail</div>
      <div data-layer="Mode" className={styles.mode}>{mode === "edit" ? "EDIT" : "ADD"}</div>
    </header>
  </div>;
}
