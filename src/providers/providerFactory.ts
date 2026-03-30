import * as vscode from "vscode";
import { DummyProvider } from "./dummyProvider";
import { LLMProvider } from "./llmProvider";
import { OpenAIProvider } from "./openaiProvider";

export function createProvider(): LLMProvider {
  const config = vscode.workspace.getConfiguration("projectGenerator");
  const providerName = config.get<string>("provider", "dummy");

  switch (providerName) {
    case "openai":
      return new OpenAIProvider();
    case "dummy":
    default:
      return new DummyProvider();
  }
}
