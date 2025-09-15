import OpenAPIMockInterface from "../src/index.js";

/**
 * Basic usage example of OpenAPI Mock Interface
 */
async function basicExample() {
  try {
    // Create interface instance
    const mockInterface = new OpenAPIMockInterface({
      fetcher: {
        timeout: 10000,
        headers: {
          "User-Agent": "OpenAPI-Mock-Interface/1.0.0",
        },
      },
      server: {
        port: 3000,
        host: "localhost",
      },
    });

    console.log("🚀 OpenAPI Mock Interface - Basic Usage Example\n");

    // Example 1: Load from URL
    console.log("1. Loading OpenAPI specification from URL...");
    const petstoreUrl = "https://petstore3.swagger.io/api/v3/openapi.json";

    try {
      await mockInterface.loadFromUrl(petstoreUrl);
      console.log("✅ Successfully loaded specification from URL");
    } catch (error) {
      console.log("❌ Failed to load from URL:", error.message);
      console.log("Using local example instead...\n");

      // Fallback to local example
      const localSpec = {
        openapi: "3.0.0",
        info: {
          title: "Example API",
          version: "1.0.0",
          description: "A simple example API",
        },
        servers: [
          {
            url: "http://localhost:3000",
            description: "Development server",
          },
        ],
        paths: {
          "/users": {
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
                          $ref: "#/components/schemas/User",
                        },
                      },
                    },
                  },
                },
              },
            },
            post: {
              operationId: "createUser",
              summary: "Create a new user",
              requestBody: {
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
              responses: {
                201: {
                  description: "User created",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/components/schemas/User",
                      },
                    },
                  },
                },
              },
            },
          },
          "/users/{id}": {
            get: {
              operationId: "getUserById",
              summary: "Get user by ID",
              parameters: [
                {
                  name: "id",
                  in: "path",
                  required: true,
                  schema: {
                    type: "integer",
                  },
                },
              ],
              responses: {
                200: {
                  description: "User found",
                  content: {
                    "application/json": {
                      schema: {
                        $ref: "#/components/schemas/User",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            User: {
              type: "object",
              properties: {
                id: {
                  type: "integer",
                  example: 1,
                },
                name: {
                  type: "string",
                  example: "John Doe",
                },
                email: {
                  type: "string",
                  format: "email",
                  example: "john@example.com",
                },
                age: {
                  type: "integer",
                  minimum: 0,
                  maximum: 120,
                  example: 30,
                },
                isActive: {
                  type: "boolean",
                  example: true,
                },
              },
              required: ["id", "name", "email"],
            },
          },
        },
      };

      await mockInterface.loadFromObject(localSpec);
      console.log("✅ Successfully loaded local specification");
    }

    // Get specification metadata
    console.log("\n2. Specification metadata:");
    const metadata = mockInterface.getSpecMetadata();
    console.log(JSON.stringify(metadata, null, 2));

    // Get endpoints
    console.log("\n3. Available endpoints:");
    const endpoints = mockInterface.getEndpoints();
    endpoints.forEach((endpoint) => {
      console.log(
        `  ${endpoint.method} ${endpoint.path} - ${
          endpoint.summary || endpoint.operationId
        }`
      );
    });

    // Get schemas
    console.log("\n4. Available schemas:");
    const schemas = mockInterface.getSchemas();
    console.log("Schema names:", Object.keys(schemas));

    // Generate mock data
    console.log("\n5. Generating mock data:");
    try {
      const mockUser = mockInterface.generateMockData("User");
      console.log("Mock User data:", JSON.stringify(mockUser, null, 2));
    } catch (error) {
      console.log("Could not generate mock data:", error.message);
    }

    // Start mock server
    console.log("\n6. Starting mock server...");
    const serverInfo = await mockInterface.startMockServer();
    console.log("Server info:", serverInfo);

    console.log("\n🎉 Mock server is running!");
    console.log("Try these endpoints:");
    console.log("  GET  http://localhost:3000/users");
    console.log("  POST http://localhost:3000/users");
    console.log("  GET  http://localhost:3000/users/1");
    console.log("  GET  http://localhost:3000/health");
    console.log("  GET  http://localhost:3000/spec/info");

    // Keep server running for demonstration
    console.log("\nPress Ctrl+C to stop the server...");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n\n🛑 Shutting down...");
  process.exit(0);
});

// Run the example
basicExample();
