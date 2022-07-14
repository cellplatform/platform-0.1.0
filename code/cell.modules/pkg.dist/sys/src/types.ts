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

/**
 * [vercel.json] file.
 * https://vercel.com/docs/project-configuration
 */
export type VercelJson = {
  cleanUrls?: boolean;
  trailingSlash?: boolean;
  redirects?: VercelJsonRedirect[];
  rewrites?: VercelJsonRewrite[];
};
export type VercelJsonRedirect = { source: string; destination: string };
export type VercelJsonRewrite = { source: string; destination: string };
