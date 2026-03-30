import { ProjectSpec } from "../types/projectSpec";

export interface RawUserInput {
  projectName: string;
  auth: boolean;
  authorization: boolean;
  crud: boolean;
  database: "postgresql" | "sqlite";
}

export function buildProjectSpec(input: RawUserInput): ProjectSpec {
  const projectName = input.projectName.trim();

  if (!projectName) {
    throw new Error("Project name is required.");
  }

  return {
    projectName,
    appType: "backend",
    framework: "fastapi",
    language: "python",
    features: {
      auth: input.auth,
      authorization: input.authorization,
      crud: input.crud
    },
    database: {
      type: input.database || "postgresql"
    },
    config: {
      envManager: "pydantic-settings"
    }
  };
}
