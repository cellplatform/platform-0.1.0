type Path = string;
type DirPath = string;
type DomainUrl = string;
type RedirectPath = string;

/**
 * Deployment configuration.
 */
export type DeployConfig = {
  team: string;
  project: string;
  alias: string;
  rewrites?: DeployRewriteMap[];
  copy?: DirPath;
};

export type DeployRewriteMap = { redirect?: RedirectPath; match: Path; use: DomainUrl };
