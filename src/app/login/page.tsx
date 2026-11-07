"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("customer@example.com");
  const [password, setPassword] = useState("customer123");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Login failed");
      return;
    }
    const data = await res.json();
    if (data.user.role === "ADMIN") router.push("/admin/orders");
    else router.push("/orders");
  }

  return (
    <main className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={submit} className="space-y-4">
        <input className="border p-2 w-full" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
        <input className="border p-2 w-full" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
        {error && <p className="text-red-600">{error}</p>}
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Login</button>
      </form>
      <p className="mt-4 text-sm text-gray-600">Admin: admin@example.com / admin123<br/>Customer: customer@example.com / customer123</p>
    </main>
  );
}
