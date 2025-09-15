import OpenAPIMockInterface from "./src/index.js";
import fs from "fs";
import path from "path";

async function loadYAMLAPI(yamlFilePath) {
  try {
    console.log(
      `🚀 Loading OpenAPI specification from YAML file: ${yamlFilePath}\n`
    );

    // Check if file exists
    if (!fs.existsSync(yamlFilePath)) {
      throw new Error(`File not found: ${yamlFilePath}`);
    }

    // Check if it's a YAML file
    const ext = path.extname(yamlFilePath).toLowerCase();
    if (![".yaml", ".yml"].includes(ext)) {
      throw new Error(`File must be a YAML file (.yaml or .yml), got: ${ext}`);
    }

    // Create interface
    const mockInterface = new OpenAPIMockInterface({
      server: {
        port: 8000, // Default port
        host: "localhost",
      },
    });

    // Load the YAML file
    console.log("Loading YAML file...");
    await mockInterface.loadFromFile(yamlFilePath);
    console.log("✅ YAML file loaded successfully");

    // Show API information
    const metadata = mockInterface.getSpecMetadata();
    console.log("\n📋 API Information:");
    console.log(`Title: ${metadata.title}`);
    console.log(`Version: ${metadata.version}`);
    console.log(`Description: ${metadata.description}`);
    console.log(`OpenAPI Version: ${metadata.openapiVersion}`);
    console.log(`Endpoints: ${metadata.pathCount}`);
    console.log(`Has Components: ${metadata.hasComponents}`);
    console.log(`Has Security: ${metadata.hasSecurity}`);

    // Show servers
    if (metadata.servers && metadata.servers.length > 0) {
      console.log("\n🌐 Servers:");
      metadata.servers.forEach((server, index) => {
        console.log(
          `  ${index + 1}. ${server.url} - ${
            server.description || "No description"
          }`
        );
      });
    }

    // Show endpoints
    const endpoints = mockInterface.getEndpoints();
    console.log("\n🔗 Available endpoints:");
    endpoints.forEach((ep, index) => {
      console.log(
        `  ${index + 1}. ${ep.method} ${ep.path} - ${
          ep.summary || ep.operationId || "No summary"
        }`
      );
      if (ep.tags && ep.tags.length > 0) {
        console.log(`     Tags: ${ep.tags.join(", ")}`);
      }
    });

    // Show schemas
    const schemas = mockInterface.getSchemas();
    if (Object.keys(schemas).length > 0) {
      console.log("\n📊 Available schemas:");
      Object.keys(schemas).forEach((schemaName, index) => {
        console.log(`  ${index + 1}. ${schemaName}`);
      });
    }

    // Show security schemes
    const securitySchemes = mockInterface.getSecuritySchemes();
    if (Object.keys(securitySchemes).length > 0) {
      console.log("\n🔐 Security schemes:");
      Object.keys(securitySchemes).forEach((schemeName, index) => {
        console.log(`  ${index + 1}. ${schemeName}`);
      });
    }

    // Start the server
    console.log("\n🚀 Starting mock server...");
    const serverInfo = await mockInterface.startMockServer();

    console.log("\n🎉 Your API is now running!");
    console.log(`📍 Server URL: ${serverInfo.url}`);
    console.log(`📋 Health check: ${serverInfo.url}/health`);
    console.log(`📖 API info: ${serverInfo.url}/spec/info`);
    console.log(`🔗 All endpoints: ${serverInfo.url}/spec/endpoints`);

    console.log("\n✨ Test your API:");
    console.log(`  curl ${serverInfo.url}/health`);
    console.log(`  curl ${serverInfo.url}/spec/info`);

    // Show some example endpoints to test
    if (endpoints.length > 0) {
      console.log("\n📝 Example API calls:");
      endpoints.slice(0, 3).forEach((ep) => {
        console.log(`  curl ${serverInfo.url}${ep.path}`);
      });
    }

    console.log("\nPress Ctrl+C to stop the server...");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n\n🛑 Shutting down server...");
  process.exit(0);
});

// Get YAML file path from command line arguments
const yamlFilePath = process.argv[2];

if (!yamlFilePath) {
  console.log("Usage: node load-yaml-api.js <path-to-yaml-file>");
  console.log("\nExamples:");
  console.log("  node load-yaml-api.js my-api.yaml");
  console.log("  node load-yaml-api.js /path/to/your/api.yml");
  console.log("  node load-yaml-api.js ./specs/petstore.yaml");
  process.exit(1);
}

// Start loading the YAML API
loadYAMLAPI(yamlFilePath);
