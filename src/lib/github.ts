// Production-ready GitHub API client with comprehensive error handling
import { Octokit } from "octokit";

// Rate limit handling
const RATE_LIMIT_DELAY = 1000; // 1 second delay between requests
let lastRequestTime = 0;

async function rateLimitedRequest<T>(fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise((resolve) =>
      setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest)
    );
  }

  lastRequestTime = Date.now();
  return fn();
}

export async function getFileContent(
  accessToken: string,
  owner: string,
  repo: string,
  path: string,
  branch: string = "main"
): Promise<{ content: string; sha: string }> {
  if (!accessToken || !owner || !repo || !path) {
    throw new Error("Missing required parameters for GitHub API request");
  }

  try {
    return await rateLimitedRequest(async () => {
      const octokit = new Octokit({ auth: accessToken });

      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref: branch,
      });

      if (Array.isArray(data)) {
        throw new Error(`Path '${path}' is a directory, not a file`);
      }

      if (data.type !== "file") {
        throw new Error(`Path '${path}' is not a file`);
      }

      if (!data.content) {
        throw new Error(`File '${path}' has no content`);
      }

      // GitHub API returns content as base64 encoded
      const content = Buffer.from(data.content, "base64").toString("utf-8");
      return { content, sha: data.sha };
    });
  } catch (error: any) {
    console.error(
      `Error fetching file content for ${owner}/${repo}/${path}:`,
      error
    );

    if (error.status === 404) {
      throw new Error(
        `File '${path}' not found in repository '${owner}/${repo}'`
      );
    } else if (error.status === 403) {
      throw new Error(
        "Access denied. Check repository permissions and access token."
      );
    } else if (error.status === 401) {
      throw new Error("Unauthorized. Invalid or expired access token.");
    } else {
      throw new Error(`GitHub API error: ${error.message || "Unknown error"}`);
    }
  }
}

export async function updateFile(
  accessToken: string,
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  sha?: string,
  branch: string = "main"
): Promise<{ commit: any }> {
  if (!accessToken || !owner || !repo || !path || !content || !message) {
    throw new Error("Missing required parameters for file update");
  }

  try {
    return await rateLimitedRequest(async () => {
      const octokit = new Octokit({ auth: accessToken });

      const payload: any = {
        message,
        content: Buffer.from(content, "utf-8").toString("base64"),
        branch,
      };

      if (sha) {
        payload.sha = sha;
      }

      const { data } = await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        ...payload,
      });

      return { commit: data.commit };
    });
  } catch (error: any) {
    console.error(`Error updating file ${owner}/${repo}/${path}:`, error);

    if (error.status === 404) {
      throw new Error(`Repository '${owner}/${repo}' not found`);
    } else if (error.status === 403) {
      throw new Error("Access denied. Check repository permissions.");
    } else if (error.status === 409) {
      throw new Error(
        "Conflict: File has been modified. Please refresh and try again."
      );
    } else {
      throw new Error(
        `Failed to update file: ${error.message || "Unknown error"}`
      );
    }
  }
}

/**
 * Fetches the recursive file tree for a given repository.
 */
export async function getRepoTree(
  accessToken: string,
  owner: string,
  repo: string,
  branch: string = "main"
): Promise<string[]> {
  if (!accessToken || !owner || !repo) {
    throw new Error("Missing required parameters for repository tree request");
  }

  try {
    return await rateLimitedRequest(async () => {
      const octokit = new Octokit({ auth: accessToken });

      // Get the repository's default branch if needed
      let refBranch = branch;
      try {
        await octokit.rest.git.getRef({
          owner,
          repo,
          ref: `heads/${branch}`,
        });
      } catch (error: any) {
        if (error.status === 404) {
          // Try to get repository info to find default branch
          try {
            const { data: repoData } = await octokit.rest.repos.get({
              owner,
              repo,
            });
            refBranch = repoData.default_branch;
          } catch {
            refBranch = "main"; // Fallback
          }
        }
      }

      const { data: treeData } = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: refBranch,
        recursive: "true",
      });

      // Filter only files (not directories) and return their paths
      return treeData.tree
        .filter((item) => item.type === "blob")
        .map((item) => item.path!)
        .filter((path) => path); // Remove any undefined paths
    });
  } catch (error: any) {
    console.error(
      `Error fetching repository tree for ${owner}/${repo}:`,
      error
    );

    if (error.status === 404) {
      throw new Error(`Repository '${owner}/${repo}' not found`);
    } else if (error.status === 403) {
      throw new Error("Access denied. Check repository permissions.");
    } else {
      throw new Error(
        `Failed to fetch repository tree: ${error.message || "Unknown error"}`
      );
    }
  }
}

/**
 * Get repository file content by path with multiple encoding support
 */
export async function getRepoFileContent(
  accessToken: string,
  owner: string,
  repo: string,
  path: string,
  branch: string = "main"
): Promise<string> {
  const { content } = await getFileContent(
    accessToken,
    owner,
    repo,
    path,
    branch
  );
  return content;
}

/**
 * Get basic repository information
 */
export async function getRepositoryInfo(
  accessToken: string,
  owner: string,
  repo: string
): Promise<{
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  defaultBranch: string;
}> {
  if (!accessToken || !owner || !repo) {
    throw new Error("Missing required parameters for repository info request");
  }

  try {
    return await rateLimitedRequest(async () => {
      const octokit = new Octokit({ auth: accessToken });

      const { data } = await octokit.rest.repos.get({ owner, repo });

      return {
        name: data.name,
        description: data.description || "",
        language: data.language || "Unknown",
        stars: data.stargazers_count,
        forks: data.forks_count,
        defaultBranch: data.default_branch,
      };
    });
  } catch (error: any) {
    console.error(
      `Error fetching repository info for ${owner}/${repo}:`,
      error
    );

    if (error.status === 404) {
      throw new Error(`Repository '${owner}/${repo}' not found`);
    } else if (error.status === 403) {
      throw new Error("Access denied. Check repository permissions.");
    } else {
      throw new Error(
        `Failed to fetch repository info: ${error.message || "Unknown error"}`
      );
    }
  }
}
