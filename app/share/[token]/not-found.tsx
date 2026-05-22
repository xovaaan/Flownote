import Link from "next/link";

export default function ShareNotFound() {
  return (
    <div className="min-h-screen bg-granola-50 flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-bold text-ink-900 mb-2">Summary not found</h1>
      <p className="text-ink-500 mb-8 max-w-md">
        This link may be invalid or the meeting has not been enhanced yet.
      </p>
      <Link
        href="/"
        className="text-sm font-semibold text-granola-800 hover:text-granola-900"
      >
        Back to Flownote
      </Link>
    </div>
  );
}
