import OpenAPIMockInterface, {
  OpenAPISpecFetcher,
  OpenAPISpecParser,
} from "../src/index.js";

/**
 * Advanced usage example of OpenAPI Mock Interface
 * Demonstrates custom configuration, error handling, and advanced features
 */
async function advancedExample() {
  try {
    console.log("🚀 OpenAPI Mock Interface - Advanced Usage Example\n");

    // Example 1: Custom fetcher configuration
    console.log("1. Custom Fetcher Configuration:");
    const customFetcher = new OpenAPISpecFetcher({
      timeout: 15000,
      headers: {
        Authorization: "Bearer your-token-here",
        "User-Agent": "MyApp/1.0.0",
      },
      validateSSL: false, // For development/testing only
    });

    // Example 2: Custom parser with advanced options
    console.log("2. Custom Parser Configuration:");
    const customParser = new OpenAPISpecParser();

    // Example 3: Advanced mock interface configuration
    console.log("3. Advanced Mock Interface Configuration:");
    const mockInterface = new OpenAPIMockInterface({
      fetcher: {
        timeout: 20000,
        headers: {
          "X-Custom-Header": "custom-value",
        },
      },
      server: {
        port: 3001,
        host: "0.0.0.0", // Listen on all interfaces
      },
    });

    // Example 4: Load and validate specification with custom options
    console.log("4. Loading specification with custom validation:");

    // Create a more complex example specification
    const complexSpec = {
      openapi: "3.0.3",
      info: {
        title: "E-Commerce API",
        version: "2.1.0",
        description: "A comprehensive e-commerce API with advanced features",
        contact: {
          name: "API Support",
          email: "support@example.com",
        },
        license: {
          name: "MIT",
          url: "https://opensource.org/licenses/MIT",
        },
      },
      servers: [
        {
          url: "https://api.example.com/v2",
          description: "Production server",
        },
        {
          url: "https://staging-api.example.com/v2",
          description: "Staging server",
        },
      ],
      paths: {
        "/products": {
          get: {
            operationId: "getProducts",
            summary: "Get all products",
            description:
              "Retrieve a paginated list of products with filtering options",
            tags: ["Products"],
            parameters: [
              {
                name: "page",
                in: "query",
                description: "Page number",
                schema: { type: "integer", minimum: 1, default: 1 },
              },
              {
                name: "limit",
                in: "query",
                description: "Items per page",
                schema: {
                  type: "integer",
                  minimum: 1,
                  maximum: 100,
                  default: 20,
                },
              },
              {
                name: "category",
                in: "query",
                description: "Filter by category",
                schema: {
                  type: "string",
                  enum: ["electronics", "clothing", "books", "home"],
                },
              },
            ],
            responses: {
              200: {
                description: "Successful response",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/ProductList",
                    },
                  },
                },
              },
            },
          },
          post: {
            operationId: "createProduct",
            summary: "Create a new product",
            tags: ["Products"],
            security: [{ bearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/CreateProductRequest",
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
                  },
                },
              },
              400: {
                description: "Bad request",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/Error",
                    },
                  },
                },
              },
            },
          },
        },
        "/products/{id}": {
          get: {
            operationId: "getProductById",
            summary: "Get product by ID",
            tags: ["Products"],
            parameters: [
              {
                name: "id",
                in: "path",
                required: true,
                schema: { type: "string", format: "uuid" },
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
                  },
                },
              },
              404: {
                description: "Product not found",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/Error",
                    },
                  },
                },
              },
            },
          },
        },
        "/orders": {
          get: {
            operationId: "getOrders",
            summary: "Get user orders",
            tags: ["Orders"],
            security: [{ bearerAuth: [] }],
            responses: {
              200: {
                description: "User orders",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Order",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
        schemas: {
          Product: {
            type: "object",
            properties: {
              id: {
                type: "string",
                format: "uuid",
                example: "123e4567-e89b-12d3-a456-426614174000",
              },
              name: {
                type: "string",
                example: "Wireless Headphones",
              },
              description: {
                type: "string",
                example:
                  "High-quality wireless headphones with noise cancellation",
              },
              price: {
                type: "number",
                format: "decimal",
                minimum: 0,
                example: 199.99,
              },
              category: {
                type: "string",
                enum: ["electronics", "clothing", "books", "home"],
                example: "electronics",
              },
              inStock: {
                type: "boolean",
                example: true,
              },
              tags: {
                type: "array",
                items: {
                  type: "string",
                },
                example: ["wireless", "audio", "premium"],
              },
              createdAt: {
                type: "string",
                format: "date-time",
                example: "2023-01-15T10:30:00Z",
              },
            },
            required: ["id", "name", "price", "category"],
          },
          ProductList: {
            type: "object",
            properties: {
              products: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/Product",
                },
              },
              pagination: {
                $ref: "#/components/schemas/Pagination",
              },
            },
          },
          CreateProductRequest: {
            type: "object",
            properties: {
              name: {
                type: "string",
                minLength: 1,
                maxLength: 100,
              },
              description: {
                type: "string",
                maxLength: 500,
              },
              price: {
                type: "number",
                minimum: 0,
              },
              category: {
                type: "string",
                enum: ["electronics", "clothing", "books", "home"],
              },
              tags: {
                type: "array",
                items: {
                  type: "string",
                },
                maxItems: 10,
              },
            },
            required: ["name", "price", "category"],
          },
          Order: {
            type: "object",
            properties: {
              id: {
                type: "string",
                format: "uuid",
              },
              userId: {
                type: "string",
                format: "uuid",
              },
              products: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/OrderItem",
                },
              },
              total: {
                type: "number",
                format: "decimal",
              },
              status: {
                type: "string",
                enum: [
                  "pending",
                  "processing",
                  "shipped",
                  "delivered",
                  "cancelled",
                ],
                example: "pending",
              },
              createdAt: {
                type: "string",
                format: "date-time",
              },
            },
          },
          OrderItem: {
            type: "object",
            properties: {
              productId: {
                type: "string",
                format: "uuid",
              },
              quantity: {
                type: "integer",
                minimum: 1,
              },
              price: {
                type: "number",
                format: "decimal",
              },
            },
          },
          Pagination: {
            type: "object",
            properties: {
              page: {
                type: "integer",
                minimum: 1,
              },
              limit: {
                type: "integer",
                minimum: 1,
              },
              total: {
                type: "integer",
                minimum: 0,
              },
              pages: {
                type: "integer",
                minimum: 0,
              },
            },
          },
          Error: {
            type: "object",
            properties: {
              code: {
                type: "string",
              },
              message: {
                type: "string",
              },
              details: {
                type: "object",
              },
            },
            required: ["code", "message"],
          },
        },
      },
    };

    await mockInterface.loadFromObject(complexSpec);
    console.log("✅ Complex specification loaded successfully");

    // Example 5: Advanced analysis
    console.log("\n5. Advanced Analysis:");

    const metadata = mockInterface.getSpecMetadata();
    console.log("Specification metadata:", JSON.stringify(metadata, null, 2));

    const endpoints = mockInterface.getEndpoints();
    console.log(`\nFound ${endpoints.length} endpoints:`);
    endpoints.forEach((ep) => {
      console.log(
        `  ${ep.method} ${ep.path} - ${ep.summary} (${ep.tags.join(", ")})`
      );
    });

    const schemas = mockInterface.getSchemas();
    console.log(
      `\nFound ${Object.keys(schemas).length} schemas:`,
      Object.keys(schemas)
    );

    const securitySchemes = mockInterface.getSecuritySchemes();
    console.log(
      `\nFound ${Object.keys(securitySchemes).length} security schemes:`,
      Object.keys(securitySchemes)
    );

    // Example 6: Generate mock data with custom options
    console.log("\n6. Generating Mock Data with Custom Options:");

    const mockOptions = {
      maxArrayLength: 5,
      useExamples: true,
      generateRandomStrings: true,
    };

    try {
      const mockProduct = mockInterface.generateMockData(
        "Product",
        mockOptions
      );
      console.log("Mock Product:", JSON.stringify(mockProduct, null, 2));

      const mockOrder = mockInterface.generateMockData("Order", mockOptions);
      console.log("Mock Order:", JSON.stringify(mockOrder, null, 2));
    } catch (error) {
      console.log("Error generating mock data:", error.message);
    }

    // Example 7: Generate mock responses
    console.log("\n7. Generating Mock Responses:");

    try {
      const getProductsResponse =
        mockInterface.generateMockResponse("getProducts");
      console.log(
        "GET /products response:",
        JSON.stringify(getProductsResponse, null, 2)
      );

      const createProductResponse =
        mockInterface.generateMockResponse("createProduct");
      console.log(
        "POST /products response:",
        JSON.stringify(createProductResponse, null, 2)
      );
    } catch (error) {
      console.log("Error generating mock responses:", error.message);
    }

    // Example 8: Start mock server with custom configuration
    console.log("\n8. Starting Mock Server with Advanced Configuration:");

    const serverInfo = await mockInterface.startMockServer();
    console.log("Server started:", serverInfo);

    console.log("\n🎉 Advanced mock server is running!");
    console.log("Available endpoints:");
    console.log("  GET  http://localhost:3001/products");
    console.log("  POST http://localhost:3001/products");
    console.log("  GET  http://localhost:3001/products/{id}");
    console.log("  GET  http://localhost:3001/orders");
    console.log("  GET  http://localhost:3001/health");
    console.log("  GET  http://localhost:3001/spec/info");
    console.log("  GET  http://localhost:3001/spec/endpoints");
    console.log("  GET  http://localhost:3001/spec/schemas");

    // Example 9: Demonstrate server monitoring
    console.log("\n9. Server Monitoring:");
    console.log("Server running:", mockInterface.isServerRunning());
    console.log("Server info:", mockInterface.getServerInfo());

    console.log("\nPress Ctrl+C to stop the server...");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n\n🛑 Shutting down...");
  process.exit(0);
});

// Run the advanced example
advancedExample();
