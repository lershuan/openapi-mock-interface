import OpenAPIMockInterface from "./src/index.js";
import fs from "fs";
import path from "path";

async function startFromSpec(specPath, port = 8000, host = "localhost") {
  const resolvedPath = path.resolve(specPath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`File not found: ${resolvedPath}`);
    process.exit(1);
  }

  const mockInterface = new OpenAPIMockInterface({
    server: { port: Number(port) || 8000, host },
  });

  try {
    await mockInterface.loadFromFile(resolvedPath);
    const metadata = mockInterface.getSpecMetadata();
    console.log(`Loaded spec: ${metadata.title} v${metadata.version}`);

    const serverInfo = await mockInterface.startMockServer();
    console.log(`Mock server running at ${serverInfo.url}`);

    // Keep process alive
    process.stdin.resume();
  } catch (err) {
    console.error(`Failed to start from spec: ${err.message}`);
    process.exit(1);
  }
}

const specArg = process.argv[2];
const portArg = process.argv[3];
const hostArg = process.argv[4];

if (!specArg) {
  console.log(
    "Usage: node cli-start-from-spec.js <path-to-spec.(json|yaml|yml)> [port] [host]"
  );
  process.exit(1);
}

startFromSpec(specArg, portArg, hostArg);
