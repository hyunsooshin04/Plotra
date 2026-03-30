import { useEffect, useState } from "react";

type HealthResponse = {
  service: string;
  status: string;
  timestamp: string;
  databaseConfigured: boolean;
};

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/health", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("백엔드 상태를 가져오지 못했습니다.");
        }

        return (await response.json()) as HealthResponse;
      })
      .then((payload) => {
        setHealth(payload);
      })
      .catch((fetchError: Error) => {
        if (fetchError.name === "AbortError") {
          return;
        }

        setError(fetchError.message);
      });

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Plotra Monorepo</p>
        <h1>React 프론트엔드와 TypeScript 백엔드가 연결된 기본 구조</h1>
        <p className="hero-copy">
          로컬 개발에서는 Vite 프록시를 통해 백엔드와 연결되고, Docker
          실행에서는 Nginx가 같은 역할을 수행합니다.
        </p>

        <div className="status-grid">
          <article className="status-card">
            <span>프론트엔드</span>
            <strong>running</strong>
            <small>Vite + React + TypeScript</small>
          </article>

          <article className="status-card">
            <span>백엔드 상태</span>
            <strong>{health?.status ?? (error ? "error" : "checking")}</strong>
            <small>
              {health
                ? new Date(health.timestamp).toLocaleString("ko-KR")
                : (error ?? "응답 대기 중")}
            </small>
          </article>

          <article className="status-card">
            <span>DB 설정</span>
            <strong>
              {health?.databaseConfigured ? "configured" : "pending"}
            </strong>
            <small>PostgreSQL은 docker compose로 관리</small>
          </article>
        </div>
      </section>
    </main>
  );
}
