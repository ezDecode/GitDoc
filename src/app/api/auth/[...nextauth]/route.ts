import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// Ensure all required environment variables are available
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error("Missing required environment variables for Google OAuth");
}

console.log("Environment variables check:");
console.log(
  "GITHUB_CLIENT_ID:",
  process.env.GITHUB_CLIENT_ID ? "Set" : "Missing"
);
console.log(
  "GITHUB_CLIENT_SECRET:",
  process.env.GITHUB_CLIENT_SECRET ? "Set" : "Missing"
);

if (!process.env.NEXTAUTH_SECRET) {
  console.error("Missing NEXTAUTH_SECRET environment variable");
}

export const authOptions: NextAuthOptions = {
  // Enable PrismaAdapter for database persistence
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
      httpOptions: {
        timeout: 40000,
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Add timestamp to prevent caching issues
      const timestamp = `t=${Date.now()}`;

      // Allow relative callback URLs
      if (url.startsWith("/")) {
        const hasParams = url.includes("?");
        return `${baseUrl}${url}${hasParams ? "&" : "?"}${timestamp}`;
      }
      // Allow same-origin URLs
      if (url.startsWith(baseUrl)) {
        const hasParams = url.includes("?");
        return `${url}${hasParams ? "&" : "?"}${timestamp}`;
      }
      // Default to dashboard with timestamp
      return `${baseUrl}/dashboard?${timestamp}`;
    },
    async session({ session, token }) {
      // Add user info to session
      if (token && session.user) {
        session.user.id = token.sub || "";
        // Explicitly add provider and token information to session
        if (token.accessToken) {
          (session as any).accessToken = token.accessToken;
        }
        if (token.provider) {
          (session as any).provider = token.provider;
        }
      }
      return session;
    },
    async jwt({ token, account, user }) {
      // Save the access token for API access
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
        // Store additional GitHub-specific information if available
        if (account.provider === "github" && account.access_token) {
          token.githubToken = account.access_token;
        }
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
