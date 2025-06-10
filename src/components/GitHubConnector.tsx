"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface GitHubConnectorProps {
  isConnected: boolean;
  onConnectionChange: (connected: boolean) => void;
}

export default function GitHubConnector({
  isConnected,
  onConnectionChange,
}: GitHubConnectorProps) {
  const { data: session } = useSession();
  const [isConnecting, setIsConnecting] = useState(false);
  const router = useRouter();
  // Check if user is connected with GitHub based on session
  useEffect(() => {
    // Check for GitHub connection in session data
    const isGithubSession = (session as any)?.provider === "github";
    const hasAccessToken = !!(session as any)?.accessToken;
    const hasGithubAccount =
      session?.user && (isGithubSession || hasAccessToken);

    console.log("Session check:", {
      isGithubSession,
      hasAccessToken,
      provider: (session as any)?.provider,
    });

    if (hasGithubAccount) {
      onConnectionChange(true);
    } else {
      onConnectionChange(false);
    }
  }, [session, onConnectionChange]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Force clear any local storage session data to ensure a fresh auth flow
      if (typeof window !== "undefined") {
        localStorage.removeItem("next-auth.session-token");
        localStorage.removeItem("next-auth.callback-url");
        localStorage.removeItem("next-auth.csrf-token");
      }

      // Redirect to GitHub OAuth with explicit parameters
      await signIn("github", {
        callbackUrl: `/dashboard?t=${Date.now()}`,
        redirect: true,
      });
    } catch (error) {
      console.error("Failed to connect to GitHub:", error);
      setIsConnecting(false);
    }
  };
  const handleDisconnect = async () => {
    // Actually sign out the user
    await signOut({ callbackUrl: "/" });
  };
  // Check if the user is authenticated with GitHub
  const isGitHubConnected =
    (session as any)?.provider === "github" ||
    ((session as any)?.accessToken && session?.user);

  if (isGitHubConnected) {
    return (
      <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white dark:text-gray-900"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-slate-900 dark:text-white">
              GitHub Connected
            </h3>{" "}
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Connected as {session?.user?.name || session?.user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={handleDisconnect}
          className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="text-center p-6">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-8 h-8 text-gray-600 dark:text-gray-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      </div>

      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
        Connect your GitHub account
      </h3>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Access your repositories and generate comprehensive documentation using
        AI
      </p>

      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isConnecting ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white dark:text-gray-900"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Connecting...
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Connect GitHub
          </>
        )}
      </button>
    </div>
  );
}
