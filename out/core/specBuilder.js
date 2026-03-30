"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildProjectSpec = buildProjectSpec;
function buildProjectSpec(input) {
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
//# sourceMappingURL=specBuilder.js.map