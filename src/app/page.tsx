import Link from "next/link";
export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Mailbox Order Manager</h1>
      <div className="space-x-4">
        <Link href="/login" className="text-blue-600 underline">Login</Link>
      </div>
    </main>
  );
}
