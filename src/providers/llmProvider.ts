import { GeneratedProject } from "../types/generatedProject";
import { ProjectSpec } from "../types/projectSpec";

export interface LLMProvider {
  generateProject(spec: ProjectSpec, prompt: string): Promise<GeneratedProject>;
}
