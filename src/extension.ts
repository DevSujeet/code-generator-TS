import * as vscode from "vscode";
import { buildPrompt } from "./core/promptBuilder";
import { writeGeneratedProjectToWorkspace } from "./core/fileWriter";
import { buildProjectSpec } from "./core/specBuilder";
import { createProvider } from "./providers/providerFactory";
import { GeneratedProject } from "./types/generatedProject";
import { getWebviewContent } from "./ui/webview";

export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand(
    "projectGenerator.openGenerator",
    async () => {
      const panel = vscode.window.createWebviewPanel(
        "projectGenerator",
        "Project Generator",
        vscode.ViewColumn.One,
        {
          enableScripts: true
        }
      );

      panel.webview.html = getWebviewContent(panel.webview);

      panel.webview.onDidReceiveMessage(
        async (message) => {
          try {
            switch (message.type) {
              case "generateProject": {
                const spec = buildProjectSpec(message.payload);
                const prompt = buildPrompt(spec);
                const provider = createProvider();

                const generatedProject = await provider.generateProject(spec, prompt);

                panel.webview.postMessage({
                  type: "generationSuccess",
                  payload: generatedProject
                });
                break;
              }

              case "writeProject": {
                const project = message.payload as GeneratedProject;
                await writeGeneratedProjectToWorkspace(project);

                panel.webview.postMessage({
                  type: "writeSuccess"
                });

                vscode.window.showInformationMessage("Project files created successfully.");
                break;
              }

              default:
                vscode.window.showWarningMessage(`Unknown message type: ${message.type}`);
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";

            if (message.type === "generateProject") {
              panel.webview.postMessage({
                type: "generationError",
                payload: errorMessage
              });
            } else if (message.type === "writeProject") {
              panel.webview.postMessage({
                type: "writeError",
                payload: errorMessage
              });
            }

            vscode.window.showErrorMessage(errorMessage);
          }
        },
        undefined,
        context.subscriptions
      );
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate(): void {}
