import { PrismaClient } from "@prisma/client";

// This is the standard way to instantiate Prisma Client in a Next.js app.
// It prevents creating too many connections in a serverless environment.

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create Prisma Client with safe configuration
const createPrismaClient = () => {
  try {
    return new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
      // Explicitly set errorFormat to avoid constructor issues
      errorFormat: "pretty",
    });
  } catch (error) {
    console.error("Failed to create Prisma client:", error);
    // Fallback configuration
    return new PrismaClient({
      log: ["error"],
    });
  }
};

export const prisma = global.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
