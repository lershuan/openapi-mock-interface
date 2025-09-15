import OpenAPIMockInterface from "./src/index.js";

async function startCustomServer() {
  try {
    console.log("🚀 Starting Custom OpenAPI Mock Server...\n");

    // Create interface with custom configuration
    const mockInterface = new OpenAPIMockInterface({
      server: {
        port: 8080, // Custom port
        host: "localhost",
      },
    });

    // Example: Load from a real OpenAPI URL
    console.log("Loading OpenAPI specification...");

    // You can change this URL to any OpenAPI spec you want to mock
    const openApiUrl = "https://petstore3.swagger.io/api/v3/openapi.json";

    try {
      await mockInterface.loadFromUrl(openApiUrl);
      console.log("✅ Successfully loaded from URL");
    } catch (error) {
      console.log("❌ Failed to load from URL, using local example...");

      // Fallback to local example
      const localSpec = {
        openapi: "3.0.0",
        info: {
          title: "My Custom API",
          version: "1.0.0",
          description: "A custom API for testing",
        },
        servers: [
          {
            url: "http://localhost:8080",
            description: "Local development server",
          },
        ],
        paths: {
          "/api/hello": {
            get: {
              operationId: "sayHello",
              summary: "Say hello",
              responses: {
                200: {
                  description: "Hello message",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          message: { type: "string", example: "Hello World!" },
                          timestamp: { type: "string", format: "date-time" },
                          status: { type: "string", example: "success" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "/api/users": {
            get: {
              operationId: "getUsers",
              summary: "Get all users",
              responses: {
                200: {
                  description: "List of users",
                  content: {
                    "application/json": {
                      schema: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "integer", example: 1 },
                            name: { type: "string", example: "John Doe" },
                            email: {
                              type: "string",
                              format: "email",
                              example: "john@example.com",
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      await mockInterface.loadFromObject(localSpec);
      console.log("✅ Successfully loaded local specification");
    }

    // Show server info
    const metadata = mockInterface.getSpecMetadata();
    console.log("\n📋 Server Information:");
    console.log(`Title: ${metadata.title}`);
    console.log(`Version: ${metadata.version}`);
    console.log(`Endpoints: ${metadata.pathCount}`);

    // Start the server
    console.log("\n🚀 Starting mock server...");
    const serverInfo = await mockInterface.startMockServer();

    console.log("\n🎉 Mock server is running!");
    console.log(`📍 Server URL: ${serverInfo.url}`);
    console.log("\n🔗 Available endpoints:");

    const endpoints = mockInterface.getEndpoints();
    endpoints.forEach((ep) => {
      console.log(`  ${ep.method} ${ep.path} - ${ep.summary}`);
    });

    console.log("\n📖 Utility endpoints:");
    console.log(`  GET  ${serverInfo.url}/health - Health check`);
    console.log(`  GET  ${serverInfo.url}/spec/info - API information`);
    console.log(`  GET  ${serverInfo.url}/spec/endpoints - All endpoints`);

    console.log("\n✨ Try these example requests:");
    console.log(`  curl ${serverInfo.url}/api/hello`);
    console.log(`  curl ${serverInfo.url}/api/users`);
    console.log(`  curl ${serverInfo.url}/health`);

    console.log("\nPress Ctrl+C to stop the server...");
  } catch (error) {
    console.error("❌ Error starting server:", error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n\n🛑 Shutting down server...");
  process.exit(0);
});

// Start the server
startCustomServer();
