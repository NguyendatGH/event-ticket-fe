import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useAppConfig, useGoogleLogin } from "@/api";
import { riseSm } from "@/lib/motion";

const GSI_SRC = "https://accounts.google.com/gsi/client";

let gsiPromise = null;
function loadGsi() {
  if (window.google?.accounts?.id) return Promise.resolve();
  gsiPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => {
      gsiPromise = null;
      reject(new Error("Không tải được Google Identity Services"));
    };
    document.head.appendChild(script);
  });
  return gsiPromise;
}

const buttonWidth = (el) => Math.min(400, Math.max(200, Math.round(el.clientWidth) || 320));

export function GoogleAuthButton({ text = "signin_with", onSuccess }) {
  const { googleClientId } = useAppConfig();
  const googleLogin = useGoogleLogin();
  const boxRef = useRef(null);
  const [error, setError] = useState(null);

  const handleCredential = useRef(null);
  useEffect(() => {
    handleCredential.current = (idToken) => {
      setError(null);
      googleLogin.mutate(idToken, {
        onSuccess,
        onError: (err) => setError(err?.message || "Đăng nhập Google thất bại, vui lòng thử lại"),
      });
    };
  });

  useEffect(() => {
    if (!googleClientId) return;
    let cancelled = false;

    loadGsi()
      .then(() => {
        if (cancelled || !boxRef.current) return;
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (res) => handleCredential.current(res.credential),
        });
        boxRef.current.replaceChildren();
        window.google.accounts.id.renderButton(boxRef.current, {
          type: "standard",
          theme: "filled_black",
          size: "large",
          shape: "pill",
          logo_alignment: "center",
          locale: "vi",
          text,
          width: buttonWidth(boxRef.current),
        });
      })
      .catch(() => !cancelled && setError("Không tải được Google. Kiểm tra kết nối mạng rồi thử lại."));

    return () => {
      cancelled = true;
    };
  }, [googleClientId, text]);

  if (!googleClientId) return null;

  return (
    <motion.div variants={riseSm} className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-border" />
        <span className="text-meta text-muted-foreground">hoặc</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <div ref={boxRef} className="flex justify-center [color-scheme:light]" />

      {googleLogin.isPending && <p className="text-meta text-center text-muted-foreground">Đang đăng nhập…</p>}
      {error && <p className="text-meta text-center text-destructive">{error}</p>}
    </motion.div>
  );
}
