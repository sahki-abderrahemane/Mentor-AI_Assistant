"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState } from "react";

type MotionDivProps = HTMLMotionProps<"div">;

export function MotionDiv({ children, ...props }: MotionDivProps) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  return <MotionDiv>{children}</MotionDiv>;
}