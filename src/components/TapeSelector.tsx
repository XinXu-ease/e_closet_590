/* eslint-disable @next/next/no-img-element -- Tape artwork is served directly from public assets. */

import { TAPE_COLORS, type ColorTagId } from "@/lib/types";
import styles from "./TapeSelector.module.css";

type TapeSelectorProps = {
  value: ColorTagId | "";
  onChange: (color: ColorTagId) => void;
  name: string;
  disabled?: boolean;
  compact?: boolean;
};

export function TapeSelector({ value, onChange, name, disabled = false, compact = false }: TapeSelectorProps) {
  return <div className={`${styles.options} ${compact ? styles.compact : ""}`}>
    {TAPE_COLORS.map((color) => <label key={color} className={styles.option} aria-label={`${color} tape`}>
      <input className={styles.input} type="radio" name={name} value={color} checked={value === color} onChange={() => onChange(color)} disabled={disabled} />
      <span className={styles.image}><img src={`/figma/tape-${color}.png`} alt="" /></span>
    </label>)}
  </div>;
}
