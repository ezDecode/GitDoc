"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import Star from "@/components/Star";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (session) {
      // User is signed in, redirect to dashboard
      // Use a timeout to avoid redirect conflicts
      const timer = setTimeout(() => {
        router.replace("/dashboard");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [session, status, router]);

  // If loading or user is authenticated (about to redirect), show loading indicator
  if (status === "loading" || session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          {session && (
            <p className="text-text-secondary text-sm">
              Redirecting to dashboard...
            </p>
          )}
        </div>
      </div>
    );
  }

  // Show landing page with GitDocify design
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header /> {/* Main content */}
      <main className="flex-grow relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 py-16 flex flex-col items-center justify-center text-center">
          <div className="relative mb-8">
            <h1 className="text-5xl md:text-6xl font-semibold mb-6">
              <span className="text-text-primary">Prompt-friendly</span> <br />
              <span className="text-text-primary">documentation</span>
            </h1>
          </div>

          <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mb-12">
            Turn any Git repository into beautiful documentation with AI.
            Perfect for developers, teams, and open-source projects.
          </p>

          <div className="w-full max-w-xl mx-auto bg-white rounded-lg shadow-md p-8 relative">
            <div className="mb-6 flex items-center gap-2">
              <Image
                src="/github.svg"
                alt="GitHub"
                width={24}
                height={24}
                className="opacity-60"
              />
              <p className="text-text-secondary">
                Enter a GitHub repository URL
              </p>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="https://github.com/username/repository"
                className="w-full p-4 border border-border rounded-lg mb-4 pl-12"
              />
              <div className="absolute left-4 top-4">
                <Image src="/github.svg" alt="GitHub" width={20} height={20} />
              </div>
            </div>
            <button
              onClick={() => signIn("github")}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors"
            >
              Generate Documentation
            </button>
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="py-6 border-t border-border text-center text-text-muted text-sm">
        <div className="max-w-5xl mx-auto">
          <p>© {new Date().getFullYear()} GitDocify. Made with ❤️</p>
        </div>
      </footer>
    </div>
  );
}
