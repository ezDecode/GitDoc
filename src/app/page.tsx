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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          {session && (
            <p className="text-gray-600 text-sm">Redirecting to dashboard...</p>
          )}
        </div>
      </div>
    );
  }

  // Show landing page
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 py-4 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="text-xl font-bold">
              <span className="text-black">Git</span>
              <span className="text-red-500">Docify</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/yourusername/GitDocument"
              target="_blank"
              className="text-gray-600 hover:text-gray-900 flex items-center space-x-1.5"
            >
              <svg
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span className="font-medium hidden md:inline">GitHub</span>
            </a>
            <button
              onClick={() => router.push("/auth/signin")}
              className="px-4 py-2 text-sm font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 mt-8 mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute -left-12 -top-6">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path
                    d="M24 4L29.6 16.8L43.2 19.2L33.6 28.8L36 43.2L24 36L12 43.2L14.4 28.8L4.8 19.2L18.4 16.8L24 4Z"
                    fill="#FF4B55"
                  />
                </svg>
              </div>
              <div className="absolute -right-10 top-4">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path
                    d="M20 0L24.7 13.8L39 16.4L29.5 27.5L31.4 41.6L20 35L8.6 41.6L10.5 27.5L1 16.4L15.3 13.8L20 0Z"
                    fill="#4ADE80"
                  />
                </svg>
              </div>
              <h1 className="text-5xl font-bold mb-4">
                <span className="block">Prompt-friendly</span>
                <span className="block">documentation</span>
              </h1>
            </div>
          </div>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Turn any Git repository into beautiful documentation with AI.
            Perfect for developers, teams, and open-source projects.
          </p>

          <div className="bg-amber-50 border-2 border-gray-100 rounded-xl p-8 shadow-lg max-w-3xl mx-auto">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-3 bg-gray-50 rounded-md p-3 border border-gray-200">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                  </svg>
                  <input
                    type="text"
                    placeholder="Enter a GitHub repository URL"
                    className="w-full bg-transparent border-none focus:outline-none text-gray-700"
                  />
                </div>
                <button
                  onClick={() => router.push("/auth/signin")}
                  className="w-full py-3 px-4 text-base font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Generate Documentation
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-gray-200 text-center text-gray-500 text-sm">
        <div className="max-w-5xl mx-auto">
          <p>© {new Date().getFullYear()} GitDocify. Made with ❤️</p>
        </div>
      </footer>
    </div>
  );
}
