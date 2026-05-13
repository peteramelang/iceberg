import Ajv, { ErrorObject } from "ajv";
import addFormats from "ajv-formats";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaDir = join(__dirname, "..", "schemas");

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

function loadSchema(name: string): object {
  const path = join(schemaDir, `${name}.schema.json`);
  return JSON.parse(readFileSync(path, "utf8"));
}

const validators = {
  ledger: ajv.compile(loadSchema("ledger")),
  taxonomy: ajv.compile(loadSchema("taxonomy")),
  topicFrontmatter: ajv.compile(loadSchema("topic-frontmatter")),
  connections: ajv.compile(loadSchema("connections")),
  exportPayload: ajv.compile(loadSchema("export-payload"))
};

export class ValidationError extends Error {
  constructor(public readonly schemaName: string, public readonly errors: ErrorObject[]) {
    super(`${schemaName} validation failed: ${ajv.errorsText(errors)}`);
    this.name = "ValidationError";
  }
}

function check(name: keyof typeof validators, data: unknown): void {
  const validate = validators[name];
  if (!validate(data)) {
    throw new ValidationError(name, validate.errors ?? []);
  }
}

export function validateLedger(data: unknown): void { check("ledger", data); }
export function validateTaxonomy(data: unknown): void { check("taxonomy", data); }
export function validateTopicFrontmatter(data: unknown): void { check("topicFrontmatter", data); }
export function validateConnections(data: unknown): void { check("connections", data); }
export function validateExportPayload(data: unknown): void { check("exportPayload", data); }
