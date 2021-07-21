import { JsonMap } from '@platform/types';

type Res = VercelHttpResponse;

/**
 * Wrapper around the HTTP end-point.
 * https://vercel.com/docs/api
 */
export type VercelHttp = {
  teams: VercelHttpTeams;
  team(id: string): VercelHttpTeam;
};

export type VercelHttpTeams = {
  /**
   * https://vercel.com/docs/api#endpoints/teams/list-all-your-teams
   */
  list(): Promise<Res & { teams: VercelTeam[] }>;
};

/**
 * Operations on a team.
 */
export type VercelHttpTeam = {
  id: string;

  /**
   * https://vercel.com/docs/api#endpoints/teams/get-single-team-information
   */
  info(): Promise<Res & { team: VercelTeam }>;

  /**
   * https://vercel.com/docs/api#endpoints/projects
   */
  projects(options?: {
    limit?: number; // Limit the number of projects returned.
    since?: number; // The updatedAt point where the list should [start].
    until?: number; // The updatedAt point where the list should [end].
    search?: string; // Search projects by the name field.
  }): Promise<Res & { projects: VercelProject[] }>;

  project(name: string): VercelHttpTeamProject;
};

/**
 * Operations on a project within a team.
 */
export type VercelHttpTeamProject = {
  team: VercelHttpTeam;
  name: string;
  exists(): Promise<boolean>;

  /**
   * https://vercel.com/docs/api#endpoints/projects/get-a-single-project
   */
  info(): Promise<Res & { project: VercelProject }>;

  /**
   * https://vercel.com/docs/api#endpoints/projects/create-a-project
   */
  create(options?: { git?: VercelGitRepo }): Promise<Res & { project: VercelProject }>;

  /**
   * https://vercel.com/docs/api#endpoints/deployments/create-a-new-deployment
   */
  deploy(args: VercelDeployArgs): Promise<VercelDeployResponse>;
};

/**
 * https://vercel.com/docs/api#endpoints/deployments/create-a-new-deployment
 */
export type VercelDeployArgs = {
  dir: string; // Source directory.

  name: string; // A string with the name used in the deployment URL (max 52-chars).
  meta?: Record<string, string>; // Meta-data about the deployment.
  env?: Record<string, string>; // An object containing the deployment's environment variable names and values. Secrets can be referenced by prefixing the value with @.
  buildEnv?: Record<string, string>; // An object containing the deployment's environment variable names and values to be passed to Builds.
  functions?: Record<string, VercelFunctionConfig>; // A list of objects used to configure your Serverless Functions.
  routes?: Record<string, string>[]; // A list of routes objects used to rewrite paths to point towards other internal or external paths. For example; [{ "src": "/docs", "dest": "https://docs.example.com" }].
  regions?: string[]; // An array of the regions the deployment's Serverless Functions should be deployed to. For example, ["sfo", "bru"].
  public?: boolean;
  target?: 'staging' | 'production';
  alias?: string[];
};

/**
 * Common.
 */

export type VercelDeployResponse = VercelHttpResponse & {
  urls: { public: string; inspect: string };
  paths: string[];
};

export type VercelHttpResponse = {
  ok: boolean;
  status: number;
  error?: VercelHttpError;
};

export type VercelHttpError = {
  code: string;
  message: string;
};

/**
 * Vercel Data Objects.
 */
export type VercelTargetName = 'development' | 'preview' | 'production';
export type VercelReadyState =
  | 'INITIALIZING'
  | 'ANALYZING'
  | 'BUILDING'
  | 'DEPLOYING'
  | 'READY'
  | 'ERROR';

export type VercelGitRepo = {
  type: 'github' | 'gitlab' | 'bitbucket';
  repo: string;
};

export type VercelFunctionConfig = { memory: number };

export type VercelTeam = {
  id: string;
  name: string;
  slug: string;
  createdAt: number;
  updatedAt: number;
};

export type VercelProject = {
  id: string;
  name: string;
  accountId: string;
  createdAt: number;
  updatedAt: number;
  env: VercelEnvVariable[];
  targets: { production?: VercelTarget };
};

export type VercelEnvVariable = {
  id: string;
  type: 'plain' | 'encrypted' | 'secret' | 'system';
  key: string;
  value: string;
  target: VercelTargetName;
  gitBranch?: string;
  createdAt: number;
  updatedAt: number;
};

export type VercelTarget = {
  alias: string[];
  aliasAssigned: number;
  builds: VercelBuild[];
  createdAt: number;
  createdIn: number; // region.
  creator: { uid: string; email: string; username: string };
  deploymentHostname: string;
  forced: boolean;
  meta: JsonMap;
  plan: string; // 'pro' | 'free';
  private: boolean;
  readyState: VercelReadyState;
  target: VercelTargetName | string;
  type: string;
  url: string;
  teamId: string;
  userId: string;
  withCache: boolean;
};

export type VercelBuild = { use: string; src: string; config: JsonMap };
