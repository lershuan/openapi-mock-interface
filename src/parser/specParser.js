import SwaggerParser from "swagger-parser";

/**
 * OpenAPI Specification Parser
 * Handles parsing, validation, and analysis of OpenAPI specifications
 */
export class OpenAPISpecParser {
  constructor() {
    this.parser = new SwaggerParser();
  }

  /**
   * Parse and validate OpenAPI specification
   * @param {Object|string} spec - OpenAPI specification object or URL
   * @returns {Promise<Object>} Validated and dereferenced OpenAPI specification
   */
  async parseAndValidate(spec) {
    try {
      console.log("Parsing and validating OpenAPI specification...");

      const parsed = await this.parser.validate(spec);
      console.log("OpenAPI specification is valid");

      return parsed;
    } catch (error) {
      throw new Error(`OpenAPI validation failed: ${error.message}`);
    }
  }

  /**
   * Dereference OpenAPI specification (resolve $refs)
   * @param {Object|string} spec - OpenAPI specification object or URL
   * @returns {Promise<Object>} Dereferenced OpenAPI specification
   */
  async dereference(spec) {
    try {
      console.log("Dereferencing OpenAPI specification...");

      const dereferenced = await this.parser.dereference(spec);
      console.log("OpenAPI specification dereferenced successfully");

      return dereferenced;
    } catch (error) {
      throw new Error(
        `Failed to dereference OpenAPI specification: ${error.message}`
      );
    }
  }

  /**
   * Bundle OpenAPI specification (resolve external references)
   * @param {Object|string} spec - OpenAPI specification object or URL
   * @returns {Promise<Object>} Bundled OpenAPI specification
   */
  async bundle(spec) {
    try {
      console.log("Bundling OpenAPI specification...");

      const bundled = await this.parser.bundle(spec);
      console.log("OpenAPI specification bundled successfully");

      return bundled;
    } catch (error) {
      throw new Error(
        `Failed to bundle OpenAPI specification: ${error.message}`
      );
    }
  }

  /**
   * Extract all endpoints from OpenAPI specification
   * @param {Object} spec - OpenAPI specification object
   * @returns {Array} Array of endpoint objects
   */
  extractEndpoints(spec) {
    if (!spec.paths) {
      return [];
    }

    const endpoints = [];

    for (const [path, pathItem] of Object.entries(spec.paths)) {
      for (const [method, operation] of Object.entries(pathItem)) {
        if (this.isValidHttpMethod(method)) {
          endpoints.push({
            path,
            method: method.toUpperCase(),
            operationId: operation.operationId,
            summary: operation.summary,
            description: operation.description,
            tags: operation.tags || [],
            parameters: operation.parameters || [],
            requestBody: operation.requestBody,
            responses: operation.responses || {},
            security: operation.security || spec.security || [],
            deprecated: operation.deprecated || false,
          });
        }
      }
    }

    console.log(
      `Extracted ${endpoints.length} endpoints from OpenAPI specification`
    );
    return endpoints;
  }

  /**
   * Extract all schemas from OpenAPI specification
   * @param {Object} spec - OpenAPI specification object
   * @returns {Object} Schemas object
   */
  extractSchemas(spec) {
    const schemas = {};

    if (spec.components?.schemas) {
      Object.assign(schemas, spec.components.schemas);
    }

    // Also extract schemas from responses and request bodies
    this.extractSchemasFromPaths(spec, schemas);

    console.log(
      `Extracted ${
        Object.keys(schemas).length
      } schemas from OpenAPI specification`
    );
    return schemas;
  }

  /**
   * Extract security schemes from OpenAPI specification
   * @param {Object} spec - OpenAPI specification object
   * @returns {Object} Security schemes object
   */
  extractSecuritySchemes(spec) {
    const securitySchemes = {};

    if (spec.components?.securitySchemes) {
      Object.assign(securitySchemes, spec.components.securitySchemes);
    }

    console.log(
      `Extracted ${
        Object.keys(securitySchemes).length
      } security schemes from OpenAPI specification`
    );
    return securitySchemes;
  }

  /**
   * Generate mock data for a schema
   * @param {Object} schema - JSON schema object
   * @param {Object} options - Generation options
   * @returns {any} Mock data
   */
  generateMockData(schema, options = {}) {
    const {
      maxArrayLength = 3,
      useExamples = true,
      generateRandomStrings = true,
    } = options;

    if (!schema) {
      return null;
    }

    // Use example if available and useExamples is true
    if (useExamples && schema.example !== undefined) {
      return schema.example;
    }

    // Handle different schema types
    switch (schema.type) {
      case "string":
        if (schema.enum) {
          return schema.enum[Math.floor(Math.random() * schema.enum.length)];
        }
        if (schema.format === "date") {
          return new Date().toISOString().split("T")[0];
        }
        if (schema.format === "date-time") {
          return new Date().toISOString();
        }
        if (schema.format === "email") {
          return "user@example.com";
        }
        if (schema.format === "uri") {
          return "https://example.com";
        }
        return generateRandomStrings
          ? this.generateRandomString(schema.minLength, schema.maxLength)
          : "string";

      case "number":
      case "integer":
        const min = schema.minimum || 0;
        const max = schema.maximum || 100;
        return Math.floor(Math.random() * (max - min + 1)) + min;

      case "boolean":
        return Math.random() > 0.5;

      case "array":
        const arrayLength = Math.min(
          maxArrayLength,
          schema.maxItems || maxArrayLength
        );
        const items = schema.items || { type: "string" };
        return Array.from({ length: arrayLength }, () =>
          this.generateMockData(items, options)
        );

      case "object":
        const obj = {};
        if (schema.properties) {
          for (const [key, propSchema] of Object.entries(schema.properties)) {
            obj[key] = this.generateMockData(propSchema, options);
          }
        }
        return obj;

      default:
        return null;
    }
  }

  /**
   * Generate mock response for an endpoint
   * @param {Object} endpoint - Endpoint object
   * @param {Object} spec - OpenAPI specification object
   * @param {Object} options - Generation options
   * @returns {Object} Mock response
   */
  generateMockResponse(endpoint, spec, options = {}) {
    const responses = endpoint.responses || {};
    const statusCodes = Object.keys(responses);

    if (statusCodes.length === 0) {
      return { status: 200, data: {} };
    }

    // Prefer 200, 201, or first available status code
    const preferredStatus =
      statusCodes.find((code) => ["200", "201"].includes(code)) ||
      statusCodes[0];
    const response = responses[preferredStatus];

    if (!response) {
      return { status: parseInt(preferredStatus), data: {} };
    }

    const mockData = this.generateMockDataFromResponse(response, spec, options);

    return {
      status: parseInt(preferredStatus),
      data: mockData,
      headers: this.generateResponseHeaders(response),
    };
  }

  /**
   * Generate mock data from response schema
   * @param {Object} response - Response object
   * @param {Object} spec - OpenAPI specification object
   * @param {Object} options - Generation options
   * @returns {any} Mock data
   */
  generateMockDataFromResponse(response, spec, options) {
    if (!response.content) {
      return {};
    }

    const contentType = Object.keys(response.content)[0];
    const mediaType = response.content[contentType];

    if (mediaType.schema) {
      return this.generateMockData(mediaType.schema, options);
    }

    return {};
  }

  /**
   * Generate response headers
   * @param {Object} response - Response object
   * @returns {Object} Headers object
   */
  generateResponseHeaders(response) {
    const headers = {};

    if (response.headers) {
      for (const [name, header] of Object.entries(response.headers)) {
        if (header.schema) {
          headers[name] = this.generateMockData(header.schema);
        }
      }
    }

    return headers;
  }

  /**
   * Check if method is a valid HTTP method
   * @param {string} method - HTTP method
   * @returns {boolean} True if valid HTTP method
   */
  isValidHttpMethod(method) {
    const validMethods = [
      "get",
      "post",
      "put",
      "patch",
      "delete",
      "head",
      "options",
      "trace",
    ];
    return validMethods.includes(method.toLowerCase());
  }

  /**
   * Extract schemas from paths recursively
   * @param {Object} spec - OpenAPI specification object
   * @param {Object} schemas - Schemas object to populate
   */
  extractSchemasFromPaths(spec, schemas) {
    if (!spec.paths) return;

    for (const pathItem of Object.values(spec.paths)) {
      for (const operation of Object.values(pathItem)) {
        if (typeof operation === "object" && operation !== null) {
          // Extract from request body
          if (operation.requestBody?.content) {
            for (const mediaType of Object.values(
              operation.requestBody.content
            )) {
              if (mediaType.schema) {
                this.extractSchemasFromSchema(mediaType.schema, schemas);
              }
            }
          }

          // Extract from responses
          if (operation.responses) {
            for (const response of Object.values(operation.responses)) {
              if (response.content) {
                for (const mediaType of Object.values(response.content)) {
                  if (mediaType.schema) {
                    this.extractSchemasFromSchema(mediaType.schema, schemas);
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  /**
   * Extract schemas from a schema object recursively
   * @param {Object} schema - Schema object
   * @param {Object} schemas - Schemas object to populate
   */
  extractSchemasFromSchema(schema, schemas) {
    if (!schema || typeof schema !== "object") return;

    if (schema.$ref) {
      const refName = schema.$ref.split("/").pop();
      if (refName && !schemas[refName]) {
        schemas[refName] = { $ref: schema.$ref };
      }
    }

    if (schema.properties) {
      for (const propSchema of Object.values(schema.properties)) {
        this.extractSchemasFromSchema(propSchema, schemas);
      }
    }

    if (schema.items) {
      this.extractSchemasFromSchema(schema.items, schemas);
    }

    if (schema.oneOf || schema.anyOf || schema.allOf) {
      const schemasToCheck = schema.oneOf || schema.anyOf || schema.allOf;
      for (const subSchema of schemasToCheck) {
        this.extractSchemasFromSchema(subSchema, schemas);
      }
    }
  }

  /**
   * Generate random string
   * @param {number} minLength - Minimum length
   * @param {number} maxLength - Maximum length
   * @returns {string} Random string
   */
  generateRandomString(minLength = 5, maxLength = 10) {
    const length =
      Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
