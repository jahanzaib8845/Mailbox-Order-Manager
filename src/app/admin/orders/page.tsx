"use client";
import { useEffect, useState } from "react";

interface OrderRow { id: string; domain: string; user?: { email: string }; provider: string; status: string; mailboxCount: number; createdAt: string; }
interface ListData { items: OrderRow[]; total: number; page: number; pageSize: number; }

const statusColor: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PROVISIONING: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-red-100 text-red-700",
};

export default function AdminOrdersPage() {
  const [data, setData] = useState<ListData>({ items: [], total: 0, page: 1, pageSize: 20 });
  const [status, setStatus] = useState("");
  const [provider, setProvider] = useState("");
  const [loading, setLoading] = useState(false);

  async function load(page = 1) {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (provider) params.set("provider", provider);
    params.set("page", String(page));
    params.set("pageSize", "20");
    const res = await fetch(`/api/admin/orders?${params}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(1); }, [status, provider]);

  async function retry(id: string) {
    const res = await fetch(`/api/orders/${id}/retry`, { method: "POST" });
    if (res.ok) load(data.page);
  }

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Admin Orders</h1>
        <p className="text-sm text-slate-500">Manage all customer orders</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="PROVISIONING">PROVISIONING</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="FAILED">FAILED</option>
        </select>
        <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" value={provider} onChange={(e) => setProvider(e.target.value)}>
          <option value="">All providers</option>
          <option value="GOOGLE">GOOGLE</option>
          <option value="MICROSOFT">MICROSOFT</option>
        </select>
        <span className="ml-auto self-center text-sm text-slate-500">{data.total} orders</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Domain</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Provider</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Count</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">Loading...</td></tr>
            ) : data.items.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">No orders found</td></tr>
            ) : (
              data.items.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <a href={`/orders/${o.id}`} className="font-medium text-indigo-600 hover:underline">{o.domain}</a>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{o.user?.email}</td>
                  <td className="px-4 py-3 text-slate-700">{o.provider}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColor[o.status]}`}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{o.mailboxCount}</td>
                  <td className="px-4 py-3">
                    {o.status === "FAILED" && (
                      <button className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500" onClick={() => retry(o.id)}>Retry</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button disabled={data.page <= 1} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40" onClick={() => load(data.page - 1)}>Previous</button>
        <span className="text-sm text-slate-600">Page {data.page} of {totalPages}</span>
        <button disabled={data.page >= totalPages} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40" onClick={() => load(data.page + 1)}>Next</button>
      </div>
    </div>
  );
}
