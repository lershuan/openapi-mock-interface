import { OpenAPISpecFetcher } from "./api/specFetcher.js";
import { OpenAPISpecParser } from "./parser/specParser.js";
import { OpenAPIMockServer } from "./mock/mockServer.js";

/**
 * OpenAPI Mock Interface
 * Main interface for retrieving, parsing, and mocking OpenAPI specifications
 */
export class OpenAPIMockInterface {
  constructor(options = {}) {
    this.fetcher = new OpenAPISpecFetcher(options.fetcher || {});
    this.parser = new OpenAPISpecParser();
    this.mockServer = new OpenAPIMockServer(options.server || {});
    this.spec = null;
  }

  /**
   * Load OpenAPI specification from URL
   * @param {string} url - URL to the OpenAPI specification
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Loaded and validated specification
   */
  async loadFromUrl(url, options = {}) {
    try {
      console.log(`Loading OpenAPI specification from URL: ${url}`);

      // Fetch specification
      this.spec = await this.fetcher.fetchFromUrl(url, options);

      // Validate it's a proper OpenAPI spec
      if (!this.fetcher.validateOpenAPISpec(this.spec)) {
        throw new Error("Invalid OpenAPI specification");
      }

      // Parse and validate with Swagger Parser
      this.spec = await this.parser.parseAndValidate(this.spec);

      console.log("OpenAPI specification loaded and validated successfully");
      return this.spec;
    } catch (error) {
      throw new Error(
        `Failed to load OpenAPI specification from URL: ${error.message}`
      );
    }
  }

  /**
   * Load OpenAPI specification from file
   * @param {string} filePath - Path to the specification file
   * @returns {Promise<Object>} Loaded and validated specification
   */
  async loadFromFile(filePath) {
    try {
      console.log(`Loading OpenAPI specification from file: ${filePath}`);

      // Fetch specification
      this.spec = await this.fetcher.fetchFromFile(filePath);

      // Validate it's a proper OpenAPI spec
      if (!this.fetcher.validateOpenAPISpec(this.spec)) {
        throw new Error("Invalid OpenAPI specification");
      }

      // Parse and validate with Swagger Parser
      this.spec = await this.parser.parseAndValidate(this.spec);

      console.log("OpenAPI specification loaded and validated successfully");
      return this.spec;
    } catch (error) {
      throw new Error(
        `Failed to load OpenAPI specification from file: ${error.message}`
      );
    }
  }

  /**
   * Load OpenAPI specification from object
   * @param {Object} spec - OpenAPI specification object
   * @returns {Promise<Object>} Loaded and validated specification
   */
  async loadFromObject(spec) {
    try {
      console.log("Loading OpenAPI specification from object");

      // Validate it's a proper OpenAPI spec
      if (!this.fetcher.validateOpenAPISpec(spec)) {
        throw new Error("Invalid OpenAPI specification");
      }

      // Parse and validate with Swagger Parser
      this.spec = await this.parser.parseAndValidate(spec);

      console.log("OpenAPI specification loaded and validated successfully");
      return this.spec;
    } catch (error) {
      throw new Error(
        `Failed to load OpenAPI specification from object: ${error.message}`
      );
    }
  }

  /**
   * Start mock server
   * @param {Object} options - Server options
   * @returns {Promise<void>}
   */
  async startMockServer(options = {}) {
    if (!this.spec) {
      throw new Error(
        "No OpenAPI specification loaded. Call loadFromUrl, loadFromFile, or loadFromObject first."
      );
    }

    try {
      // Load specification into mock server
      await this.mockServer.loadSpecification(this.spec);

      // Start the server
      await this.mockServer.start();

      console.log("Mock server started successfully");
      return this.mockServer.getServerInfo();
    } catch (error) {
      throw new Error(`Failed to start mock server: ${error.message}`);
    }
  }

  /**
   * Stop mock server
   * @returns {Promise<void>}
   */
  async stopMockServer() {
    try {
      await this.mockServer.stop();
      console.log("Mock server stopped");
    } catch (error) {
      throw new Error(`Failed to stop mock server: ${error.message}`);
    }
  }

  /**
   * Get specification metadata
   * @returns {Object} Specification metadata
   */
  getSpecMetadata() {
    if (!this.spec) {
      throw new Error("No OpenAPI specification loaded");
    }
    return this.fetcher.getSpecMetadata(this.spec);
  }

  /**
   * Get all endpoints
   * @returns {Array} Array of endpoint objects
   */
  getEndpoints() {
    if (!this.spec) {
      throw new Error("No OpenAPI specification loaded");
    }
    return this.parser.extractEndpoints(this.spec);
  }

  /**
   * Get all schemas
   * @returns {Object} Schemas object
   */
  getSchemas() {
    if (!this.spec) {
      throw new Error("No OpenAPI specification loaded");
    }
    return this.parser.extractSchemas(this.spec);
  }

  /**
   * Get all security schemes
   * @returns {Object} Security schemes object
   */
  getSecuritySchemes() {
    if (!this.spec) {
      throw new Error("No OpenAPI specification loaded");
    }
    return this.parser.extractSecuritySchemes(this.spec);
  }

  /**
   * Generate mock data for a schema
   * @param {string} schemaName - Schema name
   * @param {Object} options - Generation options
   * @returns {any} Mock data
   */
  generateMockData(schemaName, options = {}) {
    if (!this.spec) {
      throw new Error("No OpenAPI specification loaded");
    }
    return this.mockServer.generateMockDataForSchema(schemaName, options);
  }

  /**
   * Generate mock response for an endpoint
   * @param {string} operationId - Operation ID
   * @param {Object} options - Generation options
   * @returns {Object} Mock response
   */
  generateMockResponse(operationId, options = {}) {
    if (!this.spec) {
      throw new Error("No OpenAPI specification loaded");
    }

    const endpoint = this.mockServer.getEndpointByOperationId(operationId);
    if (!endpoint) {
      throw new Error(`Endpoint with operation ID '${operationId}' not found`);
    }

    return this.parser.generateMockResponse(endpoint, this.spec, options);
  }

  /**
   * Get server information
   * @returns {Object} Server information
   */
  getServerInfo() {
    return this.mockServer.getServerInfo();
  }

  /**
   * Check if server is running
   * @returns {boolean} True if server is running
   */
  isServerRunning() {
    return this.mockServer.server && this.mockServer.server.listening;
  }
}

// Export individual classes for direct use
export { OpenAPISpecFetcher } from "./api/specFetcher.js";
export { OpenAPISpecParser } from "./parser/specParser.js";
export { OpenAPIMockServer } from "./mock/mockServer.js";

// Default export
export default OpenAPIMockInterface;
