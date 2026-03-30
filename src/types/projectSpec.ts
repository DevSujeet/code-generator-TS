export interface ProjectSpec {
  projectName: string;
  appType: "backend";
  framework: "fastapi";
  language: "python";
  features: {
    auth: boolean;
    authorization: boolean;
    crud: boolean;
  };
  database: {
    type: "postgresql" | "sqlite";
  };
  config: {
    envManager: "pydantic-settings";
  };
}
