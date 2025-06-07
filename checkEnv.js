"use strict";

// Check for required environment variables and provide helpful messages
const checkEnv = () => {
  const missingVars = [];

  // Essential NextAuth environment variables
  if (!process.env.NEXTAUTH_URL) missingVars.push("NEXTAUTH_URL");
  if (!process.env.NEXTAUTH_SECRET) missingVars.push("NEXTAUTH_SECRET");

  // Google OAuth credentials
  if (!process.env.GOOGLE_CLIENT_ID) missingVars.push("GOOGLE_CLIENT_ID");
  if (!process.env.GOOGLE_CLIENT_SECRET)
    missingVars.push("GOOGLE_CLIENT_SECRET");

  // Database connection
  if (!process.env.DATABASE_URL) missingVars.push("DATABASE_URL");

  // Gemini API key
  if (!process.env.GEMINI_API_KEY) missingVars.push("GEMINI_API_KEY");

  if (missingVars.length > 0) {
    console.error("\x1b[31m%s\x1b[0m", "⚠️ Missing environment variables:");
    for (const variable of missingVars) {
      console.error(`  - ${variable}`);
    }
    console.error(
      "\x1b[31m%s\x1b[0m",
      "Please ensure these are properly set in your .env.local file."
    );
    console.error(
      "\x1b[33m%s\x1b[0m",
      "You can run `node checkEnv.js --help` for more information."
    );

    if (process.argv.includes("--help")) {
      console.log("\n\x1b[36m%s\x1b[0m", "Environment Variables Information:");
      console.log("\x1b[36m%s\x1b[0m", "--------------------------------");
      console.log(
        "\x1b[36m%s\x1b[0m",
        "NEXTAUTH_URL: The URL of your site (e.g., http://localhost:3000)"
      );
      console.log(
        "\x1b[36m%s\x1b[0m",
        "NEXTAUTH_SECRET: A random string used to hash tokens (generate with `openssl rand -base64 32`)"
      );
      console.log(
        "\x1b[36m%s\x1b[0m",
        "GOOGLE_CLIENT_ID: OAuth client ID from Google Cloud Console"
      );
      console.log(
        "\x1b[36m%s\x1b[0m",
        "GOOGLE_CLIENT_SECRET: OAuth client secret from Google Cloud Console"
      );
      console.log(
        "\x1b[36m%s\x1b[0m",
        "DATABASE_URL: Your PostgreSQL connection string"
      );
      console.log(
        "\x1b[36m%s\x1b[0m",
        "GEMINI_API_KEY: API key for Google Gemini"
      );

      console.log("\n\x1b[36m%s\x1b[0m", "Setup Instructions:");
      console.log("\x1b[36m%s\x1b[0m", "--------------------------------");
      console.log(
        "\x1b[36m%s\x1b[0m",
        "1. Create a .env.local file in your project root"
      );
      console.log(
        "\x1b[36m%s\x1b[0m",
        "2. Create a project in Google Cloud Console: https://console.cloud.google.com/"
      );
      console.log(
        "\x1b[36m%s\x1b[0m",
        "3. Enable the Google OAuth API and create credentials"
      );
      console.log(
        "\x1b[36m%s\x1b[0m",
        "4. Add authorized redirect URIs (e.g., http://localhost:3000/api/auth/callback/google)"
      );
      console.log(
        "\x1b[36m%s\x1b[0m",
        "5. Set up your database and update DATABASE_URL"
      );
      console.log(
        "\x1b[36m%s\x1b[0m",
        "6. Get a Gemini API key from https://makersuite.google.com/app/apikey"
      );
    }

    return false;
  }

  console.log(
    "\x1b[32m%s\x1b[0m",
    "✅ All required environment variables are present!"
  );
  return true;
};

// If this script is run directly
if (require.main === module) {
  checkEnv();
}

module.exports = { checkEnv };
