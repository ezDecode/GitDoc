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
      const errorMessage = error instanceof Error ? error.message : "Failed to generate documentation. Please try again.";
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
    }`;    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: "var(--background)" }}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-black">Repository</span>
            <span className="text-red-500"> Documentation</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Generate comprehensive documentation for <span className="font-semibold text-red-600">{repository.full_name}</span> using AI-powered analysis.
            Customize your options below to create the perfect documentation.
          </p>
        </div>

        {/* Main Configuration Card */}
        <div 
          className="card-3d rounded-xl shadow-xl overflow-hidden"
          style={{ background: "var(--card-bg)" }}
        >
          {/* Repository Info Header */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-200 p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-white shadow-sm border border-gray-200">
                <svg className="w-6 h-6 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{repository.name}</h3>
                <p className="text-gray-600">{repository.full_name}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {repository.language || "N/A"}
                  </span>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {repository.stargazers_count || 0}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414L2.586 8.707a1 1 0 010-1.414L6.293 3.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {repository.forks_count || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Documentation options */}
            <div className="space-y-6">
              <h4 className="font-semibold text-gray-900 text-xl flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Documentation Configuration
              </h4>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sections */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    📝 Include Sections:
                  </label>
                  <div className="space-y-3">
                    {[
                      { key: "includeReadme", label: "README Overview", icon: "📖" },
                      { key: "includeInstallation", label: "Installation Guide", icon: "⚙️" },
                      { key: "includeApi", label: "API Documentation", icon: "🔧" },
                      { key: "includeExamples", label: "Code Examples", icon: "💻" },
                      { key: "includeContributing", label: "Contributing Guidelines", icon: "🤝" },
                    ].map(({ key, label, icon }) => (
                      <label
                        key={key}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={
                            options[key as keyof DocumentationOptions] as boolean
                          }
                          onChange={(e) =>
                            setOptions((prev) => ({
                              ...prev,
                              [key]: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className="text-lg">{icon}</span>
                        <span className="text-sm font-medium text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Configuration Options */}
                <div className="space-y-4">
                  {/* Documentation Depth */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🎯 Documentation Depth:
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    >
                      <option value="basic">Basic - Essential information only</option>
                      <option value="detailed">Detailed - Comprehensive guide</option>
                      <option value="comprehensive">
                        Comprehensive - Full analysis with examples
                      </option>
                    </select>
                  </div>

                  {/* Output Format */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📄 Output Format:
                    </label>
                    <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-lg">
                      {[
                        { value: "markdown", label: "Markdown", icon: "📝" },
                        { value: "html", label: "HTML", icon: "🌐" },
                        { value: "pdf", label: "PDF", icon: "📋" },
                      ].map(({ value, label, icon }) => (
                        <label
                          key={value}
                          className="flex items-center justify-center space-x-2 py-2 px-3 rounded-md cursor-pointer transition-all"
                        >
                          <input
                            type="radio"
                            value={value}
                            checked={options.format === value}
                            onChange={(e) =>
                              setOptions((prev) => ({
                                ...prev,
                                format: e.target.value as
                                  | "markdown"
                                  | "html"
                                  | "pdf",
                              }))
                            }
                            className="sr-only"
                          />
                          <span
                            className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                              options.format === value
                                ? "bg-red-500 text-white shadow-md"
                                : "bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <span>{icon}</span>
                            <span>{label}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Size limit slider */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        📊 File Size Limit:
                      </label>
                      <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
                        {sizeLimit}KB
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={sizeLimit}
                      onChange={(e) => setSizeLimit(parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>10KB</span>
                      <span>100KB</span>
                    </div>                    <p className="text-xs text-gray-600 mt-1">
                      Only files smaller than this limit will be analyzed for content
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Context Analysis Section */}
          <div className="bg-blue-50 rounded-lg p-5 border border-blue-200 mb-5">
            <h4 className="font-medium text-blue-900 text-lg mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                ></path>
              </svg>
              🧠 AI-Powered Context Analysis
            </h4>
            <div className="text-sm text-blue-800 space-y-3">
              <p>
                <strong>Advanced Repository Analysis:</strong> Our AI analyzes your entire repository structure and key files to generate contextually accurate documentation.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-white rounded p-3 border border-blue-200">
                  <h5 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Key Files Analyzed
                  </h5>
                  <ul className="text-xs space-y-1">
                    <li>• README.md & documentation files</li>
                    <li>• package.json & dependency configs</li>
                    <li>• tsconfig.json & build configs</li>
                    <li>• .env templates & example files</li>
                    <li>• License & contributing guidelines</li>
                  </ul>
                </div>
                
                <div className="bg-white rounded p-3 border border-blue-200">
                  <h5 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Code Structure Analysis
                  </h5>
                  <ul className="text-xs space-y-1">
                    <li>• Main entry points & modules</li>
                    <li>• API routes & endpoints</li>
                    <li>• Component structure (React/Vue)</li>
                    <li>• Database models & schemas</li>
                    <li>• Test files & examples</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-white rounded p-3 border border-blue-200 mt-3">
                <p className="text-xs">
                  <strong>🎯 Smart Content Generation:</strong> Based on your {options.depth} analysis depth, the AI will provide 
                  {options.depth === 'basic' ? ' essential information and quick setup instructions' : 
                   options.depth === 'detailed' ? ' comprehensive documentation with code examples and best practices' :
                   ' exhaustive analysis including architecture diagrams, advanced usage patterns, and troubleshooting guides'}.
                </p>              </div>
            </div>
          </div>
        </div>
        
        {/* Progress Indicator */}
        {isGenerating && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <svg
                  className="animate-spin h-8 w-8 text-red-500"
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
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-medium text-gray-900">Generating Documentation</h4>
                <p className="text-gray-600">{progress}</p>
                {analysisDetails && (
                  <div className="mt-2 text-sm text-gray-500">
                    <div>Current Step: {analysisDetails.currentStep}</div>
                    <div>Files Analyzed: {analysisDetails.filesAnalyzed} / {analysisDetails.totalFiles}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${analysisDetails.totalFiles > 0 
                            ? (analysisDetails.filesAnalyzed / analysisDetails.totalFiles) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-red-800 font-medium">Error Generating Documentation</h4>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Generate Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-medium py-3 px-8 rounded-lg flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:shadow-none transition-all"
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
                  className="w-5 h-5 mr-2"
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
              </>            )}
          </button>
        </div>
        
        {/* Generated Documentation Preview */}
        {generatedDocs && (
          <div className="space-y-4 mt-8">
            <div className="flex items-center justify-between sticky top-0 bg-white py-2 z-10 border-b border-gray-200">
              <div>
                <h4 className="font-semibold text-gray-800 text-lg">Generated Documentation</h4>
                <p className="text-sm text-gray-600 mt-1">
                  📄 {Math.round(generatedDocs.length / 1024)}KB • 
                  {generatedDocs.split('\n').length} lines • 
                  Format: {options.format.toUpperCase()}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedDocs);
                    // Could add a toast notification here
                  }}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById("doc-preview");
                    if (el) {
                      if (document.fullscreenElement) {
                        document.exitFullscreen();
                      } else {
                        el.requestFullscreen();
                      }
                    }
                  }}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-red-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
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
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                    />
                  </svg>
                  Fullscreen
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center px-3 py-1.5 bg-red-500 text-sm font-medium rounded-md text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
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
                  Download {options.format.toUpperCase()}
                </button>
              </div>
            </div>
            
            <div
              id="doc-preview"
              className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  <span>{repository.name}-documentation.{options.format === "markdown" ? "md" : options.format}</span>
                </div>
              </div>
              
              <div className="p-6 max-h-[600px] overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                    {generatedDocs}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
