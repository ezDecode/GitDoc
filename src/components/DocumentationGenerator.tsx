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
  const [options, setOptions] = useState<DocumentationOptions>({
    includeReadme: true,
    includeApi: true,
    includeExamples: true,
    includeInstallation: true,
    includeContributing: false,
    format: "markdown",
    depth: "detailed",
  });

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch("/api/documents/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repository: repository.full_name,
          options,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate documentation");
      }

      const data = await response.json();
      setGeneratedDocs(data.content);
    } catch (error) {
      console.error("Error generating documentation:", error);
      alert("Failed to generate documentation. Please try again.");
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

  return (
    <div className="space-y-6">
      {/* Repository Info */}
      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {repository.name}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {repository.full_name}
            </p>
          </div>
        </div>
        {repository.description && (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {repository.description}
          </p>
        )}
      </div>

      {/* Documentation Options */}
      <div className="space-y-4">
        <h4 className="font-medium text-slate-900 dark:text-white">
          Documentation Options
        </h4>

        {/* Content Sections */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Include Sections:
          </label>
          <div className="space-y-2">
            {[
              { key: "includeReadme", label: "README Overview" },
              { key: "includeInstallation", label: "Installation Guide" },
              { key: "includeApi", label: "API Documentation" },
              { key: "includeExamples", label: "Code Examples" },
              { key: "includeContributing", label: "Contributing Guidelines" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={
                    options[key as keyof DocumentationOptions] as boolean
                  }
                  onChange={(e) =>
                    setOptions((prev) => ({ ...prev, [key]: e.target.checked }))
                  }
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Documentation Depth */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Documentation Depth:
          </label>
          <select
            value={options.depth}
            onChange={(e) =>
              setOptions((prev) => ({
                ...prev,
                depth: e.target.value as "basic" | "detailed" | "comprehensive",
              }))
            }
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="basic">Basic - Essential information only</option>
            <option value="detailed">Detailed - Comprehensive coverage</option>
            <option value="comprehensive">
              Comprehensive - Full analysis with examples
            </option>
          </select>
        </div>

        {/* Output Format */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Output Format:
          </label>
          <div className="flex space-x-4">
            {[
              { value: "markdown", label: "Markdown" },
              { value: "html", label: "HTML" },
              { value: "pdf", label: "PDF" },
            ].map(({ value, label }) => (
              <label key={value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  value={value}
                  checked={options.format === value}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      format: e.target.value as "markdown" | "html" | "pdf",
                    }))
                  }
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
      >
        {isGenerating ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
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
            <span>Generating Documentation...</span>
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
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
            <span>Generate Documentation</span>
          </>
        )}
      </button>

      {/* Generated Documentation Preview */}
      {generatedDocs && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-slate-900 dark:text-white">
              Generated Documentation
            </h4>
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-3 py-1.5 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg
                className="w-4 h-4 mr-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download
            </button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 max-h-64 overflow-y-auto">
            <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {generatedDocs}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
