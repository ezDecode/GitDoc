"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Star from "@/components/Star";

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const error = searchParams.get("error");

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn("google", { callbackUrl });
  };

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    await signIn("github", { callbackUrl });
  };
  return (
    <div className="min-h-screen flex flex-col">
      <Header />{" "}
      <main className="flex-grow relative overflow-hidden flex items-center justify-center">
        <div className="w-full max-w-md p-8 space-y-8 bg-card-bg rounded-lg shadow-sm border border-border">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary">
              Sign In to GitDocify
            </h1>
            <p className="mt-2 text-text-secondary">
              Generate AI-powered documentation for your repositories
            </p>
          </div>
          {error && (
            <div className="bg-red-100 text-red-800 p-4 rounded-md text-sm">
              {error === "OAuthSignin" && "Error in the OAuth sign-in process."}
              {error === "OAuthCallback" && "Error in the OAuth callback."}
              {error === "OAuthCreateAccount" &&
                "Error creating OAuth account."}
              {error === "OAuthAccountNotLinked" &&
                "This email is already associated with another account."}
              {error === "SessionRequired" &&
                "You must be signed in to access this page."}
              {error === "Configuration" &&
                "There is a server configuration error."}
              {error === "AccessDenied" &&
                "You do not have access to this resource."}
              {![
                "OAuthSignin",
                "OAuthCallback",
                "OAuthCreateAccount",
                "OAuthAccountNotLinked",
                "SessionRequired",
                "Configuration",
                "AccessDenied",
              ].includes(error as string) &&
                "An error occurred during authentication."}
            </div>
          )}{" "}
          <div className="mt-8 space-y-4">
            {" "}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 bg-[rgb(255,255,255)] border border-[rgb(230,232,235)] rounded-lg px-6 py-3 text-[rgb(31,41,55)] hover:bg-[rgb(232,240,254)] transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                width="24"
                height="24"
              >
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                />
              </svg>
              {isLoading ? "Signing in..." : "Sign in with Google"}
            </button>
            <button
              onClick={handleGitHubSignIn}
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 bg-primary hover:bg-primary-hover border border-transparent rounded-lg px-6 py-3 text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              {isLoading ? "Signing in..." : "Sign in with GitHub"}
            </button>
          </div>{" "}
        </div>
      </main>
    </div>
  );
}
