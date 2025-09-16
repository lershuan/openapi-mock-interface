import axios from "axios";
import YAML from "yaml";
import fs from "fs";
import path from "path";

/**
 * OpenAPI Specification Fetcher
 * Handles retrieval of OpenAPI specifications from various sources
 */
export class OpenAPISpecFetcher {
  constructor(options = {}) {
    this.timeout = options.timeout || 10000;
    this.headers = options.headers || {};
    this.validateSSL = options.validateSSL !== false;
  }

  /**
   * Fetch OpenAPI specification from URL
   * @param {string} url - URL to the OpenAPI specification
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Parsed OpenAPI specification
   */
  async fetchFromUrl(url, options = {}) {
    try {
      console.log(`Fetching OpenAPI spec from: ${url}`);

      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: { ...this.headers, ...options.headers },
        validateStatus: (status) => status < 500,
        httpsAgent: this.validateSSL
          ? undefined
          : new (
              await import("https")
            ).Agent({
              rejectUnauthorized: false,
            }),
      });

      if (response.status >= 400) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return this.parseSpecification(
        response.data,
        response.headers["content-type"]
      );
    } catch (error) {
      throw new Error(
        `Failed to fetch OpenAPI spec from ${url}: ${error.message}`
      );
    }
  }

  /**
   * Load OpenAPI specification from local file
   * @param {string} filePath - Path to the specification file
   * @returns {Promise<Object>} Parsed OpenAPI specification
   */
  async fetchFromFile(filePath) {
    try {
      console.log(`Loading OpenAPI spec from file: ${filePath}`);

      const fileContent = await fs.promises.readFile(filePath, "utf8");
      const ext = path.extname(filePath).toLowerCase();

      return this.parseSpecification(
        fileContent,
        this.getContentTypeFromExtension(ext)
      );
    } catch (error) {
      throw new Error(
        `Failed to load OpenAPI spec from file ${filePath}: ${error.message}`
      );
    }
  }

  /**
   * Parse OpenAPI specification from raw content
   * @param {string} content - Raw specification content
   * @param {string} contentType - MIME type of the content
   * @returns {Object} Parsed OpenAPI specification
   */
  parseSpecification(content, contentType) {
    try {
      const hasContentType = typeof contentType === "string";
      const isYAML =
        (hasContentType &&
          (contentType.includes("yaml") || contentType.includes("yml"))) ||
        !hasContentType ||
        !contentType.includes("json");

      if (isYAML) {
        console.log("Parsing YAML OpenAPI specification");
        return YAML.parse(content);
      } else {
        console.log("Parsing JSON OpenAPI specification");
        return JSON.parse(content);
      }
    } catch (error) {
      throw new Error(
        `Failed to parse OpenAPI specification: ${error.message}`
      );
    }
  }

  /**
   * Get content type from file extension
   * @param {string} ext - File extension
   * @returns {string} MIME type
   */
  getContentTypeFromExtension(ext) {
    const contentTypes = {
      ".json": "application/json",
      ".yaml": "application/x-yaml",
      ".yml": "application/x-yaml",
    };
    return contentTypes[ext] || "application/x-yaml";
  }

  /**
   * Validate if the fetched specification is a valid OpenAPI spec
   * @param {Object} spec - OpenAPI specification object
   * @returns {boolean} True if valid OpenAPI spec
   */
  validateOpenAPISpec(spec) {
    if (!spec || typeof spec !== "object") {
      return false;
    }

    // Check for required OpenAPI fields
    const requiredFields = ["openapi", "info", "paths"];
    return requiredFields.every((field) => spec.hasOwnProperty(field));
  }

  /**
   * Get specification metadata
   * @param {Object} spec - OpenAPI specification object
   * @returns {Object} Metadata about the specification
   */
  getSpecMetadata(spec) {
    if (!this.validateOpenAPISpec(spec)) {
      throw new Error("Invalid OpenAPI specification");
    }

    return {
      openapiVersion: spec.openapi,
      title: (spec.info && spec.info.title) || "Unknown",
      version: (spec.info && spec.info.version) || "Unknown",
      description: (spec.info && spec.info.description) || "",
      servers: spec.servers || [],
      paths: Object.keys(spec.paths || {}),
      pathCount: Object.keys(spec.paths || {}).length,
      hasComponents: !!spec.components,
      hasSecurity:
        !!spec.security ||
        !!(spec.components && spec.components.securitySchemes),
    };
  }
}
