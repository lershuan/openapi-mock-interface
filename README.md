# OpenAPI Mock Interface

A comprehensive Node.js library for retrieving, parsing, and mocking OpenAPI specifications. This tool allows you to easily load OpenAPI specs from URLs or files, validate them, and create mock servers for testing and development.

## Features

- 🔗 **Fetch OpenAPI specs** from URLs or local files
- ✅ **Validate specifications** using Swagger Parser
- 🚀 **Create mock servers** with Express.js
- 🎭 **Generate mock data** based on schemas
- 📊 **Parse and analyze** OpenAPI specifications
- 🔧 **Customizable configuration** for all components
- 📝 **TypeScript support** (via JSDoc annotations)

## Installation

```bash
npm install
```

## Quick Start

```javascript
import OpenAPIMockInterface from "./src/index.js";

// Create interface instance
const mockInterface = new OpenAPIMockInterface();

// Load OpenAPI specification from URL
await mockInterface.loadFromUrl(
  "https://petstore3.swagger.io/api/v3/openapi.json"
);

// Start mock server
await mockInterface.startMockServer();

console.log("Mock server running at http://localhost:3000");
```

## Usage Examples

### Basic Usage

```javascript
import OpenAPIMockInterface from './src/index.js';

const mockInterface = new OpenAPIMockInterface({
  server: { port: 3000 }
});

// Load from URL
await mockInterface.loadFromUrl('https://api.example.com/openapi.json');

// Load from file
await mockInterface.loadFromFile('./specs/api.yaml');

// Load from object
const spec = { openapi: '3.0.0', info: {...}, paths: {...} };
await mockInterface.loadFromObject(spec);

// Start mock server
await mockInterface.startMockServer();
```

### Advanced Configuration

```javascript
const mockInterface = new OpenAPIMockInterface({
  fetcher: {
    timeout: 15000,
    headers: {
      Authorization: "Bearer token",
      "User-Agent": "MyApp/1.0.0",
    },
    validateSSL: false,
  },
  server: {
    port: 3001,
    host: "0.0.0.0",
  },
});
```

### Working with Specifications

```javascript
// Get specification metadata
const metadata = mockInterface.getSpecMetadata();
console.log(metadata);

// Get all endpoints
const endpoints = mockInterface.getEndpoints();
endpoints.forEach((ep) => {
  console.log(`${ep.method} ${ep.path} - ${ep.summary}`);
});

// Get all schemas
const schemas = mockInterface.getSchemas();
console.log("Available schemas:", Object.keys(schemas));

// Get security schemes
const securitySchemes = mockInterface.getSecuritySchemes();
console.log("Security schemes:", Object.keys(securitySchemes));
```

### Generating Mock Data

```javascript
// Generate mock data for a schema
const mockUser = mockInterface.generateMockData("User", {
  maxArrayLength: 5,
  useExamples: true,
  generateRandomStrings: true,
});

// Generate mock response for an endpoint
const mockResponse = mockInterface.generateMockResponse("getUsers", {
  maxArrayLength: 3,
});
```

## API Reference

### OpenAPIMockInterface

Main interface class that orchestrates all functionality.

#### Constructor Options

```javascript
new OpenAPIMockInterface({
  fetcher: {
    timeout: 10000, // Request timeout in ms
    headers: {}, // Default headers
    validateSSL: true, // SSL validation
  },
  server: {
    port: 3000, // Server port
    host: "localhost", // Server host
  },
});
```

#### Methods

- `loadFromUrl(url, options)` - Load spec from URL
- `loadFromFile(filePath)` - Load spec from file
- `loadFromObject(spec)` - Load spec from object
- `startMockServer(options)` - Start mock server
- `stopMockServer()` - Stop mock server
- `getSpecMetadata()` - Get spec metadata
- `getEndpoints()` - Get all endpoints
- `getSchemas()` - Get all schemas
- `getSecuritySchemes()` - Get security schemes
- `generateMockData(schemaName, options)` - Generate mock data
- `generateMockResponse(operationId, options)` - Generate mock response
- `getServerInfo()` - Get server information
- `isServerRunning()` - Check if server is running

### OpenAPISpecFetcher

Handles fetching OpenAPI specifications from various sources.

#### Methods

- `fetchFromUrl(url, options)` - Fetch from URL
- `fetchFromFile(filePath)` - Load from file
- `parseSpecification(content, contentType)` - Parse content
- `validateOpenAPISpec(spec)` - Validate spec
- `getSpecMetadata(spec)` - Get metadata

### OpenAPISpecParser

Handles parsing, validation, and analysis of OpenAPI specifications.

#### Methods

- `parseAndValidate(spec)` - Parse and validate
- `dereference(spec)` - Dereference $refs
- `bundle(spec)` - Bundle external refs
- `extractEndpoints(spec)` - Extract endpoints
- `extractSchemas(spec)` - Extract schemas
- `extractSecuritySchemes(spec)` - Extract security schemes
- `generateMockData(schema, options)` - Generate mock data
- `generateMockResponse(endpoint, spec, options)` - Generate mock response

### OpenAPIMockServer

Creates and manages the Express.js mock server.

#### Methods

- `loadSpecification(spec)` - Load spec into server
- `start()` - Start server
- `stop()` - Stop server
- `getServerInfo()` - Get server info
- `getEndpointByOperationId(operationId)` - Get endpoint by ID
- `getEndpointsByTag(tag)` - Get endpoints by tag
- `getSchema(name)` - Get schema by name
- `generateMockDataForSchema(schemaName, options)` - Generate mock data

## Mock Server Endpoints

When you start a mock server, it automatically provides these utility endpoints:

- `GET /health` - Health check
- `GET /spec/info` - Specification information
- `GET /spec/endpoints` - List all endpoints
- `GET /spec/schemas` - List all schemas

## Examples

### Running Examples

```bash
# Basic usage example
node examples/basic-usage.js

# Advanced usage example
node examples/advanced-usage.js
```

### Example Output

```
🚀 OpenAPI Mock Interface - Basic Usage Example

1. Loading OpenAPI specification from URL...
✅ Successfully loaded specification from URL

2. Specification metadata:
{
  "openapiVersion": "3.0.3",
  "title": "Swagger Petstore",
  "version": "1.0.11",
  "description": "This is a sample Pet Store Server based on the OpenAPI 3.0 specification.",
  "servers": [...],
  "paths": [...],
  "pathCount": 13,
  "hasComponents": true,
  "hasSecurity": true
}

3. Available endpoints:
  GET /pet - Find pets by status
  POST /pet - Add a new pet to the store
  PUT /pet - Update an existing pet
  ...

🎉 Mock server is running!
Try these endpoints:
  GET  http://localhost:3000/pet
  POST http://localhost:3000/pet
  GET  http://localhost:3000/pet/findByStatus
```

## Error Handling

The library provides comprehensive error handling:

```javascript
try {
  await mockInterface.loadFromUrl("https://invalid-url.com/spec.json");
} catch (error) {
  console.error("Failed to load specification:", error.message);
}

try {
  await mockInterface.startMockServer();
} catch (error) {
  console.error("Failed to start server:", error.message);
}
```

## Configuration Options

### Fetcher Options

- `timeout` - Request timeout in milliseconds
- `headers` - Default headers for requests
- `validateSSL` - Whether to validate SSL certificates

### Server Options

- `port` - Server port number
- `host` - Server host address

### Mock Data Generation Options

- `maxArrayLength` - Maximum length for generated arrays
- `useExamples` - Whether to use schema examples when available
- `generateRandomStrings` - Whether to generate random strings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions, please open an issue on GitHub.
