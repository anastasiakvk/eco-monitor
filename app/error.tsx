"use client";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Error Boundary]", error.message);
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "error",
        message: error.message,
        digest: error.digest,
      }),
    }).catch(() => {});
  }, [error]);

  return (
    <div style={{
      fontFamily: "Arial, sans-serif", textAlign: "center",
      padding: "80px 20px", background: "#fff", minHeight: "100vh"
    }}>
      <div style={{ fontSize: 64, fontWeight: "bold", color: "#cc5500" }}>500</div>
      <h1 style={{ fontSize: 22, margin: "12px 0 8px" }}>Щось пішло не так</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Сталася внутрішня помилка сервера. Спробуйте ще раз.
      </p>
      <button
        onClick={reset}
        style={{
          background: "#2d6a2d", color: "#fff", border: "none",
          padding: "10px 24px", cursor: "pointer", fontSize: 14, marginRight: 12
        }}
      >
        Спробувати знову
      </button>
      <a href="/" style={{ color: "#2d6a2d", fontSize: 14 }}>На головну</a>
    </div>
  );
}