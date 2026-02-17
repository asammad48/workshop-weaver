import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const envPath = path.join(root, ".env");

function readEnvFile() {
    if (!fs.existsSync(envPath)) return {};
    const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
    const env = {};
    for (const line of lines) {
        const t = line.trim();
        if (!t || t.startsWith("#")) continue;
        const i = t.indexOf("=");
        if (i === -1) continue;
        env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
    }
    return env;
}

const env = readEnvFile();
const openApiUrl = env.VITE_OPENAPI_URL || process.env.VITE_OPENAPI_URL;

if (!openApiUrl) {
    console.error("Missing VITE_OPENAPI_URL. Copy .env.example to .env and set it.");
    process.exit(1);
}

const outDir = path.join(root, "src", "api", "generated");
const outFile = path.join(outDir, "apiClient.ts");
fs.mkdirSync(outDir, { recursive: true });

const cfg = {
    runtime: "Net80",
    documentGenerator: { fromDocument: { url: openApiUrl } },
    codeGenerators: {
        openApiToTypeScriptClient: {
            className: "{controller}Client",
            template: "Fetch",
            typeScriptVersion: 5.0,
            promiseType: "Promise",
            generateClientClasses: true,
            generateClientInterfaces: false,
            generateOptionalParameters: true,
            exportTypes: true,
            wrapDtoExceptions: true,
            exceptionClass: "ApiException",
            useAbortSignal: true,
            useTransformOptionsMethod: true,
            useTransformResultMethod: true,
            output: outFile
        }
    }
};

const tmp = path.join(root, "nswag.temp.json");
fs.writeFileSync(tmp, JSON.stringify(cfg, null, 2), "utf8");

try {
    console.log("Generating TypeScript client via NSwag...");
    execSync(`npx nswag run "${tmp}"`, { stdio: "inherit" });
    console.log(`✅ Generated: src/api/generated/apiClient.ts`);
} finally {
    try { fs.unlinkSync(tmp); } catch { }
}