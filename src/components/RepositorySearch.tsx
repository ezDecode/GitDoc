"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

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

interface RepositorySearchProps {
  repositories: Repository[];
  onRepositoriesChange: (repos: Repository[]) => void;
  selectedRepo: Repository | null;
  onRepoSelect: (repo: Repository) => void;
}

export default function RepositorySearch({
  repositories,
  onRepositoriesChange,
  selectedRepo,
  onRepoSelect,
}: RepositorySearchProps) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "public" | "private">("all");

  // Mock repositories data - in real app, this would come from GitHub API
  const mockRepositories: Repository[] = [
    {
      id: 1,
      name: "react-dashboard",
      full_name: "user/react-dashboard",
      description: "A modern React dashboard with TypeScript and Tailwind CSS",
      private: false,
      html_url: "https://github.com/user/react-dashboard",
      language: "TypeScript",
      stargazers_count: 145,
      forks_count: 23,
      updated_at: "2024-12-01T10:30:00Z",
    },
    {
      id: 2,
      name: "node-api",
      full_name: "user/node-api",
      description: "RESTful API built with Node.js and Express",
      private: true,
      html_url: "https://github.com/user/node-api",
      language: "JavaScript",
      stargazers_count: 67,
      forks_count: 12,
      updated_at: "2024-11-28T15:45:00Z",
    },
    {
      id: 3,
      name: "python-ml-toolkit",
      full_name: "user/python-ml-toolkit",
      description: "Machine learning utilities and models in Python",
      private: false,
      html_url: "https://github.com/user/python-ml-toolkit",
      language: "Python",
      stargazers_count: 289,
      forks_count: 45,
      updated_at: "2024-12-05T09:15:00Z",
    },
    {
      id: 4,
      name: "vue-components",
      full_name: "user/vue-components",
      description: "Reusable Vue.js components library",
      private: false,
      html_url: "https://github.com/user/vue-components",
      language: "Vue",
      stargazers_count: 92,
      forks_count: 18,
      updated_at: "2024-11-30T14:20:00Z",
    },
  ];
  useEffect(() => {
    // Load repositories on component mount
    loadRepositories();
  }, []);

  const loadRepositories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/github/repositories");
      if (response.ok) {
        const data = await response.json();
        onRepositoriesChange(data.repositories);
      } else {
        console.error("Failed to fetch repositories:", response.statusText);
        // Fallback to mock data
        onRepositoriesChange(mockRepositories);
      }
    } catch (error) {
      console.error("Failed to load repositories:", error);
      // Fallback to mock data
      onRepositoriesChange(mockRepositories);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRepositories = repositories.filter((repo) => {
    const matchesSearch =
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "public" && !repo.private) ||
      (filter === "private" && repo.private);

    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getLanguageColor = (language: string) => {
    const colors: { [key: string]: string } = {
      TypeScript: "bg-blue-500",
      JavaScript: "bg-yellow-500",
      Python: "bg-green-500",
      Vue: "bg-emerald-500",
      React: "bg-cyan-500",
      Java: "bg-orange-500",
      "C++": "bg-pink-500",
      Go: "bg-teal-500",
    };
    return colors[language] || "bg-gray-500";
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <select
          value={filter}
          onChange={(e) =>
            setFilter(e.target.value as "all" | "public" | "private")
          }
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Repositories</option>
          <option value="public">Public Only</option>
          <option value="private">Private Only</option>
        </select>
      </div>

      {/* Repository List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredRepositories.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              {repositories.length === 0
                ? "No repositories found"
                : "No repositories match your search"}
            </div>
          ) : (
            filteredRepositories.map((repo) => (
              <div
                key={repo.id}
                onClick={() => onRepoSelect(repo)}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedRepo?.id === repo.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                    : "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                        {repo.name}
                      </h3>
                      {repo.private && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">
                          Private
                        </span>
                      )}
                    </div>

                    {repo.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                        {repo.description}
                      </p>
                    )}

                    <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                      {repo.language && (
                        <div className="flex items-center space-x-1">
                          <div
                            className={`w-3 h-3 rounded-full ${getLanguageColor(
                              repo.language
                            )}`}
                          ></div>
                          <span>{repo.language}</span>
                        </div>
                      )}

                      <div className="flex items-center space-x-1">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>{repo.stargazers_count}</span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414L2.586 7.707a1 1 0 010-1.414L6.293 2.586a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{repo.forks_count}</span>
                      </div>

                      <span>Updated {formatDate(repo.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
