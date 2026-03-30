import { createDummyGeneratedProject } from "../core/parser";
import { GeneratedProject } from "../types/generatedProject";
import { ProjectSpec } from "../types/projectSpec";
import { LLMProvider } from "./llmProvider";

export class DummyProvider implements LLMProvider {
  async generateProject(spec: ProjectSpec, _prompt: string): Promise<GeneratedProject> {
    return createDummyGeneratedProject(spec);
  }
}
