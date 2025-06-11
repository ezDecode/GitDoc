// Production-ready middleware for GitDocify
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Add security headers
    const response = NextResponse.next();

    // Security headers for production
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("X-XSS-Protection", "1; mode=block");

    // CSP for added security
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://api.github.com https://generativelanguage.googleapis.com",
    ].join("; ");

    response.headers.set("Content-Security-Policy", csp);

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        if (req.nextUrl.pathname.startsWith("/api/auth")) return true;
        if (req.nextUrl.pathname === "/") return true;
        if (req.nextUrl.pathname.startsWith("/auth")) return true;

        // Require authentication for API routes and dashboard
        if (req.nextUrl.pathname.startsWith("/api/documents")) return !!token;
        if (req.nextUrl.pathname.startsWith("/api/github")) return !!token;
        if (req.nextUrl.pathname.startsWith("/dashboard")) return !!token;
        if (req.nextUrl.pathname.startsWith("/generate")) return !!token;

        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*", "/generate/:path*"],
};
