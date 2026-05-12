"use client";

import { MotionConfig } from "framer-motion";

/**
 * Envolve o app no Framer Motion `<MotionConfig reducedMotion="user">` para
 * que toda animação respeite a preferência `prefers-reduced-motion: reduce`
 * do sistema operacional do usuário (acessibilidade).
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
