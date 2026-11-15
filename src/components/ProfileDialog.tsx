"use client";
import { useEffect, useRef } from "react";
import styles from "./FigmaProfile.module.css";

export function ProfileDialog({ title, onClose, children, busy = false }: { title: string; onClose: () => void; children: React.ReactNode; busy?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return <dialog ref={ref} className={styles.dialog} aria-labelledby="profile-dialog-title" onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}>
    <header className={styles.dialogHeader}><h2 id="profile-dialog-title">{title}</h2><button type="button" aria-label="Close dialog" onClick={onClose} disabled={busy}>×</button></header>
    <div className={styles.dialogBody}>{children}</div>
  </dialog>;
}
