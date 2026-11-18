/* eslint-disable @next/next/no-img-element -- Fixed local SVG decorations keep their original hand-drawn dimensions. */
import styles from "./CollageGuideLines.module.css";

export function CollageGuideLines() {
  return <div className={styles.lines} aria-hidden="true">
    <img className={styles.vertical} src="/figma/profile-line-vertical.svg" alt="" />
    <img className={styles.horizontal} src="/figma/profile-line-horizontal.svg" alt="" />
  </div>;
}
