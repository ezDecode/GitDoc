"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import {
  BookOpenIcon,
  CogIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  StarIcon,
  LockClosedIcon,
  GlobeAltIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

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

interface DocumentationOptions {
  includeReadme: boolean;
  includeApi: boolean;
  includeExamples: boolean;
  includeInstallation: boolean;
  includeContributing: boolean;
  format: "markdown" | "html" | "pdf";
  depth: "basic" | "detailed" | "comprehensive";
  maxFileSize: number;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "repositories" | "settings" | "history"
  >("repositories");

  const [options, setOptions] = useState<DocumentationOptions>({
    includeReadme: true,
    includeApi: true,
    includeExamples: true,
    includeInstallation: true,
    includeContributing: false,
    format: "markdown",
    depth: "detailed",
    maxFileSize: 50,
  });

  // Check authentication status
  useEffect(() => {
    if (status === "loading") return;
    if (!session) redirect("/auth/signin");
  }, [session, status]);

  // Fetch repositories
  useEffect(() => {
    if (session?.accessToken) {
      fetchRepositories();
    }
  }, [session]);

  const fetchRepositories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/github/repositories");
      if (response.ok) {
        const data = await response.json();
        setRepositories(data);
      }
    } catch (error) {
      console.error("Error fetching repositories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRepositories = repositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerateDocumentation = async () => {
    if (!selectedRepo) return;

    setIsGenerating(true);
    try {
      // Implementation for documentation generation
      console.log("Generating documentation for:", selectedRepo.name);
      console.log("Options:", options);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (error) {
      console.error("Error generating documentation:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      JavaScript: "bg-yellow-100 text-yellow-800",
      TypeScript: "bg-blue-100 text-blue-800",
      Python: "bg-green-100 text-green-800",
      Java: "bg-red-100 text-red-800",
      "C++": "bg-purple-100 text-purple-800",
      React: "bg-cyan-100 text-cyan-800",
      Vue: "bg-emerald-100 text-emerald-800",
      Angular: "bg-red-100 text-red-800",
    };
    return colors[language] || "bg-gray-100 text-gray-800";
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BookOpenIcon className="h-8 w-8 text-indigo-600" />
                <h1 className="text-xl font-semibold text-slate-900">
                  GitDocify
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img
                  src={session?.user?.image || ""}
                  alt={session?.user?.name || ""}
                  className="h-8 w-8 rounded-full"
                />
                <span className="text-sm font-medium text-slate-700">
                  {session?.user?.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: "repositories", label: "Repositories", icon: BookOpenIcon },
              { id: "settings", label: "Settings", icon: CogIcon },
              { id: "history", label: "History", icon: DocumentTextIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(
                    tab.id as "repositories" | "settings" | "history"
                  )
                }
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Repository Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Select Repository
                  </h2>
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search repositories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-slate-200 h-20 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredRepositories.map((repo) => (
                      <div
                        key={repo.id}
                        onClick={() => setSelectedRepo(repo)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedRepo?.id === repo.id
                            ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-sm font-medium text-slate-900 truncate">
                                {repo.name}
                              </h3>
                              {repo.private ? (
                                <LockClosedIcon className="h-4 w-4 text-slate-400" />
                              ) : (
                                <GlobeAltIcon className="h-4 w-4 text-slate-400" />
                              )}
                              {repo.language && (
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getLanguageColor(
                                    repo.language
                                  )}`}
                                >
                                  {repo.language}
                                </span>
                              )}
                            </div>

                            {repo.description && (
                              <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                                {repo.description}
                              </p>
                            )}

                            <div className="flex items-center space-x-4 text-xs text-slate-500">
                              <div className="flex items-center space-x-1">
                                <StarIcon className="h-3 w-3" />
                                <span>{repo.stargazers_count}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <CalendarDaysIcon className="h-3 w-3" />
                                <span>
                                  Updated {formatDate(repo.updated_at)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <ChevronRightIcon
                            className={`h-5 w-5 text-slate-400 transition-transform ${
                              selectedRepo?.id === repo.id ? "rotate-90" : ""
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Documentation Settings */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 sticky top-24">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <AdjustmentsHorizontalIcon className="h-5 w-5 text-slate-600" />
                  <h2 className="text-lg font-semibold text-slate-900">
                    Documentation Settings
                  </h2>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Documentation Sections */}
                <div>
                  <h3 className="text-sm font-medium text-slate-900 mb-3">
                    Include Sections
                  </h3>
                  <div className="space-y-3">
                    {[
                      { key: "includeReadme", label: "README", icon: "📘" },
                      { key: "includeApi", label: "API Reference", icon: "⚙️" },
                      { key: "includeExamples", label: "Examples", icon: "🧪" },
                      {
                        key: "includeInstallation",
                        label: "Installation",
                        icon: "📦",
                      },
                      {
                        key: "includeContributing",
                        label: "Contributing",
                        icon: "👥",
                      },
                    ].map((section) => (
                      <label
                        key={section.key}
                        className="flex items-center space-x-3"
                      >
                        <input
                          type="checkbox"
                          checked={
                            options[
                              section.key as keyof DocumentationOptions
                            ] as boolean
                          }
                          onChange={(e) =>
                            setOptions({
                              ...options,
                              [section.key]: e.target.checked,
                            })
                          }
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                        />
                        <span className="text-sm">{section.icon}</span>
                        <span className="text-sm text-slate-700">
                          {section.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Output Format */}
                <div>
                  <h3 className="text-sm font-medium text-slate-900 mb-3">
                    Output Format
                  </h3>
                  <div className="space-y-2">
                    {[
                      { value: "markdown", label: "Markdown (.md)" },
                      { value: "html", label: "HTML (.html)" },
                      { value: "pdf", label: "PDF (.pdf)" },
                    ].map((format) => (
                      <label
                        key={format.value}
                        className="flex items-center space-x-3"
                      >
                        <input
                          type="radio"
                          name="format"
                          value={format.value}
                          checked={options.format === format.value}
                          onChange={(e) =>
                            setOptions({
                              ...options,
                              format: e.target.value as
                                | "markdown"
                                | "html"
                                | "pdf",
                            })
                          }
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                        />
                        <span className="text-sm text-slate-700">
                          {format.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Detail Level */}
                <div>
                  <h3 className="text-sm font-medium text-slate-900 mb-3">
                    Detail Level
                  </h3>
                  <select
                    value={options.depth}
                    onChange={(e) =>
                      setOptions({
                        ...options,
                        depth: e.target.value as
                          | "basic"
                          | "detailed"
                          | "comprehensive",
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="basic">Basic</option>
                    <option value="detailed">Detailed</option>
                    <option value="comprehensive">Comprehensive</option>
                  </select>
                </div>

                {/* File Size Limit */}
                <div>
                  <h3 className="text-sm font-medium text-slate-900 mb-3">
                    Max File Size: {options.maxFileSize}MB
                  </h3>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={options.maxFileSize}
                    onChange={(e) =>
                      setOptions({
                        ...options,
                        maxFileSize: parseInt(e.target.value),
                      })
                    }
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>10MB</span>
                    <span>100MB</span>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerateDocumentation}
                  disabled={!selectedRepo || isGenerating}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    !selectedRepo
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : isGenerating
                      ? "bg-indigo-400 text-white cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      <span>Generate Documentation</span>
                    </>
                  )}
                </button>

                {selectedRepo && (
                  <div className="text-xs text-slate-500 text-center">
                    Ready to generate docs for{" "}
                    <strong>{selectedRepo.name}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
