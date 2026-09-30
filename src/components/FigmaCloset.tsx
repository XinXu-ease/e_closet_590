"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { BottomNavigation } from "./BottomNavigation";
import { ClothingCard } from "./ClothingCard";
import { db } from "@/lib/db";
import { useHorizontalDragScroll } from "@/hooks/useHorizontalDragScroll";
import { CLOTHING_CATEGORIES, type ClothingCategory } from "@/lib/types";
import styles from "./FigmaCloset.module.css";

type Filter = "All" | ClothingCategory;

export default function FigmaCloset() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Filter>("All");
  const filterDrag = useHorizontalDragScroll<HTMLDivElement>();
  const query = useLiveQuery(async () => {
    try {
      return { items: await db.clothingItems.orderBy("createdAt").reverse().toArray(), error: "" };
    } catch {
      return { items: [], error: "Your local closet could not be opened in this browser." };
    }
  }, []);
  const items = query?.items;
  const databaseError = query?.error ?? "";

  const filteredItems = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return (items ?? []).filter((item) =>
      (category === "All" || item.category === category) &&
      (!query || item.name.toLocaleLowerCase().includes(query)),
    );
  }, [category, items, search]);

  const isLoading = items === undefined && !databaseError;
  const hasFilters = search.trim().length > 0 || category !== "All";

  return <div data-layer="AUTO / Closet" className={styles.screen}>
    <header className={styles.header}>
      <div className={styles.brand}>E-CLOSET</div>
      <div className={styles.title}>Closet</div>
      <div className={styles.subtitle}>Everything you own, ready to style.</div>
    </header>

    <label className={styles.search}>
      <span className={styles.searchIcon} aria-hidden="true">⌕</span>
      <input type="search" value={search} maxLength={60} placeholder="Search your closet" aria-label="Search your closet by name" onChange={(event) => setSearch(event.target.value)} />
    </label>

    <div className={styles.filters} aria-label="Filter by category" {...filterDrag}>
      {(["All", ...CLOTHING_CATEGORIES] as Filter[]).map((filter) => <button key={filter} type="button" className={`${styles.filter} ${category === filter ? styles.filterActive : ""}`} aria-pressed={category === filter} onClick={() => setCategory(filter)}>{filter}</button>)}
    </div>

    <section className={styles.content} aria-live="polite">
      <div data-layer="Frame 1" className={styles.grid}>
        {isLoading ? <p className={styles.state}>Loading your closet…</p> : null}
        {databaseError ? <p className={`${styles.state} ${styles.error}`}>{databaseError}</p> : null}
        {!isLoading && !databaseError && filteredItems.length === 0 ? <p className={styles.state}>{hasFilters ? "No items match this search and category." : "Your closet is empty. Add your first piece below."}</p> : null}
        {filteredItems.map((item) => <ClothingCard key={item.id} item={item} />)}
        <Link href="/items/new" aria-label="Add item" className={styles.addCard}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 6v16M6 14h16" stroke="#29241F" strokeWidth="2" strokeLinecap="round" /></svg>
        </Link>
      </div>
    </section>
    <BottomNavigation active="closet" />
  </div>;
}
