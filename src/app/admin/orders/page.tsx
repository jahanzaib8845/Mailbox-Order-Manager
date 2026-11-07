"use client";
import { useEffect, useState } from "react";

interface OrderRow { id: string; domain: string; user?: { email: string }; provider: string; status: string; mailboxCount: number; }
interface ListData { items: OrderRow[]; total: number; page: number; pageSize: number; }

export default function AdminOrdersPage() {
  const [data, setData] = useState<ListData>({ items: [], total: 0, page: 1, pageSize: 20 });
  const [status, setStatus] = useState("");
  const [provider, setProvider] = useState("");

  async function load(page = 1) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (provider) params.set("provider", provider);
    params.set("page", String(page));
    params.set("pageSize", "20");
    const res = await fetch(`/api/admin/orders?${params}`);
    if (res.ok) setData(await res.json());
  }

  useEffect(() => { load(1); }, [status, provider]);

  async function retry(id: string) {
    const res = await fetch(`/api/orders/${id}/retry`, { method: "POST" });
    if (res.ok) load(data.page);
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Orders</h1>
      <div className="flex gap-2 mb-4">
        <select className="border p-2" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="PROVISIONING">PROVISIONING</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="FAILED">FAILED</option>
        </select>
        <select className="border p-2" value={provider} onChange={(e) => setProvider(e.target.value)}>
          <option value="">All providers</option>
          <option value="GOOGLE">GOOGLE</option>
          <option value="MICROSOFT">MICROSOFT</option>
        </select>
      </div>
      <table className="w-full border">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">Domain</th>
            <th className="p-2 text-left">User</th>
            <th className="p-2 text-left">Provider</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Count</th>
            <th className="p-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.items?.map((o: OrderRow) => (
            <tr key={o.id} className="border-b">
              <td className="p-2"><a href={`/orders/${o.id}`} className="text-blue-600 underline">{o.domain}</a></td>
              <td className="p-2">{o.user?.email}</td>
              <td className="p-2">{o.provider}</td>
              <td className="p-2">{o.status}</td>
              <td className="p-2">{o.mailboxCount}</td>
              <td className="p-2">
                {o.status === "FAILED" && (
                  <button className="bg-red-600 text-white px-2 py-1 rounded" onClick={() => retry(o.id)}>Retry</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex gap-2">
        <button disabled={data.page <= 1} className="px-3 py-1 border rounded" onClick={() => load(data.page - 1)}>Prev</button>
        <span>Page {data.page} / {Math.ceil(data.total / data.pageSize) || 1}</span>
        <button disabled={data.page * data.pageSize >= data.total} className="px-3 py-1 border rounded" onClick={() => load(data.page + 1)}>Next</button>
      </div>
    </main>
  );
}
