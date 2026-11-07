"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface MailboxRow { id: string; index: number; email: string | null; status: string; error: string | null; }
interface HistoryRow { id: string; createdAt: string; fromStatus: string | null; toStatus: string; reason: string | null; }
interface OrderDetail { id: string; domain: string; provider: string; status: string; mailboxCount: number; mailboxes: MailboxRow[]; history: HistoryRow[]; }

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

  if (!order) return <main className="p-8">Loading...</main>;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-2">{order.domain}</h1>
      <p>Status: {order.status} | Provider: {order.provider} | Count: {order.mailboxCount}</p>
      <h2 className="text-xl font-semibold mt-4 mb-2">Mailboxes</h2>
      <ul className="space-y-1">
        {order.mailboxes?.map((m: MailboxRow) => (
          <li key={m.id} className="border p-2 rounded">{m.email || `mailbox${m.index + 1}`} — {m.status} {m.error ? `(${m.error})` : ""}</li>
        ))}
      </ul>
      <h2 className="text-xl font-semibold mt-4 mb-2">Audit Log</h2>
      <ul className="space-y-1 text-sm">
        {order.history?.map((h: HistoryRow) => (
          <li key={h.id} className="border p-2 rounded">{new Date(h.createdAt).toLocaleString()}: {h.fromStatus ?? "—"} → {h.toStatus} {h.reason ? `(${h.reason})` : ""}</li>
        ))}
      </ul>
    </main>
  );
}
