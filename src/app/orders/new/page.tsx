"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewOrderPage() {
  const router = useRouter();
  const [domain, setDomain] = useState("example.com");
  const [provider, setProvider] = useState("GOOGLE");
  const [mailboxCount, setMailboxCount] = useState(3);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain, provider, mailboxCount }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create order");
      return;
    }
    const data = await res.json();
    router.push(`/orders/${data.order.id}`);
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Create Order</h1>
      <p className="mb-6 text-sm text-slate-500">Order pre-warmed mailboxes for your domain</p>
      <form onSubmit={submit} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Domain</label>
          <input className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Provider</label>
          <select className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" value={provider} onChange={(e) => setProvider(e.target.value)}>
            <option value="GOOGLE">Google Workspace</option>
            <option value="MICROSOFT">Microsoft 365</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Mailbox count (1-50)</label>
          <input className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" type="number" min={1} max={50} value={mailboxCount} onChange={(e) => setMailboxCount(Number(e.target.value))} />
        </div>
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-500 disabled:opacity-60" type="submit">
          {loading ? "Creating..." : "Create Order"}
        </button>
      </form>
    </div>
  );
}
