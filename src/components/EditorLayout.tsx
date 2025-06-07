"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FileTree, { buildFileTree } from "@/components/FileTree";
import Editor from "@/components/Editor";
import Preview from "@/components/Preview";
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
    // Only load markdown files in the editor
    if (path.endsWith(".md") || path.endsWith(".mdx")) {
      setSelectedFile(path);
    }
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
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 dark:border-gray-700 overflow-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">
            {owner}/{repo}
          </h2>
          <p className="text-sm text-gray-500">Branch: {branch}</p>
        </div>
        <FileTree
          files={fileTree}
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile || undefined}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {selectedFile ? (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700">
              <div className="text-sm truncate">{selectedFile}</div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

            {/* Editor and Preview */}
            <div className="flex flex-1 overflow-hidden">
              <div className="w-1/2 overflow-hidden">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : (
                  <Editor
                    value={fileContent}
                    onChange={handleContentChange}
                    language={
                      selectedFile.endsWith(".mdx") ? "markdown" : "markdown"
                    }
                  />
                )}
              </div>
              <div className="w-1/2 border-l border-gray-200 dark:border-gray-700 overflow-auto">
                <Preview content={fileContent} />
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-500 mb-4">Select a markdown file to edit</p>
          </div>
        )}
      </div>
    </div>
  );
}
