import { useEffect, useMemo, useState } from "react";

interface Department { _id: string; name: string; description?: string }

export default function Dashboard() {
  const base = useMemo(() => "", []); // same origin
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${base}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Login failed");
      setToken(data.token);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadDepartments = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${base}/api/departments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load departments");
      setDepartments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createDepartment = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!token) return;
    setError(null);
    try {
      const res = await fetch(`${base}/api/departments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Create failed");
      setName("");
      setDescription("");
      await loadDepartments();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteDepartment = async (id: string) => {
    if (!token) return;
    setError(null);
    try {
      const res = await fetch(`${base}/api/departments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Delete failed");
      await loadDepartments();
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => { if (token) loadDepartments(); }, [token]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <div className="container mx-auto px-6 py-10 space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
          <div className="text-sm text-muted-foreground">Manage Departments</div>
        </header>

        {!token ? (
          <section className="rounded-xl border bg-card p-6 shadow-sm max-w-lg">
            <h2 className="text-xl font-semibold">Admin Login</h2>
            <p className="text-sm text-muted-foreground mt-1">Use an admin account (ask us to promote one if needed).</p>
            <form onSubmit={login} className="mt-4 grid gap-3">
              <input className="rounded-md border px-3 py-2 bg-background" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
              <input className="rounded-md border px-3 py-2 bg-background" placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
              {error && <div className="text-sm text-destructive">{error}</div>}
              <button className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 font-semibold shadow hover:opacity-90" type="submit">Login</button>
            </form>
          </section>
        ) : (
          <>
            <section className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Create Department</h2>
              </div>
              <form onSubmit={createDepartment} className="mt-4 grid gap-3 max-w-xl">
                <input className="rounded-md border px-3 py-2 bg-background" placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} />
                <input className="rounded-md border px-3 py-2 bg-background" placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)} />
                {error && <div className="text-sm text-destructive">{error}</div>}
                <button className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 font-semibold shadow hover:opacity-90" type="submit">Create</button>
              </form>
            </section>

            <section className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Departments</h2>
                <button onClick={loadDepartments} className="text-sm rounded-md border px-3 py-1 hover:bg-secondary">Refresh</button>
              </div>
              <div className="mt-4 grid gap-3">
                {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
                {departments.length === 0 && !loading ? (
                  <div className="text-sm text-muted-foreground">No departments yet.</div>
                ) : (
                  departments.map((d)=> (
                    <div key={d._id} className="rounded-lg border p-4 flex items-center justify-between bg-background">
                      <div>
                        <div className="font-semibold">{d.name}</div>
                        {d.description && <div className="text-sm text-muted-foreground">{d.description}</div>}
                      </div>
                      <button className="text-sm text-destructive hover:underline" onClick={()=>deleteDepartment(d._id)}>Delete</button>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
