/**
 * Component for generating documentation for individual code files
 */

"use client";

import { useState } from "react";
import {
  generateDetailedPrompt,
  generateApiDocPrompt,
  generateComponentDocPrompt,
} from "@/utils/prompts";

interface CodeDocumentationGeneratorProps {
  code: string;
  fileName: string;
  fileType: string;
}

export default function CodeDocumentationGenerator({
  code,
  fileName,
  fileType,
}: CodeDocumentationGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocs, setGeneratedDocs] = useState<string | null>(null);
  const [promptType, setPromptType] = useState<
    "detailed" | "api" | "component"
  >("detailed");

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      let prompt: string;

      // Choose appropriate prompt based on type
      switch (promptType) {
        case "api":
          // Detect if this looks like an API route
          const method = detectHttpMethod(code);
          const endpoint = extractEndpointFromFileName(fileName);
          prompt = generateApiDocPrompt(code, method, endpoint);
          break;
        case "component":
          // For React components
          const componentName = extractComponentName(fileName, code);
          prompt = generateComponentDocPrompt(code, componentName);
          break;
        default:
          prompt = generateDetailedPrompt(code, fileType, fileName);
      }

      const response = await fetch("/api/documents/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          fileType,
          fileName,
          prompt,
          options: {
            format: "markdown",
            depth: "detailed",
          },
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
    a.download = `${fileName.replace(/\.[^/.]+$/, "")}-docs.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper functions
  const detectHttpMethod = (code: string): string => {
    if (code.includes("export async function GET")) return "GET";
    if (code.includes("export async function POST")) return "POST";
    if (code.includes("export async function PUT")) return "PUT";
    if (code.includes("export async function DELETE")) return "DELETE";
    if (code.includes("export async function PATCH")) return "PATCH";
    return "GET";
  };

  const extractEndpointFromFileName = (fileName: string): string => {
    // Extract endpoint from Next.js API route file structure
    const parts = fileName.split("/");
    const routePart = parts.find((part) => part.includes("route.")) || fileName;
    return `/${parts.slice(0, -1).join("/")}`;
  };

  const extractComponentName = (fileName: string, code: string): string => {
    // Try to extract component name from export default or function name
    const defaultExportMatch = code.match(/export default function (\w+)/);
    if (defaultExportMatch) return defaultExportMatch[1];

    // Fallback to filename
    return fileName.replace(/\.[^/.]+$/, "").replace(/.*\//, "");
  };

  const isApiRoute = fileName.includes("route.") || fileName.includes("/api/");
  const isComponent = fileName.includes(".tsx") || fileName.includes(".jsx");

  return (
    <div
      className="card-3d p-4 rounded-lg"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Generate Documentation
          </h3>
          <span
            className="text-sm px-2 py-1 rounded"
            style={{
              background: "var(--card-bg-secondary)",
              color: "var(--text-secondary)",
            }}
          >
            {fileName}
          </span>
        </div>

        {/* Prompt type selector */}
        <div className="space-y-2">
          <label
            className="block text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Documentation Type:
          </label>
          <select
            value={promptType}
            onChange={(e) => setPromptType(e.target.value as any)}
            className="w-full p-2 border rounded-md text-sm"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          >
            <option value="detailed">Detailed Code Documentation</option>
            {isApiRoute && <option value="api">API Documentation</option>}
            {isComponent && (
              <option value="component">Component Documentation</option>
            )}
          </select>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex-1 px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center justify-center"
          >
            {isGenerating ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                Generating...
              </>
            ) : (
              "Generate Docs"
            )}
          </button>

          {generatedDocs && (
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            >
              Download
            </button>
          )}
        </div>

        {generatedDocs && (
          <div className="mt-4 space-y-2">
            <h4
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Generated Documentation:
            </h4>
            <div
              className="p-3 rounded-md text-sm max-h-40 overflow-y-auto custom-scrollbar"
              style={{
                background: "var(--card-bg-secondary)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              <pre className="whitespace-pre-wrap">{generatedDocs}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
