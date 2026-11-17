"use client";

import styles from "./FigmaProfile.module.css";

export function SignInPrompt({ onLogin }: { onLogin: () => void }) {
  return <div className={styles.stack}>
    <p>Sign in to save your name and avatar and keep this local closet assigned to your account.</p>
    <button type="button" className={styles.primary} onClick={onLogin}>Log in / Register</button>
    <p className={styles.note}>Your wardrobe stays on this device.</p>
  </div>;
}
