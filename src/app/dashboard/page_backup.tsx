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
  }, [session, status]); // Fetch repositories
  useEffect(() => {
    if (session) {
      fetchRepositories();
    }
  }, [session]);
  const fetchRepositories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/github/repositories");

      if (response.ok) {
        const data = await response.json();
        // The API returns { repositories: [...] }, so we need to extract the repositories array
        const repositories = data.repositories || [];
        setRepositories(Array.isArray(repositories) ? repositories : []);
      } else {
        console.error("Failed to fetch repositories:", response.status);
        setRepositories([]);
      }
    } catch (error) {
      console.error("Error fetching repositories:", error);
      setRepositories([]);
    } finally {
      setIsLoading(false);
    }
  };
  const filteredRepositories = Array.isArray(repositories)
    ? repositories.filter(
        (repo) =>
          repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          repo.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "rgb(255, 253, 248)" }}
      >
        <div className="flex flex-col items-center space-y-4">
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2"
            style={{ borderColor: "rgb(254, 74, 96)" }}
          ></div>
          <p style={{ color: "rgb(17, 24, 39)" }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "rgb(255, 253, 248)" }}
    >
      {/* Header */}
      <header
        className="bg-white border-b sticky top-0 z-40 shadow-sm"
        style={{ borderColor: "rgb(230, 232, 235)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "rgb(254, 74, 96)" }}
                >
                  <BookOpenIcon className="h-5 w-5 text-white" />
                </div>
                <h1
                  className="text-xl font-bold"
                  style={{ color: "rgb(17, 24, 39)" }}
                >
                  GitDocify
                </h1>
                <span
                  className="px-2 py-1 text-xs font-medium rounded-full text-white"
                  style={{ backgroundColor: "rgb(255, 196, 128)" }}
                >
                  AI-Powered
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                className="p-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: "rgb(232, 240, 254)",
                  color: "rgb(17, 24, 39)",
                }}
              >
                <CogIcon className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                {" "}
                <img
                  src={session?.user?.image || ""}
                  alt={session?.user?.name || ""}
                  className="h-8 w-8 rounded-full ring-2 ring-gray-200"
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: "rgb(17, 24, 39)" }}
                >
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
          <nav
            className="flex space-x-2 p-1 rounded-xl"
            style={{ backgroundColor: "rgb(230, 232, 235)" }}
          >
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
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab.id
                    ? "bg-white shadow-sm"
                    : "hover:bg-white/50"
                }`}
                style={{
                  color:
                    activeTab === tab.id
                      ? "rgb(254, 74, 96)"
                      : "rgb(17, 24, 39)",
                }}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column - Repository Selection (Compact) */}
          <div className="lg:col-span-2">
            <div
              className="bg-white rounded-2xl shadow-sm border"
              style={{ borderColor: "rgb(230, 232, 235)" }}
            >
              <div
                className="p-6 border-b"
                style={{ borderColor: "rgb(230, 232, 235)" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className="text-lg font-bold"
                    style={{ color: "rgb(17, 24, 39)" }}
                  >
                    Select Repository
                  </h2>
                  <div className="flex items-center space-x-2">
                    <select
                      className="text-xs px-3 py-1 border rounded-lg focus:ring-2 focus:outline-none focus:ring-red-300"
                      style={{
                        borderColor: "rgb(230, 232, 235)",
                        backgroundColor: "rgb(255, 253, 248)",
                        color: "rgb(17, 24, 39)",
                      }}
                    >
                      <option value="all">All</option>
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                </div>
                <div className="relative">
                  <MagnifyingGlassIcon
                    className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2"
                    style={{ color: "rgb(17, 24, 39)", opacity: 0.6 }}
                  />
                  <input
                    type="text"
                    placeholder="Search repositories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:outline-none focus:ring-red-300"
                    style={{
                      borderColor: "rgb(230, 232, 235)",
                      backgroundColor: "rgb(255, 253, 248)",
                    }}
                  />
                </div>
              </div>

              <div className="p-6">
                {isLoading ? (
                  <div className="flex flex-wrap gap-2">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse h-8 w-24 rounded-full"
                        style={{ backgroundColor: "rgb(230, 232, 235)" }}
                      ></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Repository Capsules */}
                    <div className="flex flex-wrap gap-2">
                      {filteredRepositories.length > 0 ? (
                        <>
                          {filteredRepositories.map((repo) => (
                            <div key={repo.id} className="relative group">
                              <button
                                onClick={() => setSelectedRepo(repo)}
                                className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                                  selectedRepo?.id === repo.id
                                    ? "shadow-md ring-2"
                                    : "hover:shadow-sm"
                                }`}
                                style={{
                                  borderColor:
                                    selectedRepo?.id === repo.id
                                      ? "rgb(254, 74, 96)"
                                      : "rgb(230, 232, 235)",
                                  backgroundColor:
                                    selectedRepo?.id === repo.id
                                      ? "rgb(232, 240, 254)"
                                      : "white",
                                  color: "rgb(17, 24, 39)",
                                  ...(selectedRepo?.id === repo.id && {
                                    ringColor: "rgb(254, 74, 96)",
                                    ringWidth: "2px",
                                  }),
                                }}
                              >
                                <span className="font-semibold truncate max-w-20">
                                  {repo.name}
                                </span>
                                <span className="text-xs">
                                  {repo.private ? "🔒" : "🌐"}
                                </span>
                                {repo.language && (
                                  <span
                                    className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
                                    style={{
                                      backgroundColor: "rgb(255, 196, 128)",
                                    }}
                                  >
                                    {repo.language.slice(0, 2)}
                                  </span>
                                )}
                              </button>

                              {/* Floating Card on Hover */}
                              <div className="absolute z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-72">
                                <div
                                  className="bg-white rounded-xl shadow-lg border p-4"
                                  style={{ borderColor: "rgb(230, 232, 235)" }}
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1 min-w-0">
                                      <h3
                                        className="font-bold text-sm truncate"
                                        style={{ color: "rgb(17, 24, 39)" }}
                                      >
                                        {repo.name}
                                      </h3>
                                      <p
                                        className="text-xs mt-1 opacity-75"
                                        style={{ color: "rgb(17, 24, 39)" }}
                                      >
                                        {repo.full_name}
                                      </p>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      {repo.private ? (
                                        <LockClosedIcon
                                          className="h-4 w-4"
                                          style={{
                                            color: "rgb(17, 24, 39)",
                                            opacity: 0.6,
                                          }}
                                        />
                                      ) : (
                                        <GlobeAltIcon
                                          className="h-4 w-4"
                                          style={{
                                            color: "rgb(17, 24, 39)",
                                            opacity: 0.6,
                                          }}
                                        />
                                      )}
                                    </div>
                                  </div>

                                  {repo.description && (
                                    <p
                                      className="text-xs mb-3 line-clamp-2"
                                      style={{
                                        color: "rgb(17, 24, 39)",
                                        opacity: 0.7,
                                      }}
                                    >
                                      {repo.description}
                                    </p>
                                  )}

                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 text-xs">
                                      <div
                                        className="flex items-center space-x-1"
                                        style={{
                                          color: "rgb(17, 24, 39)",
                                          opacity: 0.6,
                                        }}
                                      >
                                        <StarIcon className="h-3 w-3" />
                                        <span>{repo.stargazers_count}</span>
                                      </div>
                                      <div
                                        className="flex items-center space-x-1"
                                        style={{
                                          color: "rgb(17, 24, 39)",
                                          opacity: 0.6,
                                        }}
                                      >
                                        <CalendarDaysIcon className="h-3 w-3" />
                                        <span>{formatDate(repo.updated_at)}</span>
                                      </div>
                                    </div>
                                    {repo.language && (
                                      <span
                                        className="px-2 py-1 rounded-full text-xs font-semibold text-white"
                                        style={{
                                          backgroundColor: "rgb(255, 196, 128)",
                                        }}
                                      >
                                        {repo.language}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {/* Arrow pointer */}
                                <div
                                  className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0"
                                  style={{
                                    borderLeft: "6px solid transparent",
                                    borderRight: "6px solid transparent",
                                    borderTop: "6px solid white",
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                          
                          {/* Add Repository Capsule */}
                          <button
                            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border border-dashed hover:shadow-sm"
                            style={{
                              borderColor: "rgb(230, 232, 235)",
                              backgroundColor: "transparent",
                              color: "rgb(17, 24, 39)",
                            }}
                          >
                            <span className="text-lg">+</span>
                            <span>Add Repo</span>
                          </button>
                        </>
                      ) : (
                        <div className="text-center py-8 w-full">
                          <div
                            className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: "rgb(232, 240, 254)" }}
                          >
                            <BookOpenIcon
                              className="h-6 w-6"
                              style={{ color: "rgb(254, 74, 96)" }}
                            />
                          </div>
                          <p
                            className="font-medium text-sm"
                            style={{ color: "rgb(17, 24, 39)" }}
                          >
                            No repositories found
                          </p>
                          <p
                            className="text-xs mt-1"
                            style={{ color: "rgb(17, 24, 39)", opacity: 0.6 }}
                          >
                            Try adjusting your search
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Selected Repository Summary */}
                    {selectedRepo && (
                      <div
                        className="p-4 rounded-xl border"
                        style={{
                          backgroundColor: "rgb(232, 240, 254)",
                          borderColor: "rgb(254, 74, 96)",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p
                              className="text-sm font-semibold"
                              style={{ color: "rgb(17, 24, 39)" }}
                            >
                              Selected: {selectedRepo.name}
                            </p>
                            <p
                              className="text-xs mt-1"
                              style={{ color: "rgb(17, 24, 39)", opacity: 0.7 }}
                            >
                              {selectedRepo.language} • {selectedRepo.stargazers_count} stars
                            </p>
                          </div>
                          <button
                            onClick={() => setSelectedRepo(null)}
                            className="p-1 rounded-full hover:bg-white/50 transition-colors"
                          >
                            <span
                              className="text-sm"
                              style={{ color: "rgb(17, 24, 39)" }}
                            >
                              ✕
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Documentation Settings (Expanded) */}
          <div className="lg:col-span-3">
            <div
              className="bg-white rounded-2xl shadow-sm border sticky top-24"
              style={{ borderColor: "rgb(230, 232, 235)" }}
            >
              <div
                className="p-6 border-b"
                style={{ borderColor: "rgb(230, 232, 235)" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: "rgb(232, 240, 254)" }}
                    >
                      <AdjustmentsHorizontalIcon
                        className="h-5 w-5"
                        style={{ color: "rgb(254, 74, 96)" }}
                      />
                    </div>
                    <div>
                      <h2
                        className="text-xl font-bold"
                        style={{ color: "rgb(17, 24, 39)" }}
                      >
                        Documentation Settings
                      </h2>
                      <p
                        className="text-sm mt-1"
                        style={{ color: "rgb(17, 24, 39)", opacity: 0.6 }}
                      >
                        Configure how your documentation will be generated
                      </p>
                    </div>
                  </div>
                  {selectedRepo && (
                    <div
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: "rgb(232, 240, 254)",
                        color: "rgb(254, 74, 96)",
                      }}
                    >
                      Ready to generate
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Documentation Sections */}
                  <div>
                    <h3
                      className="text-base font-bold mb-6"
                      style={{ color: "rgb(17, 24, 39)" }}
                    >
                      📚 Include Sections
                    </h3>
                    <div className="space-y-4">
                      {{
                        key: "includeReadme",
                        label: "README",
                        icon: "📘",
                        desc: "Project overview and setup",
                      },
                      {
                        key: "includeApi",
                        label: "API Reference",
                        icon: "⚙️",
                        desc: "Function and class documentation",
                      },
                      {
                        key: "includeExamples",
                        label: "Code Examples",
                        icon: "🧪",
                        desc: "Usage examples and snippets",
                      },
                      {
                        key: "includeInstallation",
                        label: "Installation Guide",
                        icon: "📦",
                        desc: "Setup and deployment steps",
                      },
                      {
                        key: "includeContributing",
                        label: "Contributing Guidelines",
                        icon: "👥",
                        desc: "How to contribute to the project",
                      },
                    ].map((section) => (
                      <label
                        key={section.key}
                        className={`flex items-start space-x-4 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                          options[section.key as keyof DocumentationOptions] as boolean
                            ? 'ring-2 ring-red-200'
                            : 'hover:bg-gray-50'
                        }`}
                        style={{
                          backgroundColor: 
                            options[section.key as keyof DocumentationOptions] as boolean
                              ? "rgb(232, 240, 254)"
                              : "transparent",
                        }}
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
                          className="h-5 w-5 rounded border-2 focus:ring-2 focus:ring-offset-0 mt-0.5"
                          style={{ 
                            accentColor: "rgb(254, 74, 96)",
                            borderColor: "rgb(230, 232, 235)"
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-lg">{section.icon}</span>
                            <span className="text-sm font-semibold" style={{ color: "rgb(17, 24, 39)" }}>
                              {section.label}
                            </span>
                          </div>
                          <p className="text-xs" style={{ color: "rgb(17, 24, 39)", opacity: 0.6 }}>
                            {section.desc}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Output Configuration */}
                  <div className="space-y-8">
                    {/* Output Format */}
                    <div>
                      <h3
                        className="text-base font-bold mb-6"
                        style={{ color: "rgb(17, 24, 39)" }}
                      >
                        📄 Output Format
                      </h3>
                      <div className="space-y-3">
                        {{
                          value: "markdown",
                          label: "Markdown (.md)",
                          desc: "Best for GitHub and documentation platforms",
                          icon: "📝",
                        },
                        {
                          value: "html",
                          label: "HTML (.html)",
                          desc: "For web deployment and styling",
                          icon: "🌐",
                        },
                        {
                          value: "pdf",
                          label: "PDF (.pdf)",
                          desc: "Professional document format",
                          icon: "📄",
                        },
                      ].map((format) => (
                        <label
                          key={format.value}
                          className={`flex items-start space-x-4 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                            options.format === format.value ? 'ring-2 ring-red-200' : 'hover:bg-gray-50'
                          }`}
                          style={{ 
                            backgroundColor: options.format === format.value ? "rgb(232, 240, 254)" : "transparent"
                          }}
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
                            className="h-5 w-5 mt-0.5"
                            style={{ accentColor: "rgb(254, 74, 96)" }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-lg">{format.icon}</span>
                              <span className="text-sm font-semibold" style={{ color: "rgb(17, 24, 39)" }}>
                                {format.label}
                              </span>
                            </div>
                            <p className="text-xs" style={{ color: "rgb(17, 24, 39)", opacity: 0.6 }}>
                              {format.desc}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>

                    {/* Detail Level */}
                    <div>
                      <h3
                        className="text-base font-bold mb-6"
                        style={{ color: "rgb(17, 24, 39)" }}
                      >
                        🎯 Detail Level
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
                        className="w-full px-4 py-3 border rounded-xl text-sm font-medium focus:ring-2 focus:outline-none focus:ring-red-300"
                        style={{ 
                          borderColor: "rgb(230, 232, 235)",
                          backgroundColor: "rgb(255, 253, 248)",
                          color: "rgb(17, 24, 39)"
                        }}
                      >
                        <option value="basic">🔸 Basic - Essential information only</option>
                        <option value="detailed">🔹 Detailed - Comprehensive documentation</option>
                        <option value="comprehensive">💎 Comprehensive - Everything included</option>
                      </select>
                    </div>

                    {/* File Size Limit */}
                    <div>
                      <h3
                        className="text-base font-bold mb-4"
                        style={{ color: "rgb(17, 24, 39)" }}
                      >
                        📊 Max File Size: <span style={{ color: "rgb(254, 74, 96)" }}>{options.maxFileSize}MB</span>
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
                        className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                        style={{ 
                          backgroundColor: "rgb(230, 232, 235)",
                          accentColor: "rgb(254, 74, 96)"
                        }}
                      />
                      <div className="flex justify-between text-xs mt-2" style={{ color: "rgb(17, 24, 39)", opacity: 0.6 }}>
                        <span>10MB</span>
                        <span>Small projects</span>
                        <span>Large codebases</span>
                        <span>100MB</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Generate Button - Prominent CTA */}
                <div className="pt-6 border-t" style={{ borderColor: "rgb(230, 232, 235)" }}>
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1">
                      {selectedRepo ? (
                        <div className="text-center md:text-left">
                          <p className="text-sm font-semibold" style={{ color: "rgb(17, 24, 39)" }}>
                            Ready to generate documentation for{" "}
                            <span style={{ color: "rgb(254, 74, 96)" }}>{selectedRepo.name}</span>
                          </p>
                          <p className="text-xs mt-1" style={{ color: "rgb(17, 24, 39)", opacity: 0.6 }}>
                            This will analyze your repository and create comprehensive documentation
                          </p>
                        </div>
                      ) : (
                        <div className="text-center md:text-left">
                          <p className="text-sm font-medium" style={{ color: "rgb(17, 24, 39)", opacity: 0.6 }}>
                            Select a repository to get started
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={handleGenerateDocumentation}
                      disabled={!selectedRepo || isGenerating}
                      className={`flex items-center justify-center space-x-3 px-8 py-4 rounded-2xl text-base font-bold transition-all duration-200 shadow-lg hover:shadow-xl min-w-64 ${
                        !selectedRepo || isGenerating
                          ? 'cursor-not-allowed opacity-50'
                          : 'hover:scale-105 active:scale-95'
                      }`}
                      style={{ 
                        backgroundColor: "rgb(254, 74, 96)",
                        color: "white"
                      }}
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                          <span>Generating Documentation...</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownTrayIcon className="h-6 w-6" />
                          <span>Generate Documentation</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
