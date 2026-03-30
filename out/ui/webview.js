"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWebviewContent = getWebviewContent;
function getWebviewContent(webview) {
    const nonce = getNonce();
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    http-equiv="Content-Security-Policy"
    content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';"
  />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Project Generator</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 16px;
      color: var(--vscode-editor-foreground);
      background: var(--vscode-editor-background);
    }
    .field {
      margin-bottom: 12px;
    }
    label {
      display: block;
      margin-bottom: 6px;
      font-weight: 600;
    }
    input[type="text"], select {
      width: 100%;
      padding: 8px;
      box-sizing: border-box;
    }
    .checkbox-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    button {
      padding: 10px 16px;
      cursor: pointer;
      margin-right: 8px;
    }
    pre {
      background: rgba(127,127,127,0.12);
      padding: 12px;
      overflow: auto;
      border-radius: 6px;
    }
    .section {
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <h2>Project Generator</h2>

  <div class="field">
    <label for="projectName">Project Name</label>
    <input id="projectName" type="text" value="sample-fastapi-app" />
  </div>

  <div class="field">
    <label>Features</label>
    <div class="checkbox-row">
      <label><input id="auth" type="checkbox" /> Auth</label>
      <label><input id="authorization" type="checkbox" /> Authorization</label>
      <label><input id="crud" type="checkbox" checked /> CRUD</label>
    </div>
  </div>

  <div class="field">
    <label for="database">Database</label>
    <select id="database">
      <option value="postgresql">PostgreSQL</option>
      <option value="sqlite">SQLite</option>
    </select>
  </div>

  <div class="field">
    <button id="generateBtn">Generate Project</button>
    <button id="writeBtn" disabled>Write Files</button>
  </div>

  <div class="section">
    <h3>Status</h3>
    <div id="status">Idle</div>
  </div>

  <div class="section">
    <h3>Preview</h3>
    <pre id="preview">No project generated yet.</pre>
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    let latestProject = null;

    const projectNameEl = document.getElementById("projectName");
    const authEl = document.getElementById("auth");
    const authorizationEl = document.getElementById("authorization");
    const crudEl = document.getElementById("crud");
    const databaseEl = document.getElementById("database");
    const generateBtn = document.getElementById("generateBtn");
    const writeBtn = document.getElementById("writeBtn");
    const statusEl = document.getElementById("status");
    const previewEl = document.getElementById("preview");

    generateBtn.addEventListener("click", () => {
      statusEl.textContent = "Generating...";
      writeBtn.disabled = true;

      vscode.postMessage({
        type: "generateProject",
        payload: {
          projectName: projectNameEl.value,
          auth: authEl.checked,
          authorization: authorizationEl.checked,
          crud: crudEl.checked,
          database: databaseEl.value
        }
      });
    });

    writeBtn.addEventListener("click", () => {
      if (!latestProject) return;
      statusEl.textContent = "Writing files...";
      vscode.postMessage({
        type: "writeProject",
        payload: latestProject
      });
    });

    window.addEventListener("message", (event) => {
      const message = event.data;

      switch (message.type) {
        case "generationSuccess":
          latestProject = message.payload;
          previewEl.textContent = JSON.stringify(message.payload, null, 2);
          statusEl.textContent = "Project generated successfully.";
          writeBtn.disabled = false;
          break;

        case "generationError":
          latestProject = null;
          previewEl.textContent = message.payload;
          statusEl.textContent = "Generation failed.";
          writeBtn.disabled = true;
          break;

        case "writeSuccess":
          statusEl.textContent = "Files written to workspace.";
          break;

        case "writeError":
          statusEl.textContent = "Write failed: " + message.payload;
          break;
      }
    });
  </script>
</body>
</html>
`;
}
function getNonce() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let value = "";
    for (let i = 0; i < 32; i++) {
        value += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return value;
}
//# sourceMappingURL=webview.js.map