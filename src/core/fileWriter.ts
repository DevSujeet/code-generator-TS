import * as vscode from "vscode";
import { GeneratedProject } from "../types/generatedProject";

export async function writeGeneratedProjectToWorkspace(project: GeneratedProject): Promise<void> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  if (!workspaceFolder) {
    throw new Error("Open a workspace folder before writing files.");
  }

  const rootUri = workspaceFolder.uri;

  for (const folder of project.folders) {
    const folderUri = vscode.Uri.joinPath(rootUri, folder);
    await vscode.workspace.fs.createDirectory(folderUri);
  }

  for (const file of project.files) {
    const fileUri = vscode.Uri.joinPath(rootUri, file.path);
    const contentBytes = Buffer.from(file.content, "utf8");
    await vscode.workspace.fs.writeFile(fileUri, contentBytes);
  }
}
