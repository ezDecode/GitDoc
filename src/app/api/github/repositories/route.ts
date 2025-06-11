import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Octokit } from "octokit";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is authenticated with GitHub and has access token
    const accessToken = (session as any).accessToken;
    const provider = (session as any).provider;

    if (provider === "github" && accessToken) {
      try {
        // Use real GitHub API with user's access token
        const octokit = new Octokit({
          auth: accessToken,
        });

        const { data: repositories } =
          await octokit.rest.repos.listForAuthenticatedUser({
            sort: "updated",
            per_page: 50,
            visibility: "all",
          });

        // Transform the data to match our interface
        const transformedRepos = repositories.map((repo) => ({
          id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          private: repo.private,
          html_url: repo.html_url,
          language: repo.language,
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          updated_at: repo.updated_at,
          topics: repo.topics || [],
        }));

        return NextResponse.json({ repositories: transformedRepos });
      } catch (error) {
        console.error("GitHub API error:", error);
        return NextResponse.json(
          { error: "Failed to fetch repositories from GitHub" },
          { status: 500 }
        );
      }
    } // Fallback to mock data for non-GitHub authentication or missing access token
    const mockRepositories = [
      {
        id: 1,
        name: "react-dashboard",
        full_name: "user/react-dashboard",
        description:
          "A modern React dashboard with TypeScript and Tailwind CSS",
        private: false,
        html_url: "https://github.com/user/react-dashboard",
        language: "TypeScript",
        stargazers_count: 145,
        forks_count: 23,
        updated_at: "2024-12-01T10:30:00Z",
        topics: ["react", "typescript", "tailwindcss", "dashboard"],
      },
      {
        id: 2,
        name: "node-api",
        full_name: "user/node-api",
        description: "RESTful API built with Node.js and Express",
        private: true,
        html_url: "https://github.com/user/node-api",
        language: "JavaScript",
        stargazers_count: 67,
        forks_count: 12,
        updated_at: "2024-11-28T15:45:00Z",
        topics: ["nodejs", "express", "api", "rest"],
      },
      {
        id: 3,
        name: "python-ml-toolkit",
        full_name: "user/python-ml-toolkit",
        description: "Machine learning utilities and models in Python",
        private: false,
        html_url: "https://github.com/user/python-ml-toolkit",
        language: "Python",
        stargazers_count: 289,
        forks_count: 45,
        updated_at: "2024-12-05T09:15:00Z",
        topics: ["python", "machine-learning", "data-science", "ai"],
      },
      {
        id: 4,
        name: "vue-components",
        full_name: "user/vue-components",
        description: "Reusable Vue.js components library",
        private: false,
        html_url: "https://github.com/user/vue-components",
        language: "Vue",
        stargazers_count: 92,
        forks_count: 18,
        updated_at: "2024-11-30T14:20:00Z",
        topics: ["vue", "components", "ui", "library"],
      },
      {
        id: 5,
        name: "gitdocify-clone",
        full_name: "user/gitdocify-clone",
        description:
          "AI-powered documentation generator for GitHub repositories",
        private: false,
        html_url: "https://github.com/user/gitdocify-clone",
        language: "TypeScript",
        stargazers_count: 1200,
        forks_count: 87,
        updated_at: "2024-12-07T16:00:00Z",
        topics: ["nextjs", "ai", "documentation", "github-api", "gemini"],
      },
    ];

    return NextResponse.json({ repositories: mockRepositories });
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return NextResponse.json(
      { error: "Failed to fetch repositories" },
      { status: 500 }
    );
  }
}

// Future implementation with real GitHub API
async function fetchGitHubRepositories(accessToken: string) {
  const octokit = new Octokit({
    auth: accessToken,
  });

  try {
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 100,
    });

    return data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      private: repo.private,
      html_url: repo.html_url,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      updated_at: repo.updated_at,
      topics: repo.topics || [],
    }));
  } catch (error) {
    console.error("GitHub API error:", error);
    throw error;
  }
}
