import { useEffect, useRef } from "react";
import { useBlocker } from "react-router-dom";

export function useUnsavedChangesGuard(isDirty) {
  const allowNav = useRef(false);
  const blocker = useBlocker(({ currentLocation, nextLocation }) => !allowNav.current && isDirty && currentLocation.pathname !== nextLocation.pathname);

  useEffect(() => {
    if (!isDirty) return undefined;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  const allowNextNavigation = () => {
    allowNav.current = true;
  };

  return { blocker, allowNextNavigation };
}
