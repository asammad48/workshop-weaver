#!/usr/bin/env node
/**
 * NSwag API Client Generator
 * 
 * This script generates TypeScript API client from an OpenAPI/Swagger specification.
 * 
 * Prerequisites:
 * - Set VITE_OPENAPI_URL in .env to point to your swagger.json
 * 
 * Usage:
 * - npm run api:gen
 */

import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Load environment variables
const envPath = join(rootDir, '.env');
let openApiUrl = process.env.VITE_OPENAPI_URL;

if (!openApiUrl && existsSync(envPath)) {
  const envContent = await import('fs').then(fs => fs.readFileSync(envPath, 'utf-8'));
  const match = envContent.match(/VITE_OPENAPI_URL=(.+)/);
  if (match) {
    openApiUrl = match[1].trim();
  }
}

if (!openApiUrl) {
  console.error('Error: VITE_OPENAPI_URL is not set in .env file');
  console.error('Please set it to your OpenAPI/Swagger JSON URL');
  process.exit(1);
}

console.log(`Generating API client from: ${openApiUrl}`);

// NSwag configuration
const nswagConfig = {
  runtime: 'Net80',
  documentGenerator: {
    fromDocument: {
      url: openApiUrl,
      output: null
    }
  },
  codeGenerators: {
    openApiToTypeScriptClient: {
      className: '{controller}Client',
      moduleName: '',
      namespace: '',
      typeScriptVersion: 4.3,
      template: 'Fetch',
      promiseType: 'Promise',
      httpClass: 'HttpClient',
      withCredentials: false,
      useSingletonProvider: false,
      injectionTokenType: 'OpaqueToken',
      rxJsVersion: 6.0,
      dateTimeType: 'Date',
      nullValue: 'Undefined',
      generateClientClasses: true,
      generateClientInterfaces: false,
      generateOptionalParameters: true,
      exportTypes: true,
      wrapDtoExceptions: true,
      exceptionClass: 'ApiException',
      clientBaseClass: null,
      wrapResponses: false,
      wrapResponseMethods: [],
      generateResponseClasses: true,
      responseClass: 'SwaggerResponse',
      protectedMethods: [],
      configurationClass: null,
      useTransformOptionsMethod: true,
      useTransformResultMethod: true,
      generateDtoTypes: true,
      operationGenerationMode: 'MultipleClientsFromOperationId',
      markOptionalProperties: true,
      generateCloneMethod: false,
      typeStyle: 'Class',
      enumStyle: 'Enum',
      useLeafType: false,
      classTypes: [],
      extendedClasses: [],
      extensionCode: null,
      generateDefaultValues: true,
      excludedTypeNames: [],
      excludedParameterNames: [],
      handleReferences: false,
      generateConstructorInterface: true,
      convertConstructorInterfaceData: false,
      importRequiredTypes: true,
      useGetBaseUrlMethod: true,
      useAbortSignal: true,
      inlineNamedDictionaries: false,
      inlineNamedAny: false,
      output: join(rootDir, 'src/api/generated/apiClient.ts'),
      newLineBehavior: 'Auto'
    }
  }
};

// Write temp config
const tempConfigPath = join(rootDir, 'nswag-temp.json');
writeFileSync(tempConfigPath, JSON.stringify(nswagConfig, null, 2));

try {
  console.log('Running NSwag...');
  execSync(`npx nswag run ${tempConfigPath}`, { 
    stdio: 'inherit',
    cwd: rootDir 
  });
  console.log('✅ API client generated successfully!');
  console.log(`   Output: src/api/generated/apiClient.ts`);
} catch (error) {
  console.error('❌ Failed to generate API client');
  console.error(error.message);
  process.exit(1);
} finally {
  // Cleanup temp config
  if (existsSync(tempConfigPath)) {
    unlinkSync(tempConfigPath);
  }
}
