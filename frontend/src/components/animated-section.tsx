"use client"

import type React from "react"

import { motion } from "framer-motion"
import { cn } from "../lib/utils"

export function AnimatedSection({
  className,
  children,
  delay = 0,
}: {
  className?: string
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      className={cn("will-change-transform", className)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  )
}
