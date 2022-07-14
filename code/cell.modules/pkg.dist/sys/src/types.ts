type DirPath = string;

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

export type DeployRewriteMap = { source: string; domain: string };

/**
 * [vercel.json] file.
 * https://vercel.com/docs/project-configuration
 */
export type VercelJson = {
  redirects?: VercelJsonRedirect[];
  rewrites?: VercelJsonRewrite[];
};
export type VercelJsonRedirect = { source: string; destination: string };
export type VercelJsonRewrite = { source: string; destination: string };
