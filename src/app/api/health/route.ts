// Health check endpoint for GitDocify
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;

    // Check environment variables
    const requiredEnvVars = [
      "NEXTAUTH_SECRET",
      "GITHUB_CLIENT_ID",
      "GITHUB_CLIENT_SECRET",
      "GEMINI_API_KEY",
    ];

    const missingEnvVars = requiredEnvVars.filter(
      (envVar) => !process.env[envVar]
    );

    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || "unknown",
      checks: {
        database: "connected",
        environment:
          missingEnvVars.length === 0 ? "configured" : "missing_variables",
        missingEnvVars: missingEnvVars.length > 0 ? missingEnvVars : undefined,
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };

    if (missingEnvVars.length > 0) {
      healthStatus.status = "degraded";
    }

    const statusCode = healthStatus.status === "healthy" ? 200 : 503;

    return NextResponse.json(healthStatus, { status: statusCode });
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        checks: {
          database: "disconnected",
          environment: "unknown",
        },
      },
      { status: 503 }
    );
  }
}
