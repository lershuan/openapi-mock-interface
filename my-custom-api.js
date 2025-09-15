import OpenAPIMockInterface from "./src/index.js";

async function startMyCustomAPI() {
  try {
    console.log("🚀 Starting My Custom API with Mock Data...\n");

    // Create interface
    const mockInterface = new OpenAPIMockInterface({
      server: {
        port: 9000, // Custom port
        host: "localhost",
      },
    });

    // Define your custom API with mock data
    const myCustomAPI = {
      openapi: "3.0.0",
      info: {
        title: "My Custom API",
        version: "1.0.0",
        description: "A custom API with my own mock data",
      },
      servers: [
        {
          url: "http://localhost:9000",
          description: "My development server",
        },
      ],
      paths: {
        // Example 1: Simple endpoint with mock data
        "/api/products": {
          get: {
            operationId: "getProducts",
            summary: "Get all products",
            description: "Returns a list of products with mock data",
            responses: {
              200: {
                description: "List of products",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Product",
                      },
                    },
                    example: [
                      {
                        id: 1,
                        name: "iPhone 15",
                        price: 999.99,
                        category: "Electronics",
                        inStock: true,
                        tags: ["smartphone", "apple", "premium"],
                      },
                      {
                        id: 2,
                        name: "MacBook Pro",
                        price: 1999.99,
                        category: "Electronics",
                        inStock: true,
                        tags: ["laptop", "apple", "professional"],
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        // Example 2: Endpoint with path parameter
        "/api/products/{id}": {
          get: {
            operationId: "getProductById",
            summary: "Get product by ID",
            parameters: [
              {
                name: "id",
                in: "path",
                required: true,
                schema: { type: "integer" },
                description: "Product ID",
              },
            ],
            responses: {
              200: {
                description: "Product found",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/Product",
                    },
                    example: {
                      id: 1,
                      name: "iPhone 15",
                      price: 999.99,
                      category: "Electronics",
                      inStock: true,
                      description: "Latest iPhone with advanced features",
                      tags: ["smartphone", "apple", "premium"],
                      createdAt: "2023-09-15T10:30:00Z",
                    },
                  },
                },
              },
              404: {
                description: "Product not found",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        error: { type: "string" },
                        message: { type: "string" },
                      },
                    },
                    example: {
                      error: "Not Found",
                      message: "Product with ID 999 not found",
                    },
                  },
                },
              },
            },
          },
        },
        // Example 3: POST endpoint for creating data
        "/api/products": {
          post: {
            operationId: "createProduct",
            summary: "Create a new product",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/CreateProductRequest",
                  },
                  example: {
                    name: "New Product",
                    price: 299.99,
                    category: "Electronics",
                    description: "A great new product",
                  },
                },
              },
            },
            responses: {
              201: {
                description: "Product created successfully",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/Product",
                    },
                    example: {
                      id: 3,
                      name: "New Product",
                      price: 299.99,
                      category: "Electronics",
                      inStock: true,
                      description: "A great new product",
                      tags: ["new", "electronics"],
                      createdAt: "2023-09-15T10:30:00Z",
                    },
                  },
                },
              },
            },
          },
        },
        // Example 4: User management endpoints
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
                        $ref: "#/components/schemas/User",
                      },
                    },
                    example: [
                      {
                        id: 1,
                        name: "John Doe",
                        email: "john@example.com",
                        age: 30,
                        role: "admin",
                        isActive: true,
                        createdAt: "2023-01-15T10:30:00Z",
                      },
                      {
                        id: 2,
                        name: "Jane Smith",
                        email: "jane@example.com",
                        age: 25,
                        role: "user",
                        isActive: true,
                        createdAt: "2023-02-20T14:15:00Z",
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        // Example 5: Health check endpoint
        "/api/health": {
          get: {
            operationId: "healthCheck",
            summary: "Health check",
            responses: {
              200: {
                description: "Service is healthy",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        status: { type: "string" },
                        timestamp: { type: "string" },
                        version: { type: "string" },
                        uptime: { type: "number" },
                      },
                    },
                    example: {
                      status: "healthy",
                      timestamp: "2023-09-15T10:30:00Z",
                      version: "1.0.0",
                      uptime: 3600,
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
          Product: {
            type: "object",
            properties: {
              id: {
                type: "integer",
                example: 1,
                description: "Unique product identifier",
              },
              name: {
                type: "string",
                example: "iPhone 15",
                description: "Product name",
              },
              price: {
                type: "number",
                format: "decimal",
                example: 999.99,
                description: "Product price",
              },
              category: {
                type: "string",
                example: "Electronics",
                description: "Product category",
              },
              inStock: {
                type: "boolean",
                example: true,
                description: "Whether product is in stock",
              },
              description: {
                type: "string",
                example: "Latest iPhone with advanced features",
                description: "Product description",
              },
              tags: {
                type: "array",
                items: { type: "string" },
                example: ["smartphone", "apple", "premium"],
                description: "Product tags",
              },
              createdAt: {
                type: "string",
                format: "date-time",
                example: "2023-09-15T10:30:00Z",
                description: "Creation timestamp",
              },
            },
            required: ["id", "name", "price", "category"],
          },
          CreateProductRequest: {
            type: "object",
            properties: {
              name: {
                type: "string",
                example: "New Product",
                description: "Product name",
              },
              price: {
                type: "number",
                format: "decimal",
                example: 299.99,
                description: "Product price",
              },
              category: {
                type: "string",
                example: "Electronics",
                description: "Product category",
              },
              description: {
                type: "string",
                example: "A great new product",
                description: "Product description",
              },
            },
            required: ["name", "price", "category"],
          },
          User: {
            type: "object",
            properties: {
              id: {
                type: "integer",
                example: 1,
                description: "Unique user identifier",
              },
              name: {
                type: "string",
                example: "John Doe",
                description: "User's full name",
              },
              email: {
                type: "string",
                format: "email",
                example: "john@example.com",
                description: "User's email address",
              },
              age: {
                type: "integer",
                example: 30,
                description: "User's age",
              },
              role: {
                type: "string",
                enum: ["admin", "user", "moderator"],
                example: "admin",
                description: "User's role",
              },
              isActive: {
                type: "boolean",
                example: true,
                description: "Whether user is active",
              },
              createdAt: {
                type: "string",
                format: "date-time",
                example: "2023-01-15T10:30:00Z",
                description: "Account creation timestamp",
              },
            },
            required: ["id", "name", "email"],
          },
        },
      },
    };

    // Load the custom API
    console.log("Loading custom API specification...");
    await mockInterface.loadFromObject(myCustomAPI);
    console.log("✅ Custom API loaded successfully");

    // Show API information
    const metadata = mockInterface.getSpecMetadata();
    console.log("\n📋 API Information:");
    console.log(`Title: ${metadata.title}`);
    console.log(`Version: ${metadata.version}`);
    console.log(`Description: ${metadata.description}`);
    console.log(`Endpoints: ${metadata.pathCount}`);

    // Start the server
    console.log("\n🚀 Starting mock server...");
    const serverInfo = await mockInterface.startMockServer();

    console.log("\n🎉 Your Custom API is running!");
    console.log(`📍 Server URL: ${serverInfo.url}`);
    console.log("\n🔗 Available endpoints:");

    const endpoints = mockInterface.getEndpoints();
    endpoints.forEach((ep) => {
      console.log(`  ${ep.method} ${ep.path} - ${ep.summary}`);
    });

    console.log("\n📖 Utility endpoints:");
    console.log(`  GET  ${serverInfo.url}/health - Server health check`);
    console.log(`  GET  ${serverInfo.url}/api/health - API health check`);
    console.log(`  GET  ${serverInfo.url}/spec/info - API specification info`);
    console.log(`  GET  ${serverInfo.url}/spec/endpoints - All endpoints`);

    console.log("\n✨ Try these example requests:");
    console.log(`  curl ${serverInfo.url}/api/products`);
    console.log(`  curl ${serverInfo.url}/api/products/1`);
    console.log(`  curl ${serverInfo.url}/api/users`);
    console.log(`  curl ${serverInfo.url}/api/health`);
    console.log(`  curl ${serverInfo.url}/health`);

    console.log("\n📝 To test POST requests:");
    console.log(`  curl -X POST ${serverInfo.url}/api/products \\`);
    console.log(`    -H "Content-Type: application/json" \\`);
    console.log(
      `    -d '{"name":"Test Product","price":99.99,"category":"Test"}'`
    );

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
startMyCustomAPI();
