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
        <span aria-hidden="true">+</span>
      </Link> : null}
    </header>
  );
}
