"use client";

import { useState } from "react";

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

interface DocumentationGeneratorProps {
  repository: Repository;
}

interface DocumentationOptions {
  includeReadme: boolean;
  includeApi: boolean;
  includeExamples: boolean;
  includeInstallation: boolean;
  includeContributing: boolean;
  format: "markdown" | "html" | "pdf";
  depth: "basic" | "detailed" | "comprehensive";
}

export default function DocumentationGenerator({
  repository,
}: DocumentationGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocs, setGeneratedDocs] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");
  const [analysisDetails, setAnalysisDetails] = useState<{
    filesAnalyzed: number;
    totalFiles: number;
    currentStep: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<DocumentationOptions>({
    includeReadme: true,
    includeApi: true,
    includeExamples: true,
    includeInstallation: true,
    includeContributing: false,
    format: "markdown",
    depth: "detailed",
  });

  // Track file size limit
  const [sizeLimit, setSizeLimit] = useState<number>(50); // Default 50kb

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setProgress("Initializing analysis...");
    setAnalysisDetails(null);

    try {
      setProgress("Connecting to GitHub API...");

      const response = await fetch("/api/documents/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repository: repository.full_name,
          options: {
            ...options,
            sizeLimit: sizeLimit,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate documentation");
      }

      setProgress("Processing repository data...");
      const data = await response.json();

      if (data.analysisDetails) {
        setAnalysisDetails(data.analysisDetails);
      }

      setProgress("Documentation generated successfully!");
      setGeneratedDocs(data.content);
    } catch (error) {
      console.error("Error generating documentation:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate documentation. Please try again.";
      setError(errorMessage);
      setProgress("");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedDocs) return;

    const blob = new Blob([generatedDocs], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${repository.name}-documentation.${
      options.format === "markdown" ? "md" : options.format
    }`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatOptions = [
    { value: "markdown", label: "Markdown" },
    { value: "html", label: "HTML" },
    { value: "pdf", label: "PDF" },
  ];

  const depthOptions = [
    { value: "basic", label: "Basic" },
    { value: "detailed", label: "Detailed" },
    { value: "comprehensive", label: "Comprehensive" },
  ];
  return (
    <div className="space-y-6">
      {/* Repository Info */}
      <div className="p-4 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-xl border border-indigo-100">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <svg
              className="w-5 h-5 text-indigo-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-grow">
            <div className="flex items-center space-x-3 mb-1">
              <h3 className="text-lg font-bold text-slate-900">
                {repository.name}
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {repository.language || "Unknown"}
              </span>
              {repository.private && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  🔒 Private
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 mb-3">
              {repository.description || "No description available"}
            </p>
            <div className="flex items-center space-x-4 text-xs text-slate-500">
              <div className="flex items-center space-x-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{repository.stargazers_count}</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414L2.586 7l3.707-3.707a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{repository.forks_count}</span>
              </div>
            </div>
          </div>
        </div>
      </div>{" "}
      {/* Documentation Options */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-1.5 bg-purple-100 rounded-lg">
            <svg
              className="w-4 h-4 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            Documentation Sections
          </h3>
        </div>
        {/* Checkboxes with Icons */}
        <div className="grid grid-cols-1 gap-3">
          {[
            {
              key: "includeReadme",
              label: "README Documentation",
              icon: "📘",
              description: "Generate README.md content",
            },
            {
              key: "includeApi",
              label: "API Documentation",
              icon: "⚙️",
              description: "Document APIs and endpoints",
            },
            {
              key: "includeExamples",
              label: "Code Examples",
              icon: "🧪",
              description: "Include usage examples",
            },
            {
              key: "includeInstallation",
              label: "Installation Guide",
              icon: "⚡",
              description: "Setup and installation steps",
            },
            {
              key: "includeContributing",
              label: "Contributing Guide",
              icon: "🤝",
              description: "Contribution guidelines",
            },
          ].map((option) => (
            <label
              key={option.key}
              className="group relative flex items-start p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50 transition-all cursor-pointer"
            >
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  checked={
                    options[option.key as keyof DocumentationOptions] as boolean
                  }
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      [option.key]: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                />
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{option.icon}</span>
                  <span className="text-sm font-medium text-slate-900 group-hover:text-indigo-900">
                    {option.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {option.description}
                </p>
              </div>
            </label>
          ))}
        </div>{" "}
        {/* Format and Detail Selectors */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-slate-700">
              <div className="p-1 bg-blue-100 rounded">
                <svg
                  className="w-3 h-3 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <span>Output Format</span>
            </label>
            <select
              value={options.format}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  format: e.target.value as "markdown" | "html" | "pdf",
                }))
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              {formatOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-slate-700">
              <div className="p-1 bg-green-100 rounded">
                <svg
                  className="w-3 h-3 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span>Detail Level</span>
            </label>
            <select
              value={options.depth}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  depth: e.target.value as
                    | "basic"
                    | "detailed"
                    | "comprehensive",
                }))
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              {depthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* File Size Limit Slider */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-[rgb(31,41,55)]">
              Maximum File Size
            </label>
            <span className="text-xs font-medium text-[rgb(254,74,96)]">
              {sizeLimit} KB
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="500"
            step="10"
            value={sizeLimit}
            onChange={(e) => setSizeLimit(parseInt(e.target.value))}
            className="w-full h-1.5 bg-[rgb(230,232,235)] rounded-full appearance-none cursor-pointer accent-[rgb(254,74,96)]"
          />
          <div className="flex justify-between text-[10px] text-[rgb(75,85,99)] mt-1">
            <span>10 KB</span>
            <span>500 KB</span>
          </div>
        </div>
      </div>{" "}
      {/* Generate Button */}
      <div className="pt-3">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-2.5 px-4 bg-[rgb(254,74,96)] hover:bg-[rgb(255,196,128)] text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-[rgb(254,74,96)] focus:ring-opacity-50 disabled:opacity-50 shadow-sm text-sm"
        >
          {isGenerating
            ? "Generating Documentation..."
            : "Generate Documentation"}
        </button>
      </div>{" "}
      {/* Progress Section */}
      {isGenerating && progress && (
        <div className="mt-3 p-3 bg-[rgb(255,244,218)] rounded-lg border border-[rgb(230,232,235)] shadow-sm">
          <h4 className="font-medium text-[rgb(31,41,55)] text-sm mb-1.5">
            Generation Progress
          </h4>
          <p className="text-[rgb(55,65,81)] text-xs mb-2">{progress}</p>

          {analysisDetails && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-[rgb(75,85,99)] mb-1">
                <span>{analysisDetails.currentStep}</span>
                <span className="font-medium">
                  {Math.round(
                    (analysisDetails.filesAnalyzed /
                      analysisDetails.totalFiles) *
                      100
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-[rgb(230,232,235)] rounded-full h-1.5">
                <div
                  className="bg-[rgb(254,74,96)] h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      (analysisDetails.filesAnalyzed /
                        analysisDetails.totalFiles) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <div className="animate-pulse flex space-x-1.5">
              <div className="w-2 h-2 bg-[rgb(254,74,96)] rounded-full"></div>
              <div className="w-2 h-2 bg-[rgb(254,74,96)] rounded-full animation-delay-100"></div>
              <div className="w-2 h-2 bg-[rgb(254,74,96)] rounded-full animation-delay-200"></div>
            </div>
          </div>
        </div>
      )}
      {/* Error Display */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-4 w-4 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-2">
              <h3 className="text-xs font-medium text-red-800">
                Generation Error
              </h3>
              <p className="mt-0.5 text-xs text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      {/* Generated Docs */}
      {generatedDocs && !isGenerating && (
        <div className="mt-3 p-3 bg-[rgb(255,244,218)] rounded-lg border border-[rgb(230,232,235)] shadow-sm">
          <h4 className="font-medium text-[rgb(31,41,55)] text-sm mb-1.5">
            Generated Documentation
          </h4>
          <p className="text-[rgb(55,65,81)] text-xs mb-3">
            Your documentation has been generated successfully!
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-[rgb(254,74,96)] hover:bg-[rgb(255,196,128)] text-white text-xs font-medium rounded-md transition-colors shadow-sm"
            >
              Download
            </button>
            <button className="px-3 py-1.5 bg-white hover:bg-gray-50 text-[rgb(31,41,55)] text-xs font-medium rounded-md border border-[rgb(230,232,235)] transition-colors">
              View Online
            </button>
            <button className="px-3 py-1.5 bg-white hover:bg-gray-50 text-[rgb(31,41,55)] text-xs font-medium rounded-md border border-[rgb(230,232,235)] transition-colors">
              Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
