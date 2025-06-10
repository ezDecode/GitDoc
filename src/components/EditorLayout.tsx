"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FileTree, { buildFileTree } from "@/components/FileTree";
import Editor from "@/components/Editor";
import Preview from "@/components/Preview";
import CodeDocumentationGenerator from "@/components/CodeDocumentationGenerator";
import { getFileContent, updateFile } from "@/lib/github";
import { Session } from "next-auth";

interface EditorLayoutProps {
  session: Session;
  owner: string;
  repo: string;
  branch: string;
  files: Array<{ path: string; type: "blob" | "tree" }>;
}

export default function EditorLayout({
  session,
  owner,
  repo,
  branch,
  files,
}: EditorLayoutProps) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fileSha, setFileSha] = useState<string | null>(null);
  const [fileTree, setFileTree] = useState<any[]>([]);

  useEffect(() => {
    setFileTree(buildFileTree(files));
  }, [files]);

  useEffect(() => {
    if (selectedFile && session?.accessToken) {
      loadFileContent(selectedFile);
    }
  }, [selectedFile, session?.accessToken]);

  const loadFileContent = async (path: string) => {
    setIsLoading(true);
    try {
      if (!session.accessToken) {
        throw new Error("No access token available");
      }
      const { content, sha } = await getFileContent(
        session.accessToken,
        owner,
        repo,
        path,
        branch
      );
      setFileContent(content);
      setFileSha(sha);
    } catch (error) {
      console.error("Error loading file content:", error);
      setFileContent("# Error loading file content");
    } finally {
      setIsLoading(false);
    }
  };
  const handleFileSelect = (path: string) => {
    // Load markdown files in the editor, and code files for documentation generation
    if (path.endsWith(".md") || path.endsWith(".mdx") || isCodeFile(path)) {
      setSelectedFile(path);
    }
  };

  const isCodeFile = (path: string): boolean => {
    const codeExtensions = [
      ".ts",
      ".tsx",
      ".js",
      ".jsx",
      ".py",
      ".java",
      ".cpp",
      ".c",
      ".cs",
      ".php",
      ".rb",
      ".go",
      ".rs",
      ".swift",
      ".kt",
    ];
    return codeExtensions.some((ext) => path.endsWith(ext));
  };

  const isMarkdownFile = (path: string): boolean => {
    return path.endsWith(".md") || path.endsWith(".mdx");
  };

  const getFileType = (path: string): string => {
    const extension = path.split(".").pop()?.toLowerCase() || "";
    const typeMap: { [key: string]: string } = {
      ts: "typescript",
      tsx: "typescript",
      js: "javascript",
      jsx: "javascript",
      py: "python",
      java: "java",
      cpp: "cpp",
      c: "c",
      cs: "csharp",
      php: "php",
      rb: "ruby",
      go: "go",
      rs: "rust",
      swift: "swift",
      kt: "kotlin",
    };
    return typeMap[extension] || extension;
  };

  const handleContentChange = (newContent: string) => {
    setFileContent(newContent);
  };

  const handleSave = async () => {
    if (!selectedFile || !session?.accessToken) return;

    setIsSaving(true);
    try {
      await updateFile(
        session.accessToken,
        owner,
        repo,
        selectedFile,
        fileContent,
        `Update ${selectedFile}`,
        fileSha || undefined,
        branch
      );

      // Reload the file to get the new SHA
      await loadFileContent(selectedFile);
    } catch (error) {
      console.error("Error saving file:", error);
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div
      className="flex h-[calc(100vh-4rem)] overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Sidebar */}
      <div
        className="w-72 shadow-md overflow-auto custom-scrollbar card-3d"
        style={{ background: "var(--card-bg)" }}
      >
        <div
          className="p-5"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-lg font-bold truncate">
              {owner}/{repo}
            </h2>
          </div>
          <div className="mt-2 flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-2">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
              {branch}
            </span>
          </div>
        </div>
        <div className="py-2">
          <FileTree
            files={fileTree}
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile || undefined}
          />
        </div>
      </div>{" "}
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {selectedFile ? (
          <>
            {" "}
            {/* Toolbar */}
            <div
              className="flex items-center justify-between px-4 py-3 shadow-sm card-3d"
              style={{
                background: "var(--card-bg)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center space-x-3">
                {" "}
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium card-3d"
                  style={{
                    background: "var(--card-bg-secondary)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {isMarkdownFile(selectedFile) ? (
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path>
                    ) : (
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      ></path>
                    )}
                  </svg>
                  {selectedFile}
                  {!isMarkdownFile(selectedFile) && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                      {getFileType(selectedFile).toUpperCase()}
                    </span>
                  )}
                </span>
              </div>{" "}
              <div className="flex items-center space-x-2">
                {isMarkdownFile(selectedFile) && (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center card-3d"
                  >
                    {isSaving ? (
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
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        Save
                      </>
                    )}
                  </button>
                )}
                {!isMarkdownFile(selectedFile) && (
                  <div className="text-sm text-gray-500 italic">
                    View-only • Use documentation generator to create docs
                  </div>
                )}
              </div>
            </div>{" "}
            {/* Editor and Preview / Code Documentation */}
            <div className="flex flex-1 overflow-hidden">
              {isMarkdownFile(selectedFile) ? (
                // Markdown file: Show editor and preview
                <>
                  <div
                    className="w-1/2 overflow-hidden card-3d"
                    style={{ background: "var(--card-bg)" }}
                  >
                    {isLoading ? (
                      <div className="h-full w-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
                      </div>
                    ) : (
                      <div className="h-full p-4">
                        <Editor
                          value={fileContent}
                          onChange={handleContentChange}
                          language={
                            selectedFile.endsWith(".mdx")
                              ? "markdown"
                              : "markdown"
                          }
                        />
                      </div>
                    )}
                  </div>
                  <div
                    className="w-1/2 overflow-auto custom-scrollbar card-3d-right"
                    style={{
                      background: "var(--card-bg-secondary)",
                      borderLeft: "1px solid var(--border)",
                    }}
                  >
                    <div
                      className="p-6"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <Preview content={fileContent} />
                    </div>
                  </div>
                </>
              ) : (
                // Code file: Show code viewer and documentation generator
                <>
                  <div
                    className="w-1/2 overflow-hidden card-3d"
                    style={{ background: "var(--card-bg)" }}
                  >
                    {isLoading ? (
                      <div className="h-full w-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
                      </div>
                    ) : (
                      <div className="h-full p-4">
                        <Editor
                          value={fileContent}
                          onChange={() => {}} // Read-only for code files
                          language={getFileType(selectedFile)}
                        />
                      </div>
                    )}
                  </div>
                  <div
                    className="w-1/2 overflow-auto custom-scrollbar card-3d-right"
                    style={{
                      background: "var(--card-bg-secondary)",
                      borderLeft: "1px solid var(--border)",
                    }}
                  >
                    <div
                      className="p-6"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {!isLoading && (
                        <CodeDocumentationGenerator
                          code={fileContent}
                          fileName={selectedFile}
                          fileType={getFileType(selectedFile)}
                        />
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div
              className="p-10 rounded-xl shadow-sm flex flex-col items-center max-w-md card-3d"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            >
              <img
                src="/document-icon.svg"
                alt="Document icon"
                className="w-24 h-24 mb-6"
              />{" "}
              <h3
                className="text-xl font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                No File Selected
              </h3>
              <p
                style={{ color: "var(--text-secondary)" }}
                className="text-center"
              >
                Select a markdown file to edit or a code file to generate
                documentation
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
