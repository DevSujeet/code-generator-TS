import * as vscode from "vscode";
import { parseGeneratedProject } from "../core/parser";
import { GeneratedProject } from "../types/generatedProject";
import { ProjectSpec } from "../types/projectSpec";
import { LLMProvider } from "./llmProvider";

interface OpenAIResponsesApiResponse {
  output_text?: string;
}

export class OpenAIProvider implements LLMProvider {
  async generateProject(spec: ProjectSpec, prompt: string): Promise<GeneratedProject> {
    const config = vscode.workspace.getConfiguration("projectGenerator");
    const apiKey = config.get<string>("openai.apiKey")?.trim();
    const model = config.get<string>("openai.model", "gpt-5");
    const baseUrl = config.get<string>("openai.baseUrl", "https://api.openai.com/v1").replace(/\/$/, "");

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

    const data = (await response.json()) as OpenAIResponsesApiResponse;

    if (!data.output_text) {
      throw new Error("OpenAI response did not contain output_text.");
    }

    return parseGeneratedProject(data.output_text);
  }
}
