/* eslint-disable @next/next/no-img-element -- Figma collage assets require precise CSS cropping. */
import Link from "next/link";
import styles from "./BottomNavigation.module.css";

type ActivePage = "closet" | "create" | "saved" | "profile";

const items: Array<{
  id: ActivePage;
  href: string;
  label: string;
  image: string;
  imageClass: "closetImage" | "createImage" | "savedImage" | "profileImage";
}> = [
  { id: "closet", href: "/closet", label: "Closet", image: "/figma/tabicon-closet.png", imageClass: "closetImage" },
  { id: "create", href: "/outfits/new", label: "Create", image: "/figma/tabicon-create.png", imageClass: "createImage" },
  { id: "saved", href: "/outfits", label: "Saved", image: "/figma/tabicon-saved.png", imageClass: "savedImage" },
  { id: "profile", href: "/profile", label: "Profile", image: "/figma/tabicon-profile.png", imageClass: "profileImage" },
];

export function BottomNavigation({ active }: { active: ActivePage }) {
  return <nav className={styles.navigation} aria-label="Primary navigation">
    {items.map((item) => (
      <Link key={item.id} href={item.href} aria-current={active === item.id ? "page" : undefined} className={`${styles.item} ${active === item.id ? styles.active : ""}`}>
        <span className={`${styles.imageFrame} ${styles[item.imageClass]}`} aria-hidden="true">
          <img src={item.image} alt="" />
        </span>
        <span className={styles.label}>{item.label}</span>
      </Link>
    ))}
  </nav>;
}
