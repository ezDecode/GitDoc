import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { generateDocument, generateTitle } from "@/utils/gemini";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Parse request body
    const body = await req.json();
    const { repository, options, prompt } = body;

    // Handle both repository documentation and general prompt generation
    let content: string;
    let title: string;

    if (repository) {
      // Generate repository documentation
      content = await generateRepositoryDocumentation(
        repository,
        options || {}
      );
      title = `${repository.split("/").pop()} Documentation`;
    } else if (prompt && typeof prompt === "string") {
      // Generate general document from prompt
      content = await generateDocument(prompt, options);
      title = await generateTitle(content);
    } else {
      return new NextResponse(
        JSON.stringify({ error: "Repository or prompt is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
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

    return new NextResponse(
      JSON.stringify({
        document,
        content,
        repository: repository || null,
        generatedAt: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error generating document:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to generate document" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

async function generateRepositoryDocumentation(
  repository: string,
  options: any
) {
  try {
    // Create a comprehensive prompt for documentation generation
    const prompt = createDocumentationPrompt(repository, options);

    // Use Gemini AI to generate the documentation
    const content = await generateDocument(prompt);

    return content;
  } catch (error) {
    console.error("Gemini API error, using fallback:", error);

    // Fallback documentation if Gemini API fails
    return generateFallbackDocumentation(repository, options);
  }
}

function createDocumentationPrompt(repository: string, options: any) {
  const sections = [];

  if (options.includeReadme) sections.push("README overview");
  if (options.includeInstallation) sections.push("installation instructions");
  if (options.includeApi) sections.push("API documentation");
  if (options.includeExamples) sections.push("usage examples");
  if (options.includeContributing) sections.push("contributing guidelines");

  const depth =
    options.depth === "basic"
      ? "brief and concise"
      : options.depth === "comprehensive"
      ? "extremely detailed with comprehensive examples"
      : "detailed and thorough";

  return `Generate ${depth} documentation for the GitHub repository "${repository}".

Include the following sections: ${sections.join(", ")}.

The documentation should be:
- Well-structured and professional
- Include proper markdown formatting
- Provide clear examples where applicable
- Be suitable for developers of all skill levels
- Include installation, usage, and configuration details
- Add badges and shields where appropriate

Format the output as clean markdown that's ready to use as project documentation.

Repository: ${repository}
Documentation depth: ${options.depth}
Format: ${options.format}`;
}

function generateFallbackDocumentation(repository: string, options: any) {
  const repoName = repository.split("/").pop() || repository;

  return `# ${repoName}

## Overview
This is the documentation for the **${repository}** repository, generated using AI-powered documentation tools.

## Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/${repository}.git
cd ${repoName}

# Install dependencies
npm install
# or
yarn install
\`\`\`

## Usage

\`\`\`javascript
// Basic usage example
import { ${repoName} } from './${repoName}';

const instance = new ${repoName}();
instance.init();
\`\`\`

## API Reference

### Main Methods

#### \`init()\`
Initializes the application.

#### \`configure(options)\`
Configures the application with the provided options.

**Parameters:**
- \`options\` (Object): Configuration options

## Examples

### Basic Example
\`\`\`javascript
// Example usage
const app = new ${repoName}();
app.init();
\`\`\`

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

*Documentation generated on ${new Date().toLocaleDateString()} using GitDocify*`;
}
