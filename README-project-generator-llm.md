# VS Code Extension with LLM Provider Wiring

This project is a Visual Studio Code extension that generates a starter backend project from a small form inside a webview.

The extension follows this flow:

1. The user opens the extension command in VS Code.
2. A webview form collects project inputs such as project name, auth, CRUD, and database choice.
3. The extension converts those inputs into a typed `ProjectSpec`.
4. A prompt is built from that spec.
5. A provider is selected using VS Code settings.
6. The selected provider generates a typed `GeneratedProject`.
7. The generated output is shown in the webview preview.
8. When the user accepts it, the extension writes the files into the current workspace.

---

## What this project does

This extension is designed as a simple but extensible foundation for an AI-powered code generator.

It already includes:

- a VS Code command to open the generator
- a webview UI for user input
- a typed internal project specification
- a prompt builder
- a provider abstraction for LLM integration
- a dummy provider for local testing
- an OpenAI provider scaffold
- response parsing and validation
- file writing into the current VS Code workspace

The current version is intentionally minimal so it is easy to understand and extend.

---

## High-level architecture

The code is split into clear layers:

- **UI layer**: webview form and message passing
- **Spec layer**: converts raw UI input into typed project configuration
- **Prompt layer**: builds prompt text from the project spec
- **Provider layer**: selects which LLM provider to use
- **Parser/validation layer**: validates the generated project response
- **Writer layer**: writes generated files into the workspace

This separation makes it easier to replace or improve one part without changing the whole extension.

---

## Project structure

```text
vscode-project-generator-llm/
├── .vscode/
│   ├── launch.json
│   └── settings.json
├── src/
│   ├── extension.ts
│   ├── core/
│   │   ├── fileWriter.ts
│   │   ├── parser.ts
│   │   ├── promptBuilder.ts
│   │   └── specBuilder.ts
│   ├── providers/
│   │   ├── dummyProvider.ts
│   │   ├── llmProvider.ts
│   │   ├── openaiProvider.ts
│   │   └── providerFactory.ts
│   ├── types/
│   │   ├── generatedProject.ts
│   │   └── projectSpec.ts
│   └── ui/
│       └── webview.ts
├── package.json
├── tsconfig.json
├── README.md
└── .vscodeignore
```

---

## File-by-file explanation

### `src/extension.ts`

This is the entry point of the extension.

It does the following:

- registers the command `projectGenerator.openGenerator`
- opens the webview panel
- listens for messages coming from the webview
- builds the project spec
- builds the prompt
- creates the provider
- requests project generation from the provider
- returns the result back to the webview
- writes accepted files to the workspace

This file acts as the controller for the whole extension.

### `src/ui/webview.ts`

This file defines the HTML and JavaScript used inside the VS Code webview.

It provides:

- input fields for project name, features, and database
- a Generate button
- a Write Files button
- a preview area
- status text
- message passing between the webview and the extension host

The webview sends messages like:

- `generateProject`
- `writeProject`

The extension host responds with messages like:

- `generationSuccess`
- `generationError`
- `writeSuccess`
- `writeError`

### `src/types/projectSpec.ts`

This file defines the internal typed structure for the user's project requirements.

Example fields include:

- project name
- app type
- framework
- language
- feature flags such as auth and CRUD
- database choice
- environment manager

This file is important because it gives the extension a stable internal contract before talking to any model.

### `src/types/generatedProject.ts`

This file defines the expected structure of generated output.

It includes:

- `GeneratedFile`
- `GeneratedProject`
- `GenerationResult`

The key output is `GeneratedProject`, which contains:

- `projectName`
- `folders`
- `files`
- `notes`

This structure is what the provider must return, whether the source is a dummy generator or an actual LLM.

### `src/core/specBuilder.ts`

This file converts raw webview input into a typed `ProjectSpec`.

Responsibilities:

- trims and validates the project name
- normalizes raw input into a consistent typed object
- applies the project defaults for v1

This layer is useful because raw UI input should not be sent directly to the provider.

### `src/core/promptBuilder.ts`

This file converts `ProjectSpec` into a prompt string.

Responsibilities:

- describe the generation requirements
- tell the model what stack to generate
- define output rules
- define the expected JSON schema

This keeps prompt creation separate from the UI and from provider logic.

### `src/core/parser.ts`

This file parses and validates the generated response.

Responsibilities:

- extract JSON from raw model output
- parse it into a `GeneratedProject`
- validate folders, files, and notes
- block unsafe file paths like absolute paths or `..`

It also includes `createDummyGeneratedProject()` for local end-to-end testing without calling an LLM.

### `src/core/fileWriter.ts`

This file writes the generated project into the currently open VS Code workspace.

Responsibilities:

- check that a workspace is open
- create required directories
- write files to the workspace using `vscode.workspace.fs`

This is the final step after the user accepts the preview.

### `src/providers/llmProvider.ts`

This file defines the provider interface.

```ts
export interface LLMProvider {
  generateProject(spec: ProjectSpec, prompt: string): Promise<GeneratedProject>;
}
```

This is important because it lets you swap providers without changing the rest of the extension.

### `src/providers/dummyProvider.ts`

This is a local provider used for testing.

It does not call any external API.
It simply returns a dummy FastAPI starter project.

Use this when:

- you want to test the extension flow
- you do not want to use an API key yet
- you want predictable results during development

### `src/providers/openaiProvider.ts`

This file contains the OpenAI-backed provider.

Responsibilities:

- read OpenAI settings from VS Code configuration
- call the API using `fetch`
- send the built prompt
- receive the model output
- parse the generated JSON into a `GeneratedProject`

This is the provider to extend when you want real AI-generated projects.

### `src/providers/providerFactory.ts`

This file selects which provider to use.

It reads:

- `projectGenerator.provider`

Then returns either:

- `DummyProvider`
- `OpenAIProvider`

This keeps provider selection centralized.

---

## Runtime flow

The runtime flow looks like this:

```text
User opens command
    ↓
Webview form opens
    ↓
User enters project inputs
    ↓
Webview sends raw input to extension host
    ↓
specBuilder creates ProjectSpec
    ↓
promptBuilder creates prompt
    ↓
providerFactory selects provider
    ↓
Provider generates GeneratedProject
    ↓
parser validates output
    ↓
Webview shows preview
    ↓
User clicks Write Files
    ↓
fileWriter writes project to workspace
```

---

## Settings used by this extension

The extension reads settings from VS Code configuration.

### Available settings

- `projectGenerator.provider`
- `projectGenerator.openai.apiKey`
- `projectGenerator.openai.model`
- `projectGenerator.openai.baseUrl`

### Example `.vscode/settings.json`

```json
{
  "projectGenerator.provider": "openai",
  "projectGenerator.openai.apiKey": "your-api-key-here",
  "projectGenerator.openai.model": "gpt-5",
  "projectGenerator.openai.baseUrl": "https://api.openai.com/v1"
}
```

### Recommended development setup

For local testing, start with:

```json
{
  "projectGenerator.provider": "dummy"
}
```

Then switch to `openai` later.

---

## How to run the extension locally

### 1. Open the project folder in VS Code

Open the root folder of the extension project, not an individual file.

### 2. Install dependencies

```bash
npm install
npm run compile
```

### 3. Add debug configuration

Create this file if it is missing:

`.vscode/launch.json`

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run Extension",
      "type": "extensionHost",
      "request": "launch",
      "runtimeExecutable": "${execPath}",
      "args": ["--extensionDevelopmentPath=${workspaceFolder}"]
    }
  ]
}
```

### 4. Start debugging

On Mac:

- use `Fn + F5`, or
- open Run and Debug and choose `Run Extension`, or
- run `Debug: Select and Start Debugging` from the Command Palette

A new **Extension Development Host** window will open.

### 5. Run the command

In the new window:

- press `Cmd + Shift + P`
- run `Project Generator: Open`

### 6. Generate project

- fill the form
- click **Generate Project**
- review preview
- click **Write Files**

---

## How message passing works

The webview and extension host cannot call each other directly.
They communicate with `postMessage`.

### Webview → Extension host

The webview sends:

```js
vscode.postMessage({
  type: "generateProject",
  payload: {
    projectName: "...",
    auth: true,
    authorization: false,
    crud: true,
    database: "postgresql"
  }
});
```

### Extension host → Webview

The extension sends back:

```ts
panel.webview.postMessage({
  type: "generationSuccess",
  payload: generatedProject
});
```

This message-based approach is the standard VS Code webview pattern.

---

## How providers work

The extension uses a provider abstraction so you can add more LLMs later.

Current providers:

- `dummy`
- `openai`

To add another provider later, create a new class that implements `LLMProvider`.

Example future providers:

- Anthropic
- Azure OpenAI
- local Ollama
- custom backend API

You would then update `providerFactory.ts`.

---

## Why `ProjectSpec` and `GeneratedProject` matter

These two typed contracts are the backbone of the design.

### `ProjectSpec`
Represents user intent in a structured form.

### `GeneratedProject`
Represents generated artifacts in a structured form.

This gives you:

- cleaner code
- better validation
- easier testing
- easier provider replacement
- safer file writing

Without these contracts, the extension becomes much harder to maintain.

---

## Current limitations

This version is intentionally simple.

Current limitations include:

- backend generation only
- framework fixed to FastAPI
- no per-file tree preview UI yet
- no overwrite conflict dialog
- no schema validator library like `zod`
- no secure secret storage for API keys
- no multi-step repair flow if model output is invalid
- no support for existing-project modification yet

---

## Recommended next improvements

### 1. Add `zod` validation
Use a schema library to validate `GeneratedProject` more robustly.

### 2. Add file tree preview
Show a file explorer-like preview instead of raw JSON.

### 3. Add overwrite handling
Warn users before replacing existing files.

### 4. Store API key securely
Move from settings-based API key storage to VS Code Secret Storage.

### 5. Add more providers
Support Azure OpenAI, Anthropic, Ollama, or your own backend.

### 6. Add regeneration controls
Allow regenerating only one file instead of regenerating the whole project.

### 7. Support more stacks
Expand beyond FastAPI once the pipeline is stable.

---

## Troubleshooting

### Error: Markdown debug prompt appears
You probably pressed F5 while a Markdown file was focused or there was no extension debug config.
Use `.vscode/launch.json` and choose `Run Extension`.

### Error: command not found
Make sure the extension compiled successfully and is running in the Extension Development Host.

### Error: no workspace open
Open a folder in the Extension Development Host before clicking **Write Files**.

### Error: OpenAI API key is missing
Set `projectGenerator.openai.apiKey` in VS Code settings.

### Error: provider still uses dummy
Check that `projectGenerator.provider` is set to `openai`, then reload the VS Code window.

---

## Summary

This project is a good starter architecture for an AI-powered VS Code code generator.

The most important design idea is this pipeline:

```text
User Input
→ ProjectSpec
→ Prompt
→ Provider
→ GeneratedProject
→ Preview
→ Write Files
```

That structure keeps the project simple now and flexible later.
