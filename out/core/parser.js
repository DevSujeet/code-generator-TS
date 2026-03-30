"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGeneratedProject = parseGeneratedProject;
exports.validateGeneratedProject = validateGeneratedProject;
exports.createDummyGeneratedProject = createDummyGeneratedProject;
function parseGeneratedProject(raw) {
    const parsed = JSON.parse(extractJson(raw));
    validateGeneratedProject(parsed);
    return parsed;
}
function validateGeneratedProject(project) {
    if (!project || typeof project !== "object") {
        throw new Error("Generated project must be an object.");
    }
    if (!project.projectName || typeof project.projectName !== "string") {
        throw new Error("Generated project is missing a valid projectName.");
    }
    if (!Array.isArray(project.folders)) {
        throw new Error("Generated project folders must be an array.");
    }
    if (!Array.isArray(project.files)) {
        throw new Error("Generated project files must be an array.");
    }
    for (const file of project.files) {
        validateGeneratedFile(file);
    }
    if (!Array.isArray(project.notes)) {
        throw new Error("Generated project notes must be an array.");
    }
}
function validateGeneratedFile(file) {
    if (!file || typeof file !== "object") {
        throw new Error("Each file entry must be an object.");
    }
    if (!file.path || typeof file.path !== "string") {
        throw new Error("Each file must include a valid path.");
    }
    if (file.path.startsWith("/") || file.path.includes("..")) {
        throw new Error(`Unsafe file path detected: ${file.path}`);
    }
    if (typeof file.content !== "string") {
        throw new Error(`File content must be a string for path: ${file.path}`);
    }
}
function extractJson(raw) {
    const trimmed = raw.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        return trimmed;
    }
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
        return trimmed.slice(firstBrace, lastBrace + 1);
    }
    throw new Error("Could not find valid JSON in model response.");
}
function createDummyGeneratedProject(spec) {
    const requirements = [
        "fastapi",
        "uvicorn[standard]",
        spec.database.type === "postgresql" ? "psycopg2-binary" : "",
        "sqlalchemy",
        "pydantic-settings"
    ]
        .filter(Boolean)
        .join("\n");
    const mainPy = `
from fastapi import FastAPI

app = FastAPI(title="${spec.projectName}")

@app.get("/")
def health():
    return {"message": "Hello from ${spec.projectName}"}
`.trim();
    const readme = `
# ${spec.projectName}

## Run
\`\`\`bash
pip install -r requirements.txt
uvicorn app.main:app --reload
\`\`\`
`.trim();
    return {
        projectName: spec.projectName,
        folders: ["app"],
        files: [
            {
                path: "app/main.py",
                content: mainPy
            },
            {
                path: "requirements.txt",
                content: requirements
            },
            {
                path: "README.md",
                content: readme
            }
        ],
        notes: [
            "Dummy project generated locally.",
            "Switch provider to openai in settings to call the real model."
        ]
    };
}
//# sourceMappingURL=parser.js.map