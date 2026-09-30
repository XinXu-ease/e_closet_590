import Link from "next/link";
import styles from "./BottomNavigation.module.css";

type ActivePage = "closet" | "create" | "saved";

export function BottomNavigation({ active }: { active: ActivePage }) {
  return <nav className={styles.navigation} aria-label="Primary navigation">
    <Link href="/closet" className={`${styles.item} ${active === "closet" ? styles.active : ""}`}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M8.25 3.667v14.666M13.75 3.667v14.666M3.667 3.667h14.666v14.666H3.667V3.667Z" stroke="currentColor" strokeWidth="1.833" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <span>Closet</span>
    </Link>
    <Link href="/outfits/new" className={`${styles.item} ${active === "create" ? styles.active : ""}`}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 4.583v12.834M4.583 11h12.834" stroke="currentColor" strokeWidth="1.833" strokeLinecap="round" /></svg>
      <span>Create</span>
    </Link>
    <Link href="/outfits" className={`${styles.item} ${active === "saved" ? styles.active : ""}`}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M6.417 3.667h9.166v2.75M7.333 11h7.334M3.667 6.417h14.666v11.916H3.667V6.417Z" stroke="currentColor" strokeWidth="1.833" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <span>Saved</span>
    </Link>
  </nav>;
}
