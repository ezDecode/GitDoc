// This script will modify your Prisma schema to use SQLite instead of PostgreSQL for development
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

const schemaPath = path.join(__dirname, "prisma", "schema.prisma");

function convertToSqlite() {
  console.log("Converting Prisma schema to use SQLite...");

  try {
    // Read the current schema
    let schema = fs.readFileSync(schemaPath, "utf-8");

    // Replace the PostgreSQL provider with SQLite
    schema = schema.replace(
      /provider = "postgresql"\n\s*url\s*= env\("DATABASE_URL"\)/,
      'provider = "sqlite"\n  url      = "file:./dev.db"'
    );

    // Write the modified schema back to the file
    fs.writeFileSync(schemaPath, schema);

    // Update environment file to include the new DATABASE_URL
    const envPath = path.join(__dirname, ".env.local");
    let envContent = fs.readFileSync(envPath, "utf-8");

    if (envContent.includes("DATABASE_URL=")) {
      // Replace existing DATABASE_URL with SQLite
      envContent = envContent.replace(
        /DATABASE_URL=.*/,
        'DATABASE_URL="file:../prisma/dev.db"'
      );
    } else {
      // Add SQLite DATABASE_URL
      envContent += '\nDATABASE_URL="file:../prisma/dev.db"';
    }

    fs.writeFileSync(envPath, envContent);

    console.log("✅ Successfully converted Prisma schema to use SQLite!");
    console.log("\nNext steps:");
    console.log("1. Run: npx prisma generate");
    console.log("2. Run: npx prisma db push");
    console.log("3. Restart your application");

    return true;
  } catch (error) {
    console.error("❌ Failed to convert schema:", error);
    return false;
  }
}

convertToSqlite();
