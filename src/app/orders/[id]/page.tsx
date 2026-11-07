"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface MailboxRow { id: string; index: number; email: string | null; status: string; error: string | null; }
interface HistoryRow { id: string; createdAt: string; fromStatus: string | null; toStatus: string; reason: string | null; actorRole: string | null; }
interface OrderDetail { id: string; domain: string; provider: string; status: string; mailboxCount: number; mailboxes: MailboxRow[]; history: HistoryRow[]; }

const statusColor: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PROVISIONING: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-red-100 text-red-700",
};

const mailboxColor: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  PROVISIONING: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-red-100 text-red-700",
};

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [order, setOrder] = useState<OrderDetail | null>(null);

  async function load() {
    const res = await fetch(`/api/orders/${id}`);
    if (res.ok) setOrder(await res.json().then((d: { order: OrderDetail }) => d.order));
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
  }, [id]);

  if (!order) return <div className="py-10 text-center text-slate-500">Loading order...</div>;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{order.domain}</h1>
            <p className="text-sm text-slate-500">{order.provider} · {order.mailboxCount} mailboxes</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusColor[order.status]}`}>{order.status}</span>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Mailboxes</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {order.mailboxes?.map((m) => (
            <li key={m.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
              <span className="text-sm text-slate-700">{m.email || `mailbox${m.index + 1}@${order.domain}`}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${mailboxColor[m.status]}`}>{m.status}</span>
            </li>
          ))}
        </ul>
        {order.mailboxes?.some((m) => m.error) && (
          <div className="mt-3 text-sm text-red-600">
            {order.mailboxes.filter((m) => m.error).map((m) => (
              <p key={m.id}>mailbox{m.index + 1}: {m.error}</p>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Audit Log</h2>
        <ol className="relative border-l border-slate-200 pl-6">
          {order.history?.map((h) => (
            <li key={h.id} className="mb-4">
              <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-indigo-500" />
              <p className="text-sm font-medium text-slate-800">{h.fromStatus ?? "—"} → {h.toStatus}</p>
              <p className="text-xs text-slate-500">{new Date(h.createdAt).toLocaleString()} {h.actorRole ? `· ${h.actorRole}` : ""} {h.reason ? `· ${h.reason}` : ""}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
