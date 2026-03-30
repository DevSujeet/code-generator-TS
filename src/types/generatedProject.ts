export interface GeneratedFile {
  path: string;
  content: string;
}

export interface GeneratedProject {
  projectName: string;
  folders: string[];
  files: GeneratedFile[];
  notes: string[];
}

export interface GenerationResult {
  success: boolean;
  project?: GeneratedProject;
  errors?: string[];
  warnings?: string[];
}
