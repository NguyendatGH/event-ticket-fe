// Gốc router:

import { Suspense, useEffect } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { USER_SCOPED_KEYS, onSessionExpired, useMe } from "@/api";
import { useAuthStore } from "@/stores/auth";
import { PageLoader } from "@/components/site";

export default function RootLayout() {
  const qc = useQueryClient();
  const me = useMe();

  useEffect(() => {
    if (me.data) useAuthStore.getState().setUser(me.data);
  }, [me.data]);

  useEffect(
    () =>
      onSessionExpired(() => {
        USER_SCOPED_KEYS.forEach((queryKey) => qc.removeQueries({ queryKey }));
        toast("Phiên đăng nhập đã hết hạn", { description: "Đăng nhập lại để tiếp tục." });
      }),
    [qc]
  );

  return (
    <>
      <ScrollRestoration />
      <Suspense fallback={<PageLoader className="min-h-dvh" />}>
        <Outlet />
      </Suspense>
    </>
  );
}
