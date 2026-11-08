import { useEffect, useRef, useState } from "react";

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GSI_SRC = "https://accounts.google.com/gsi/client";

interface GsiCredentialResponse {
  credential: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: GsiCredentialResponse) => void }) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

let gsiLoader: Promise<void> | null = null;

/** Carrega o Google Identity Services uma única vez. */
function loadGsi(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  gsiLoader ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      gsiLoader = null;
      reject(new Error("Falha ao carregar o Google."));
    };
    document.head.appendChild(script);
  });
  return gsiLoader;
}

interface Props {
  onCredential: (credential: string) => void;
  text?: "signin_with" | "signup_with" | "continue_with";
  disabled?: boolean;
}

/** Botão oficial do Google. O `credential` devolvido é o id_token que o backend valida em /auth/google. */
export function GoogleButton({ onCredential, text = "continue_with", disabled }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handlerRef = useRef(onCredential);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    handlerRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelled = false;
    loadGsi()
      .then(() => {
        const element = containerRef.current;
        if (cancelled || !element || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => handlerRef.current(response.credential),
        });
        element.innerHTML = "";
        window.google.accounts.id.renderButton(element, {
          type: "standard",
          theme: "filled_black",
          size: "large",
          shape: "pill",
          text,
          logo_alignment: "left",
          locale: "pt-BR",
          width: Math.min(400, Math.max(200, element.clientWidth || 320)),
        });
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [text]);

  if (!GOOGLE_CLIENT_ID) {
    return import.meta.env.DEV ? (
      <p className="rounded-lg border border-dashed border-white/15 px-3 py-2 text-center text-xs text-slate-500">
        Login com Google desativado: defina VITE_GOOGLE_CLIENT_ID no .env.
      </p>
    ) : null;
  }
  if (failed) return <p className="text-center text-xs text-slate-500">Não foi possível carregar o login com Google.</p>;

  return (
    <div
      ref={containerRef}
      aria-disabled={disabled}
      className={`flex min-h-11 w-full justify-center ${disabled ? "pointer-events-none opacity-50" : ""}`}
    />
  );
}