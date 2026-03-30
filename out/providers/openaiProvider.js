"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIProvider = void 0;
const vscode = __importStar(require("vscode"));
const parser_1 = require("../core/parser");
class OpenAIProvider {
    async generateProject(spec, prompt) {
        const config = vscode.workspace.getConfiguration("projectGenerator");
        const apiKey = config.get("openai.apiKey")?.trim();
        const model = config.get("openai.model", "gpt-5");
        const baseUrl = config.get("openai.baseUrl", "https://api.openai.com/v1").replace(/\/$/, "");
        if (!apiKey) {
            throw new Error("OpenAI API key is missing. Set projectGenerator.openai.apiKey in VS Code settings.");
        }
        const response = await fetch(`${baseUrl}/responses`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                input: [
                    {
                        role: "system",
                        content: [
                            {
                                type: "input_text",
                                text: "You generate starter code projects. Return valid JSON only."
                            }
                        ]
                    },
                    {
                        role: "user",
                        content: [
                            {
                                type: "input_text",
                                text: prompt
                            }
                        ]
                    }
                ],
                metadata: {
                    projectName: spec.projectName,
                    framework: spec.framework
                }
            })
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenAI request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const data = (await response.json());
        if (!data.output_text) {
            throw new Error("OpenAI response did not contain output_text.");
        }
        return (0, parser_1.parseGeneratedProject)(data.output_text);
    }
}
exports.OpenAIProvider = OpenAIProvider;
//# sourceMappingURL=openaiProvider.js.map