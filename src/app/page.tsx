"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (session) {
      // User is signed in, redirect to dashboard
      router.push("/dashboard");
    } else {
      // User is not signed in, redirect to sign in page
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="text-center">
        <div className="flex items-center justify-center mb-8">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="GitDocify logo"
            width={180}
            height={38}
            priority
          />
        </div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          Loading GitDocify...
        </p>
      </div>
    </div>
  );
}
