/**
 * Utility functions for generating AI prompts for documentation
 */

/**
 * Generates a detailed prompt for creating technical documentation from code
 * @param code - The source code to document
 * @param fileType - The programming language or file type (e.g., 'typescript', 'javascript', 'python')
 * @param fileName - Optional filename for context
 * @returns A formatted prompt string for AI documentation generation
 */
export function generateDetailedPrompt(
  code: string,
  fileType: string,
  fileName?: string
): string {
  return `
You're a professional technical writer and software engineer.

Generate detailed, production-grade documentation in **Markdown** for the following ${fileType} code${
    fileName ? ` in the file ${fileName}` : ""
  }. Follow these strict formatting rules:

---

## 1. Overview
- Start with a clear summary of what this file/module does.
- Explain its role within a typical project.

## 2. Exported Functions/Classes
For each export:
- **Name**
- **Description**
- **Parameters:** list in a Markdown table with name, type, and description
- **Return Value:** what it returns and when
- **Edge Cases:** any special scenarios it handles

## 3. Usage Example(s)
Provide at least one copy-paste-ready example wrapped in triple backticks.

## 4. Notes
- Include performance tips, limitations, or design decisions if relevant.

## 5. Visual Formatting
- Use **headings**, bullet points, and tables
- Syntax-highlighted code blocks

---

Code:
\`\`\`${fileType}
${code}
\`\`\`
`;
}

/**
 * Generates a prompt for creating API documentation
 * @param apiCode - The API route or endpoint code
 * @param method - HTTP method (GET, POST, etc.)
 * @param endpoint - The API endpoint path
 * @returns A formatted prompt for API documentation
 */
export function generateApiDocPrompt(
  apiCode: string,
  method: string,
  endpoint: string
): string {
  return `
Generate comprehensive API documentation for this ${method} endpoint: ${endpoint}

Include:
- **Endpoint:** ${method} ${endpoint}
- **Description:** What this endpoint does
- **Parameters:** Query params, path params, body schema
- **Response:** Success and error response formats
- **Examples:** Request and response examples
- **Authentication:** Required auth if any
- **Rate Limits:** If applicable

Code:
\`\`\`typescript
${apiCode}
\`\`\`
`;
}

/**
 * Generates a prompt for creating component documentation
 * @param componentCode - React component code
 * @param componentName - Name of the component
 * @returns A formatted prompt for component documentation
 */
export function generateComponentDocPrompt(
  componentCode: string,
  componentName: string
): string {
  return `
Generate React component documentation for ${componentName}.

Include:
- **Component Name:** ${componentName}
- **Purpose:** What this component does
- **Props:** All props with types and descriptions in a table
- **Usage Examples:** How to use the component
- **Styling:** CSS classes or styling notes
- **Dependencies:** What it depends on
- **Accessibility:** A11y considerations if any

Code:
\`\`\`tsx
${componentCode}
\`\`\`
`;
}
