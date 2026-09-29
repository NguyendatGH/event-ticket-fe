// Providers toàn app: TanStack Query, MotionConfig, Tooltip, Router, Toaster.

import { useState } from "react";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { MotionConfig } from "motion/react";
import { DUR, EASE_OUT } from "@/lib/motion";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createRouter } from "@/app/router";
import { createQueryClient } from "@/app/queryClient";

export default function App() {
  const [queryClient] = useState(createQueryClient);
  const [router] = useState(createRouter);
  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user" transition={{ duration: DUR.moderate, ease: EASE_OUT }}>
        <TooltipProvider delayDuration={200}>
          <RouterProvider router={router} />
          <Toaster position="bottom-right" />
        </TooltipProvider>
      </MotionConfig>
      {import.meta.env.VITE_RQ_DEVTOOLS === "true" && <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />}
    </QueryClientProvider>
  );
}
