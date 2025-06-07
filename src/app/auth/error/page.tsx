"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage = "An unknown error occurred";

  // Map NextAuth error codes to friendly messages
  switch (error) {
    case "Configuration":
      errorMessage = "There is a problem with the server configuration.";
      break;
    case "AccessDenied":
      errorMessage = "You do not have permission to sign in.";
      break;
    case "Verification":
      errorMessage =
        "The verification link may have been expired or already used.";
      break;
    case "OAuthSignin":
    case "OAuthCallback":
    case "OAuthCreateAccount":
    case "EmailCreateAccount":
    case "Callback":
    case "OAuthAccountNotLinked":
    case "EmailSignin":
    case "CredentialsSignin":
      errorMessage = "There was a problem with your authentication.";
      break;
    case "SessionRequired":
      errorMessage = "Please sign in to access this page.";
      break;
    default:
      errorMessage = "An unexpected authentication error occurred.";
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="flex flex-col items-center space-y-4">
          <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3">
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Authentication Error
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-center">
            {errorMessage}
          </p>
          <Link
            href="/auth/signin"
            className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
