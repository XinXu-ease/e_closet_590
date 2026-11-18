"use client";
/* eslint-disable @next/next/no-img-element -- IndexedDB Blob URLs are local and cannot use the Next image optimizer. */

import Link from "next/link";
import { useObjectUrl } from "@/hooks/useObjectUrl";
import { getDisplayImage, type ClothingItem } from "@/lib/types";
import styles from "./ClothingCard.module.css";

type ClothingCardProps = {
  item: ClothingItem;
  onClick?: () => void;
};

export function ClothingCard({ item, onClick }: ClothingCardProps) {
  const imageUrl = useObjectUrl(getDisplayImage(item));
  const content = (
    <>
      <span className={styles.preview}>
        {imageUrl ? <img src={imageUrl} alt="" /> : null}
      </span>
      <span className={styles.tape} aria-label={`${item.colorTag} tape tag`}>
        <img src={`/figma/tape-${item.colorTag}.png`} alt="" />
      </span>
      <span className={styles.name}>{item.name}</span>
      <span className={styles.metadata}>
        <span className={styles.category}>{item.category}</span>
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={`${styles.card} ${styles.button}`}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <Link className={styles.card} href={`/items/${item.id}`}>
      {content}
    </Link>
  );
}
