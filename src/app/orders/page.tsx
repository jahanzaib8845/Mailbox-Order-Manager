"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface OrderRow { id: string; domain: string; provider: string; status: string; mailboxCount: number; }

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  useEffect(() => {
    fetch("/api/orders").then((r) => r.json()).then((d) => setOrders(d.orders || []));
  }, []);
  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <Link href="/orders/new" className="bg-blue-600 text-white px-4 py-2 rounded">New Order</Link>
      </div>
      <ul className="space-y-2">
        {orders.map((o) => (
          <li key={o.id} className="border p-4 rounded">
            <Link href={`/orders/${o.id}`} className="text-blue-600 underline">{o.domain}</Link>
            <span className="ml-4">{o.provider}</span>
            <span className="ml-4">{o.status}</span>
            <span className="ml-4">{o.mailboxCount} mailboxes</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
