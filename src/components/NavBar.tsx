"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export function NavBar() {
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold text-indigo-600">Mailbox Order Manager</Link>
        <nav className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              {user.role === "ADMIN" ? (
                <Link href="/admin/orders" className="text-slate-700 hover:text-indigo-600">Admin Orders</Link>
              ) : (
                <>
                  <Link href="/orders" className="text-slate-700 hover:text-indigo-600">My Orders</Link>
                  <Link href="/orders/new" className="text-slate-700 hover:text-indigo-600">New Order</Link>
                </>
              )}
              <span className="text-slate-500">{user.email}</span>
              <button onClick={logout} className="rounded-md bg-slate-900 px-3 py-1.5 text-white hover:bg-slate-700">Logout</button>
            </>
          ) : (
            <Link href="/login" className="rounded-md bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-500">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
