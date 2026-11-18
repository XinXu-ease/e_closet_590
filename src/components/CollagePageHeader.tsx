import Link from "next/link";
import styles from "./CollagePageHeader.module.css";

type CollagePageHeaderProps = {
  title: string;
  description: string;
  addHref?: string;
  addLabel?: string;
};

export function CollagePageHeader({
  title,
  description,
  addHref,
  addLabel,
}: CollagePageHeaderProps) {
  return (
    <header className={`${styles.header} ${addHref ? "" : styles.headerWithoutAction}`}>
      <span className={styles.collageMark} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- CSS cropping preserves the Figma sprite geometry. */}
        <img src="/figma/saved-outfits-header.png" alt="" />
      </span>
      <div className={styles.copy}>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {addHref ? <Link href={addHref} className={styles.addButton} aria-label={addLabel}>
        <svg aria-hidden="true" width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 6v16M6 14h16" stroke="#29241F" strokeWidth="2" strokeLinecap="round" /></svg>
      </Link> : null}
    </header>
  );
}
