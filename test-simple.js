import OpenAPIMockInterface from "./src/index.js";

async function test() {
  try {
    console.log("Testing OpenAPI Mock Interface...\n");

    // Create interface
    const mockInterface = new OpenAPIMockInterface({
      server: { port: 3002 },
    });

    // Test with a simple local specification
    const simpleSpec = {
      openapi: "3.0.0",
      info: {
        title: "Test API",
        version: "1.0.0",
        description: "A simple test API",
      },
      paths: {
        "/test": {
          get: {
            operationId: "getTest",
            summary: "Get test data",
            responses: {
              200: {
                description: "Success",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        message: { type: "string", example: "Hello World" },
                        timestamp: { type: "string", format: "date-time" },
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

    // Load specification
    console.log("1. Loading specification...");
    await mockInterface.loadFromObject(simpleSpec);
    console.log("✅ Specification loaded");

    // Get metadata
    console.log("\n2. Getting metadata...");
    const metadata = mockInterface.getSpecMetadata();
    console.log("Metadata:", JSON.stringify(metadata, null, 2));

    // Get endpoints
    console.log("\n3. Getting endpoints...");
    const endpoints = mockInterface.getEndpoints();
    console.log(
      "Endpoints:",
      endpoints.map((ep) => `${ep.method} ${ep.path}`)
    );

    // Start server
    console.log("\n4. Starting mock server...");
    await mockInterface.startMockServer();
    console.log("✅ Mock server started");

    // Test the endpoint
    console.log("\n5. Testing endpoint...");
    const response = await fetch("http://localhost:3002/test");
    const data = await response.json();
    console.log("Response:", data);

    // Stop server
    console.log("\n6. Stopping server...");
    await mockInterface.stopMockServer();
    console.log("✅ Server stopped");

    console.log("\n🎉 All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

test();
