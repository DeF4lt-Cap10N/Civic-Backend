import { useMemo } from "react";

export default function Index() {
  const curlSignup = useMemo(
    () =>
      `curl -X POST https://$HOST/api/auth/signup \\\n  -H "Content-Type: application/json" \\\n  -d '{"name":"Jane Citizen","email":"jane@example.com","password":"pass123"}'`,
    []
  );
  const curlLogin = useMemo(
    () =>
      `curl -X POST https://$HOST/api/auth/login \\\n  -H "Content-Type: application/json" \\\n  -d '{"email":"jane@example.com","password":"pass123"}'`,
    []
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.25),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.2),transparent_40%)]" />
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
              Civic Issue Reporting Backend
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl">
              A unified Node.js + Express + MongoDB backend for both the Citizen Mobile App and the Admin Dashboard. JWT auth, role-based access, reports, departments, and analytics.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold shadow">
                JWT Auth
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-4 py-2 text-sm font-semibold shadow">
                Reports API
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-foreground shadow">
                Analytics
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-6 grid md:grid-cols-2 gap-8 -mt-10">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Auth Endpoints</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><code className="text-foreground">POST /api/auth/signup</code> — citizen signup</li>
            <li><code className="text-foreground">POST /api/auth/login</code> — JWT login</li>
          </ul>
          <div className="mt-4 rounded-lg bg-muted p-3 text-xs font-mono whitespace-pre-wrap select-all">{curlSignup}</div>
          <div className="mt-2 rounded-lg bg-muted p-3 text-xs font-mono whitespace-pre-wrap select-all">{curlLogin}</div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Reports & Admin</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Citizen: <code className="text-foreground">POST /api/reports</code>, <code className="text-foreground">GET /api/reports/my</code>, <code className="text-foreground">GET /api/reports/:id</code></li>
            <li>Staff/Admin: <code className="text-foreground">GET /api/reports</code> (filters), <code className="text-foreground">PUT /api/reports/:id/status</code>, <code className="text-foreground">PUT /api/reports/:id/assign</code>, <code className="text-foreground">POST /api/reports/:id/notify</code></li>
            <li>Departments: <code className="text-foreground">GET/POST/PUT/DELETE /api/departments</code></li>
            <li>Analytics: <code className="text-foreground">/api/analytics/summary</code>, <code className="text-foreground">/trends</code>, <code className="text-foreground">/heatmap</code></li>
          </ul>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold">Roles</h3>
            <p className="mt-2 text-sm text-muted-foreground">citizen, staff, admin — protected via JWT and middleware.</p>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold">Uploads</h3>
            <p className="mt-2 text-sm text-muted-foreground">Photo uploads via Multer. Cloudinary if configured, otherwise static /uploads.</p>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold">Analytics</h3>
            <p className="mt-2 text-sm text-muted-foreground">Summary, trends by period, and heatmap-ready coordinates.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
