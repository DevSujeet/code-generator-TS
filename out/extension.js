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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const promptBuilder_1 = require("./core/promptBuilder");
const fileWriter_1 = require("./core/fileWriter");
const specBuilder_1 = require("./core/specBuilder");
const providerFactory_1 = require("./providers/providerFactory");
const webview_1 = require("./ui/webview");
function activate(context) {
    const disposable = vscode.commands.registerCommand("projectGenerator.openGenerator", async () => {
        const panel = vscode.window.createWebviewPanel("projectGenerator", "Project Generator", vscode.ViewColumn.One, {
            enableScripts: true
        });
        panel.webview.html = (0, webview_1.getWebviewContent)(panel.webview);
        panel.webview.onDidReceiveMessage(async (message) => {
            try {
                switch (message.type) {
                    case "generateProject": {
                        const spec = (0, specBuilder_1.buildProjectSpec)(message.payload);
                        const prompt = (0, promptBuilder_1.buildPrompt)(spec);
                        const provider = (0, providerFactory_1.createProvider)();
                        const generatedProject = await provider.generateProject(spec, prompt);
                        panel.webview.postMessage({
                            type: "generationSuccess",
                            payload: generatedProject
                        });
                        break;
                    }
                    case "writeProject": {
                        const project = message.payload;
                        await (0, fileWriter_1.writeGeneratedProjectToWorkspace)(project);
                        panel.webview.postMessage({
                            type: "writeSuccess"
                        });
                        vscode.window.showInformationMessage("Project files created successfully.");
                        break;
                    }
                    default:
                        vscode.window.showWarningMessage(`Unknown message type: ${message.type}`);
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                if (message.type === "generateProject") {
                    panel.webview.postMessage({
                        type: "generationError",
                        payload: errorMessage
                    });
                }
                else if (message.type === "writeProject") {
                    panel.webview.postMessage({
                        type: "writeError",
                        payload: errorMessage
                    });
                }
                vscode.window.showErrorMessage(errorMessage);
            }
        }, undefined, context.subscriptions);
    });
    context.subscriptions.push(disposable);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map