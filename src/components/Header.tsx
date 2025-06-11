"use client";

import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import Image from "next/image";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="w-full py-4 px-6 border-b border-border">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <h1 className="text-2xl font-semibold">
            <span className="text-black">Git</span>
            <span className="text-primary">Docify</span>
          </h1>
        </Link>

        <div className="flex items-center gap-4">
          {session ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded hover:bg-card-hover"
            >
              Dashboard
            </Link>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="flex items-center gap-2 px-4 py-2 bg-card-bg rounded-md border border-border hover:bg-card-hover transition-colors"
            >
              <Image src="/github.svg" alt="GitHub" width={20} height={20} />
              <span>Sign In</span>
            </button>
          )}

          {session && (
            <Image
              src={session.user?.image || "https://github.com/github.png"}
              alt={session.user?.name || "User"}
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
        </div>
      </div>
    </header>
  );
}
