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
              className="w-full pl-10 pr-4 py-3 border border-[rgb(230,232,235)] rounded-lg bg-[rgb(255,255,255)] text-[rgb(31,41,55)] placeholder-[rgb(75,85,99)] focus:outline-none focus:border-[rgb(254,74,96)] focus:ring-1 focus:ring-[rgb(254,74,96)]"
            />
            <svg
              className="absolute left-3 top-3.5 h-5 w-5 text-[rgb(75,85,99)]"
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

        <div className="relative">
          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as "all" | "public" | "private")
            }
            className="appearance-none px-4 py-3 pr-10 border border-[rgb(230,232,235)] rounded-lg bg-[rgb(255,255,255)] text-[rgb(31,41,55)] focus:outline-none focus:border-[rgb(254,74,96)] focus:ring-1 focus:ring-[rgb(254,74,96)]"
          >
            <option value="all">All Repositories</option>
            <option value="public">Public Only</option>
            <option value="private">Private Only</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[rgb(75,85,99)]">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>{" "}
      {/* Repository List */}{" "}
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(254,74,96)]"></div>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1 mt-4">
          {filteredRepositories.length === 0 ? (
            <div className="text-center py-10 bg-[rgb(255,253,248)] rounded-lg border border-[rgb(230,232,235)]">
              <svg
                className="mx-auto h-10 w-10 text-[rgb(75,85,99)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-2 text-[rgb(55,65,81)] font-medium">
                {repositories.length === 0
                  ? "No repositories found"
                  : "No repositories match your search"}
              </p>
              <p className="mt-1 text-sm text-[rgb(75,85,99)]">
                {repositories.length === 0
                  ? "Connect your GitHub account to view repositories"
                  : "Try adjusting your search or filter"}
              </p>
            </div>
          ) : (
            filteredRepositories.map((repo) => (
              <div
                key={repo.id}
                onClick={() => onRepoSelect(repo)}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                  selectedRepo?.id === repo.id
                    ? "border-[rgb(254,74,96)] bg-[rgb(255,244,218)] shadow-sm"
                    : "border-[rgb(230,232,235)] bg-card-bg hover:border-[rgb(255,196,128)] hover:bg-card-hover"
                }`}
              >
                {" "}
                <div className="flex flex-col">
                  <div className="flex justify-between items-start space-x-4">
                    <h3 className="font-semibold text-[rgb(31,41,55)] truncate text-lg">
                      {repo.name}
                    </h3>
                    {repo.private && (
                      <span className="px-2 py-0.5 text-xs bg-[rgb(255,196,128)] text-[rgb(31,41,55)] rounded-full font-medium flex-shrink-0">
                        Private
                      </span>
                    )}
                  </div>

                  {repo.description && (
                    <p className="text-sm text-[rgb(55,65,81)] mt-2 line-clamp-2">
                      {repo.description}
                    </p>
                  )}

                  <div className="flex items-center mt-4 text-xs text-[rgb(75,85,99)] flex-wrap">
                    {repo.language && (
                      <div className="flex items-center mr-4 mb-1">
                        <span className="w-3 h-3 rounded-full bg-[rgb(254,74,96)] mr-1"></span>
                        <span>{repo.language}</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-1 mr-4 mb-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        width="16"
                        height="16"
                        className="mr-1 fill-current"
                      >
                        <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
                      </svg>
                      <span>{repo.stargazers_count}</span>
                    </div>

                    <div className="flex items-center mr-4 mb-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        width="16"
                        height="16"
                        className="mr-1 fill-current"
                      >
                        <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z" />
                      </svg>
                      <span>{repo.forks_count}</span>
                    </div>

                    <span className="mb-1">
                      Updated {formatDate(repo.updated_at).replace(",", "")}
                    </span>
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
