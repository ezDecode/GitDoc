"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import GitHubConnector from "@/components/GitHubConnector";
import RepositorySearch from "@/components/RepositorySearch";
import DocumentationGenerator from "@/components/DocumentationGenerator";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  html_url: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [isGitHubConnected, setIsGitHubConnected] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);

  // Check authentication status
  useEffect(() => {
    if (status === "loading") return;
    if (!session) redirect("/auth/signin");
  }, [session, status]);

  // Update GitHub connection status based on session data
  useEffect(() => {
    if (status !== "loading" && session) {
      const isGithub = (session as any)?.provider === "github";
      const hasToken = !!(session as any)?.accessToken;
      console.log("Dashboard session check:", {
        isGithub,
        hasToken,
        provider: (session as any)?.provider,
      });

      // Check if this is a GitHub user
      if (isGithub || hasToken) {
        setIsGitHubConnected(true);
      }
    }
  }, [session, status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                GitDocify
              </h1>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                AI-Powered Documentation Generator
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img
                  src={session?.user?.image || ""}
                  alt={session?.user?.name || ""}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {session?.user?.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {" "}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Panel - GitHub Connection & Repository Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* GitHub Connection Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  GitHub Integration
                </h2>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isGitHubConnected
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}
                >
                  {isGitHubConnected ? "Connected" : "Not Connected"}
                </div>
              </div>

              <GitHubConnector
                isConnected={isGitHubConnected}
                onConnectionChange={setIsGitHubConnected}
              />
            </div>

            {/* Repository Search & Selection */}
            {isGitHubConnected && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                  Select Repository
                </h2>

                <RepositorySearch
                  repositories={repositories}
                  onRepositoriesChange={setRepositories}
                  selectedRepo={selectedRepo}
                  onRepoSelect={setSelectedRepo}
                />
              </div>
            )}
          </div>

          {/* Right Panel - Documentation Generation */}
          <div className="lg:col-span-3 space-y-6">
            {selectedRepo && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                  Generate Documentation
                </h2>

                <DocumentationGenerator repository={selectedRepo} />
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-sm p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Quick Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Repositories Found:</span>
                  <span className="font-medium">{repositories.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Selected:</span>
                  <span className="font-medium">
                    {selectedRepo ? selectedRepo.name : "None"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
