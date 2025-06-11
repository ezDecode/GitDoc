// Simple test to verify dashboard component can be imported
const fs = require("fs");
const path = require("path");

const dashboardPath = path.join(
  __dirname,
  "src",
  "app",
  "dashboard",
  "page.tsx"
);
const content = fs.readFileSync(dashboardPath, "utf8");

// Check for export default
if (content.includes("export default function Dashboard()")) {
  console.log("✅ Dashboard component has proper default export");
} else {
  console.log("❌ Dashboard component missing proper default export");
}

// Check for proper closing
const lines = content.split("\n");
const lastLine = lines[lines.length - 1].trim();
const secondLastLine = lines[lines.length - 2].trim();

console.log("Last two lines:");
console.log("Line", lines.length - 1, ":", JSON.stringify(secondLastLine));
console.log("Line", lines.length, ":", JSON.stringify(lastLine));

if (secondLastLine === ");" && lastLine === "}") {
  console.log("✅ Component properly closed");
} else {
  console.log("❌ Component not properly closed");
}
