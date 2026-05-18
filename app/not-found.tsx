import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      fontFamily: "Arial, sans-serif", textAlign: "center",
      padding: "80px 20px", background: "#fff", minHeight: "100vh"
    }}>
      <div style={{ fontSize: 64, fontWeight: "bold", color: "#2d6a2d" }}>404</div>
      <h1 style={{ fontSize: 22, margin: "12px 0 8px" }}>Сторінку не знайдено</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Можливо, сторінку було видалено або адресу введено неправильно.
      </p>
      <Link href="/" style={{
        background: "#2d6a2d", color: "#fff",
        padding: "10px 24px", textDecoration: "none", fontSize: 14
      }}>
        На головну
      </Link>
    </div>
  );
}