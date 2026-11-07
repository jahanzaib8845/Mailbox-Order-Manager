"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewOrderPage() {
  const router = useRouter();
  const [domain, setDomain] = useState("example.com");
  const [provider, setProvider] = useState("GOOGLE");
  const [mailboxCount, setMailboxCount] = useState(3);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain, provider, mailboxCount }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed");
      return;
    }
    const data = await res.json();
    router.push(`/orders/${data.order.id}`);
  }

  return (
    <main className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Order</h1>
      <form onSubmit={submit} className="space-y-4">
        <input className="border p-2 w-full" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="domain" />
        <select className="border p-2 w-full" value={provider} onChange={(e) => setProvider(e.target.value)}>
          <option value="GOOGLE">Google</option>
          <option value="MICROSOFT">Microsoft</option>
        </select>
        <input className="border p-2 w-full" type="number" min={1} max={50} value={mailboxCount} onChange={(e) => setMailboxCount(Number(e.target.value))} />
        {error && <p className="text-red-600">{error}</p>}
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Create</button>
      </form>
    </main>
  );
}
