import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { generateDocument, generateTitle } from "@/utils/gemini";
import { generateDetailedPrompt } from "@/utils/prompts";
import { prisma } from "@/lib/prisma";
import {
  getRepoTree,
  getRepoFileContent,
  getRepositoryInfo,
} from "@/lib/github";

// Prioritized list of files to fetch for context
const KEY_FILES = [
  "README.md",
  "package.json",
  "tsconfig.json",
  "next.config.js",
  "next.config.mjs",
  "next.config.ts",
  "tailwind.config.ts",
  "src/app/page.tsx",
  "src/pages/index.js",
  "requirements.txt",
  "pyproject.toml",
  "pom.xml",
  "build.gradle",
  "src/main.py",
  "src/main.java",
  "main.go",
  "Cargo.toml",
  "composer.json",
  "Gemfile",
];

// File size limit (1MB)
const MAX_FILE_SIZE = 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body with validation
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { repository, options, prompt, code, fileType, fileName } = body;

    // Validate required fields
    if (!repository && !prompt) {
      return NextResponse.json(
        { error: "Either repository or prompt is required" },
        { status: 400 }
      );
    }

    // Handle both repository documentation and general prompt generation
    let content: string;
    let title: string;
    if (code && fileType) {
      // Generate code documentation using our detailed prompt
      try {
        const detailedPrompt = generateDetailedPrompt(code, fileType, fileName);
        content = await generateDocument(detailedPrompt, options);
        title = fileName
          ? `${fileName} Documentation`
          : `${fileType} Code Documentation`;
      } catch (error: any) {
        console.error("Error generating code documentation:", error);
        return NextResponse.json(
          { error: `Failed to generate code documentation: ${error.message}` },
          { status: 500 }
        );
      }
    } else if (repository) {
      // Validate repository format
      if (typeof repository !== "string" || !repository.includes("/")) {
        return NextResponse.json(
          { error: "Repository must be in format 'owner/repo'" },
          { status: 400 }
        );
      }

      // Ensure user has GitHub access token for repository analysis
      if (session.provider !== "github" || !session.accessToken) {
        return NextResponse.json(
          { error: "A GitHub connection is required to analyze repositories." },
          { status: 403 }
        );
      }

      try {
        // Generate repository documentation with rich context
        content = await generateRepositoryDocumentation(
          repository,
          options || {},
          session.accessToken,
          body // Pass the full body to extract repo details
        );
        title = `Documentation for ${repository.split("/").pop()}`;
      } catch (error: any) {
        console.error("Error generating repository documentation:", error);
        return NextResponse.json(
          { error: `Failed to analyze repository: ${error.message}` },
          { status: 500 }
        );
      }
    } else if (prompt && typeof prompt === "string") {
      // Validate prompt
      if (prompt.trim().length === 0) {
        return NextResponse.json(
          { error: "Prompt cannot be empty" },
          { status: 400 }
        );
      }

      try {
        // Generate general document from prompt
        content = await generateDocument(prompt, options);
        title = await generateTitle(content);
      } catch (error: any) {
        console.error("Error generating document from prompt:", error);
        return NextResponse.json(
          { error: `Failed to generate document: ${error.message}` },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Repository, code, or prompt is required" },
        { status: 400 }
      );
    }

    // Save the document to the database
    const document = await prisma.document.create({
      data: {
        title,
        content,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      document,
      content,
      repository: repository || null,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating document:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate document";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
async function generateRepositoryDocumentation(
  repositoryFullName: string,
  options: any,
  accessToken: string,
  repoInfo: any
): Promise<string> {
  const [owner, repo] = repositoryFullName.split("/");

  if (!owner || !repo) {
    throw new Error("Invalid repository format. Expected 'owner/repo'");
  }

  try {
    // 1. Fetch repository metadata with timeout
    console.log(`Fetching repository info for ${owner}/${repo}`);
    const repositoryData = (await Promise.race([
      getRepositoryInfo(accessToken, owner, repo),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Repository info fetch timeout")),
          30000
        )
      ),
    ])) as any;

    // 2. Fetch file tree with timeout
    console.log(`Fetching file tree for ${owner}/${repo}`);
    const tree = (await Promise.race([
      getRepoTree(accessToken, owner, repo, repositoryData.defaultBranch),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("File tree fetch timeout")), 30000)
      ),
    ])) as string[];

    // Limit tree size for performance
    const limitedTree = tree.slice(0, 1000);
    const treeString = limitedTree.join("\n");

    // 3. Identify and fetch content of key files
    const filesToFetch = KEY_FILES.filter((file) => limitedTree.includes(file));
    console.log(`Fetching ${filesToFetch.length} key files`);

    const filePromises = filesToFetch.map(async (path) => {
      try {
        const content = await getRepoFileContent(
          accessToken,
          owner,
          repo,
          path,
          repositoryData.defaultBranch
        );

        // Limit file content size
        const limitedContent =
          content.length > MAX_FILE_SIZE
            ? content.substring(0, MAX_FILE_SIZE) + "\n... (file truncated)"
            : content;

        return { path, content: limitedContent };
      } catch (error) {
        console.warn(`Failed to fetch ${path}:`, error);
        return null;
      }
    });

    const fetchedFiles = (await Promise.all(filePromises)).filter(
      (f): f is { path: string; content: string } => f !== null
    );

    // 4. Create a comprehensive context-rich prompt
    const context = {
      tree: treeString,
      files: fetchedFiles,
      repoInfo: { ...repoInfo, ...repositoryData },
    };
    const prompt = createDocumentationPrompt(
      repositoryFullName,
      options,
      context
    );

    // 5. Use Gemini AI to generate the documentation
    console.log(`Generating documentation for ${repositoryFullName}`);
    const content = await generateDocument(prompt, {
      temperature: 0.7,
      maxOutputTokens: 8192,
    });

    return content;
  } catch (error: any) {
    console.error("Error generating repository documentation:", error);

    // Provide more specific error messages
    if (error.message?.includes("timeout")) {
      throw new Error(
        "Repository analysis timed out. The repository might be too large or the GitHub API is slow."
      );
    } else if (error.message?.includes("not found")) {
      throw new Error("Repository not found or you don't have access to it.");
    } else if (error.message?.includes("rate limit")) {
      throw new Error(
        "GitHub API rate limit exceeded. Please try again later."
      );
    } else {
      // Fallback to basic documentation if context fetching fails
      console.log("Attempting fallback documentation generation");
      try {
        return await generateFallbackDocumentation(repositoryFullName, options);
      } catch (fallbackError) {
        throw new Error(
          `Failed to generate documentation: ${
            error.message || "Unknown error"
          }`
        );
      }
    }
  }
}

function createDocumentationPrompt(
  repository: string,
  options: any,
  context: {
    tree: string;
    files: { path: string; content: string }[];
    repoInfo: any;
  }
): string {
  const sections = [];
  if (options.includeReadme !== false)
    sections.push("A project overview and README");
  if (options.includeInstallation !== false)
    sections.push("Installation instructions");
  if (options.includeApi !== false)
    sections.push("API documentation/core features");
  if (options.includeExamples !== false)
    sections.push("Usage and code examples");
  if (options.includeContributing === true)
    sections.push("Contributing guidelines");

  const depth =
    options.depth === "basic"
      ? "brief and concise"
      : options.depth === "comprehensive"
      ? "extremely detailed with comprehensive examples"
      : "detailed and thorough";

  const fileContents = context.files
    .slice(0, 10) // Limit to first 10 files to avoid token limits
    .map(
      (file) =>
        `\n--- File: ${file.path} ---\n\`\`\`${
          file.path.split(".").pop() || ""
        }\n${file.content}\n\`\`\``
    )
    .join("\n");

  return `You are an expert technical writer. Your task is to generate high-quality, ${depth} documentation for a GitHub repository based on the context provided below.

**Repository Information:**
- Full Name: ${repository}
- Description: ${context.repoInfo.description || "Not provided."}
- Primary Language: ${context.repoInfo.language || "Not specified."}
- Stars: ${context.repoInfo.stargazers_count || 0}
- Forks: ${context.repoInfo.forks_count || 0}
- License: ${context.repoInfo.license?.name || "Not specified"}

**File & Directory Structure:**
This is a summary of the repository's file structure:
\`\`\`
${context.tree}
\`\`\`

**Key File Contents:**
I have retrieved the content of the following key files for your analysis:
${fileContents}

**YOUR TASK:**
Generate ${depth} documentation for this repository. The user has requested the following sections: ${sections.join(
    ", "
  )}.

**INSTRUCTIONS:**
1.  **Analyze the context:** Thoroughly examine the file structure and the contents of the key files to understand the project's purpose, technologies, dependencies, and architecture.
2.  **Installation Guide:** Use files like \`package.json\` or \`requirements.txt\` to provide accurate installation steps. Mention the exact commands to run (e.g., \`npm install\`).
3.  **Core Features:** Based on the code, README, and description, explain what the project does and its main features.
4.  **Usage Examples:** Create clear, practical code examples. If you see functions or components in the provided source code, show how to use them.
5.  **Structure and Formatting:** Format the output as clean, well-structured Markdown. Use headings, lists, and code blocks effectively. Start with relevant shields.io badges for license, language, etc., if information is available.
6.  **Fact-Based:** Base your documentation strictly on the provided context. Do not invent information. If a piece of information (like a license) is missing, state that it was not found.

Now, generate the complete Markdown documentation.`;
}

async function generateFallbackDocumentation(
  repository: string,
  options: any
): Promise<string> {
  const repoName = repository.split("/").pop() || repository;
  const [owner] = repository.split("/");

  return `# ${repoName}

> AI-generated documentation for **${repository}**

## Overview
This repository contains the source code for ${repoName}. This documentation was generated automatically when detailed analysis was not available.

## Quick Start

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/${repository}.git
cd ${repoName}

# Install dependencies (if applicable)
npm install
# or
yarn install
# or
pip install -r requirements.txt
\`\`\`

### Basic Usage

\`\`\`bash
# Run the application
npm start
# or
python main.py
# or
./run.sh
\`\`\`

## Repository Information

- **Repository**: [${repository}](https://github.com/${repository})
- **Owner**: ${owner}
- **Project**: ${repoName}

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

Please check the repository for license information.

## Support

For support and questions, please visit the [GitHub repository](https://github.com/${repository}) and create an issue.

---

*This documentation was generated automatically. For more detailed information, please refer to the actual repository files and README.*`;
}
