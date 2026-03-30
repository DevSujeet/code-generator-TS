# Project Generator Extension with LLM Provider

A VS Code extension scaffold that:
- collects project requirements in a webview
- converts them into a typed `ProjectSpec`
- builds an LLM prompt
- supports pluggable providers through `LLMProvider`
- parses a typed `GeneratedProject`
- previews files before writing to the workspace

## Supported providers
- `dummy` (default)
- `openai`

## Configure OpenAI in VS Code settings
- cmd + , to open vscode settings
- search projectgenerator
Set:
- `projectGenerator.provider` = `openai`
- `projectGenerator.openai.apiKey` = your API key
- optional: `projectGenerator.openai.model`
- optional: `projectGenerator.openai.baseUrl`

## Run locally
make sure you have launch.json in .vscode/launch.json at root level/ not inside src
```bash
npm install
npm run compile
```

Press `F5` in VS Code to launch the Extension Development Host.
or
goto run and debug -> run extension
