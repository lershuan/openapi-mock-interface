import express from "express";
import cors from "cors";
import { OpenAPISpecParser } from "../parser/specParser.js";

/**
 * OpenAPI Mock Server
 * Creates a mock server based on OpenAPI specification
 */
export class OpenAPIMockServer {
  constructor(options = {}) {
    this.app = express();
    this.port = options.port || 3000;
    this.host = options.host || "localhost";
    this.spec = null;
    this.parser = new OpenAPISpecParser();
    this.endpoints = [];
    this.schemas = {};
    this.securitySchemes = {};

    this.setupMiddleware();
  }

  /**
   * Setup Express middleware
   */
  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Load OpenAPI specification and setup mock endpoints
   * @param {Object} spec - OpenAPI specification object
   */
  async loadSpecification(spec) {
    try {
      console.log("Loading OpenAPI specification...");

      // Validate and parse the specification
      this.spec = await this.parser.parseAndValidate(spec);

      // Extract endpoints, schemas, and security schemes
      this.endpoints = this.parser.extractEndpoints(this.spec);
      this.schemas = this.parser.extractSchemas(this.spec);
      this.securitySchemes = this.parser.extractSecuritySchemes(this.spec);

      // Setup mock endpoints
      this.setupMockEndpoints();

      console.log(`Mock server loaded with ${this.endpoints.length} endpoints`);
    } catch (error) {
      throw new Error(`Failed to load OpenAPI specification: ${error.message}`);
    }
  }

  /**
   * Setup mock endpoints based on OpenAPI specification
   */
  setupMockEndpoints() {
    for (const endpoint of this.endpoints) {
      this.setupEndpoint(endpoint);
    }

    // Add health check endpoint
    this.app.get("/health", (req, res) => {
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        endpoints: this.endpoints.length,
        schemas: Object.keys(this.schemas).length,
      });
    });

    // Add specification info endpoint
    this.app.get("/spec/info", (req, res) => {
      res.json({
        openapi: this.spec.openapi,
        info: this.spec.info,
        servers: this.spec.servers || [],
        endpoints: this.endpoints.map((ep) => ({
          path: ep.path,
          method: ep.method,
          operationId: ep.operationId,
          summary: ep.summary,
        })),
      });
    });

    // Add schemas endpoint
    this.app.get("/spec/schemas", (req, res) => {
      res.json(this.schemas);
    });

    // Add endpoints list
    this.app.get("/spec/endpoints", (req, res) => {
      res.json(this.endpoints);
    });
  }

  /**
   * Setup individual mock endpoint
   * @param {Object} endpoint - Endpoint configuration
   */
  setupEndpoint(endpoint) {
    const { path, method, operationId, summary, description } = endpoint;

    // Convert OpenAPI path parameters to Express route parameters
    const expressPath = path.replace(/\{([^}]+)\}/g, ":$1");

    // Setup route handler
    const handler = (req, res) => {
      try {
        console.log(`Handling ${method} ${path} (${operationId || "no-id"})`);

        // Generate mock response
        const mockResponse = this.parser.generateMockResponse(
          endpoint,
          this.spec,
          {
            maxArrayLength: 3,
            useExamples: true,
            generateRandomStrings: true,
          }
        );

        // Add response headers
        if (mockResponse.headers) {
          for (const [key, value] of Object.entries(mockResponse.headers)) {
            res.set(key, value);
          }
        }

        // Set content type
        res.set("Content-Type", "application/json");

        // Send response
        res.status(mockResponse.status).json(mockResponse.data);
      } catch (error) {
        console.error(`Error handling ${method} ${path}:`, error);
        res.status(500).json({
          error: "Internal Server Error",
          message: error.message,
          operationId: operationId,
        });
      }
    };

    // Register route with Express
    switch (method.toLowerCase()) {
      case "get":
        this.app.get(expressPath, handler);
        break;
      case "post":
        this.app.post(expressPath, handler);
        break;
      case "put":
        this.app.put(expressPath, handler);
        break;
      case "patch":
        this.app.patch(expressPath, handler);
        break;
      case "delete":
        this.app.delete(expressPath, handler);
        break;
      case "head":
        this.app.head(expressPath, handler);
        break;
      case "options":
        this.app.options(expressPath, handler);
        break;
      default:
        console.warn(`Unsupported HTTP method: ${method} for path: ${path}`);
    }
  }

  /**
   * Start the mock server
   * @returns {Promise<void>}
   */
  async start() {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.port, this.host, () => {
          console.log(
            `🚀 OpenAPI Mock Server running at http://${this.host}:${this.port}`
          );
          console.log(
            `📋 Health check: http://${this.host}:${this.port}/health`
          );
          console.log(
            `📖 Specification info: http://${this.host}:${this.port}/spec/info`
          );
          console.log(
            `🔗 Available endpoints: http://${this.host}:${this.port}/spec/endpoints`
          );
          resolve();
        });

        this.server.on("error", (error) => {
          reject(new Error(`Failed to start mock server: ${error.message}`));
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop the mock server
   * @returns {Promise<void>}
   */
  async stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log("Mock server stopped");
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Get server information
   * @returns {Object} Server information
   */
  getServerInfo() {
    return {
      host: this.host,
      port: this.port,
      url: `http://${this.host}:${this.port}`,
      endpoints: this.endpoints.length,
      schemas: Object.keys(this.schemas).length,
      securitySchemes: Object.keys(this.securitySchemes).length,
    };
  }

  /**
   * Get endpoint by operation ID
   * @param {string} operationId - Operation ID
   * @returns {Object|null} Endpoint object or null
   */
  getEndpointByOperationId(operationId) {
    return this.endpoints.find((ep) => ep.operationId === operationId) || null;
  }

  /**
   * Get endpoints by tag
   * @param {string} tag - Tag name
   * @returns {Array} Array of endpoint objects
   */
  getEndpointsByTag(tag) {
    return this.endpoints.filter((ep) => ep.tags.includes(tag));
  }

  /**
   * Get schema by name
   * @param {string} name - Schema name
   * @returns {Object|null} Schema object or null
   */
  getSchema(name) {
    return this.schemas[name] || null;
  }

  /**
   * Generate mock data for a specific schema
   * @param {string} schemaName - Schema name
   * @param {Object} options - Generation options
   * @returns {any} Mock data
   */
  generateMockDataForSchema(schemaName, options = {}) {
    const schema = this.getSchema(schemaName);
    if (!schema) {
      throw new Error(`Schema '${schemaName}' not found`);
    }
    return this.parser.generateMockData(schema, options);
  }
}
