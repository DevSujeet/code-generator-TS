import { ProjectSpec } from "../types/projectSpec";

export function buildPrompt(spec: ProjectSpec): string {
  return `
Generate a minimal but runnable backend starter project.

Requirements:
- App Type: ${spec.appType}
- Framework: ${spec.framework}
- Language: ${spec.language}
- Project Name: ${spec.projectName}
- Auth: ${spec.features.auth}
- Authorization: ${spec.features.authorization}
- CRUD: ${spec.features.crud}
- Database: ${spec.database.type}
- Env Manager: ${spec.config.envManager}

Rules:
- Return JSON only.
- Do not wrap JSON in markdown fences.
- Use relative file paths only.
- Keep code simple, clean, and runnable.
- Include README.md with setup and run instructions.

JSON schema:
{
  "projectName": "string",
  "folders": ["string"],
  "files": [
    {
      "path": "string",
      "content": "string"
    }
  ],
  "notes": ["string"]
}
`.trim();
}
