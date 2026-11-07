import Link from "next/link";

export default function Home() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">Mailbox Order Manager</h1>
      <p className="mt-3 text-slate-600">Manage pre-warmed Google and Microsoft mailbox orders.</p>
      <Link href="/login" className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-500">
        Get started
      </Link>
    </div>
  );
}
