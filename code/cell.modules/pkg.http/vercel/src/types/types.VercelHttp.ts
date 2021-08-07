import { t } from './common';

type Uid = string;
type Timestamp = number; // An Integer representing a date in milliseconds since the UNIX epoch.
type Res = VercelHttpResponse;

export type VercelMeta = { key: string; value: string };

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
  id: Uid;

  /**
   * https://vercel.com/docs/api#endpoints/teams/get-single-team-information
   */
  info(): Promise<Res & { team: VercelTeam }>;

  /**
   * https://vercel.com/docs/api#endpoints/projects
   */
  projects(options?: {
    limit?: number; // Limit the number of projects returned.
    since?: Timestamp; // The updatedAt point where the list should [start].
    until?: Timestamp; // The updatedAt point where the list should [end].
    search?: string; // Search projects by the name field.
  }): Promise<Res & { projects: VercelProject[] }>;

  project(name: string): VercelHttpTeamProject;

  /**
   * https://vercel.com/docs/api#endpoints/deployments/list-deployments
   */
  deployments(options?: {
    limit?: number; // Maximum number of deployments to list from a request. (default: 5, max: 100)
    from?: Timestamp; // Get the deployment created after this Date timestamp. (default: current time)
    projectId?: Uid; // Filter deployments from the given project identifier.
    filter?: VercelMeta | VercelMeta[]; // meta-[KEY]. Filter deployments by the given meta key value pairs. e.g., meta-githubDeployment=1.
  }): Promise<Res & { deployments: VercelListDeployment[] }>;

  deployment(url: string): VercelHttpTeamDeployment;
};

/**
 * Operations on a single project within a team.
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
 * Operations on a single deployment within a team.
 */
export type VercelHttpTeamDeployment = {
  team: VercelHttpTeam;
  url: string; // "<id>.vercel.app"
  exists(): Promise<boolean>;

  /**
   * https://vercel.com/docs/api#endpoints/deployments/get-a-single-deployment
   */
  info(): Promise<Res & { deployment: VercelDeployment }>;

  /**
   * https://vercel.com/docs/api#endpoints/deployments/list-deployment-files
   */
  files(): Promise<Res & { files: VercelHttpFiles }>;
};

/**
 * Operations for inspecting and save a set of deployment files.
 */
export type VercelHttpFiles = {
  list: t.VercelDeploymentFile[];
  save(dir: string): Promise<VercelSaveFileResult>;
};

export type VercelSaveFileResult = { ok: boolean; errors: VercelSaveFileError[] };
export type VercelSaveFileError = {
  message: string;
  dir: string;
  file: { id: Uid; name: string };
  url: string;
};

/**
 * https://vercel.com/docs/api#endpoints/deployments/create-a-new-deployment
 */
export type VercelDeployArgs = {
  dir: string; // Source directory.
  name?: string; // A string with the name used in the deployment URL (max 52-chars). Derived from module [namespace@version] if ommited.
  env?: Record<string, string>; // An object containing the deployment's environment variable names and values. Secrets can be referenced by prefixing the value with @.
  buildEnv?: Record<string, string>; // An object containing the deployment's environment variable names and values to be passed to Builds.
  functions?: Record<string, VercelFunctionConfig>; // A list of objects used to configure your Serverless Functions.
  routes?: Record<string, string>[]; // A list of routes objects used to rewrite paths to point towards other internal or external paths. For example; [{ "src": "/docs", "dest": "https://docs.example.com" }].
  regions?: string[]; // An array of the regions the deployment's Serverless Functions should be deployed to. For example, ["sfo", "bru"].
  public?: boolean; // A boolean representing if the deployment is public or not. By default this is false.
  target?: 'staging' | 'production';
  alias?: string | string[];
};

/**
 * Common.
 */

export type VercelDeployResponse = VercelHttpResponse & {
  deployment: { id: Uid; team: string; project: string; regions: string[] };
  paths: string[];
  meta: VercelDeployMeta;
  urls: { public: string; inspect: string };
};

export type VercelDeployMeta = VercelDeployMetaModule | VercelDeployMetaPlainFiles;
export type VercelDeployMetaModule = t.ModuleManifestInfo & {
  kind: 'bundle:code/module';
  modulehash: string; // [manifest].hash.module
  fileshash: string; //  [manifest].hash.files
  bytes: string;
};
export type VercelDeployMetaPlainFiles = {
  kind: 'bundle:plain/files';
  bytes: string;
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
  | 'QUEUED'
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
  id: Uid;
  name: string;
  slug: string;
  createdAt: number;
  updatedAt: number;
};

export type VercelProject = {
  id: Uid;
  name: string;
  accountId: Uid;
  createdAt: number;
  updatedAt: number;
  env: VercelEnvVariable[];
  targets: { production?: VercelTarget };
};

export type VercelEnvVariable = {
  id: Uid;
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
  creator: { uid: Uid; email: string; username: string };
  deploymentHostname: string;
  forced: boolean;
  meta: t.JsonMap;
  plan: string; // 'pro' | 'free';
  private: boolean;
  readyState: VercelReadyState;
  target: VercelTargetName | string;
  type: string;
  url: string;
  teamId: Uid;
  userId: Uid;
  withCache: boolean;
};

export type VercelBuild = { use: string; src: string; config: t.JsonMap };

export type VercelListDeployment = {
  uid: Uid;
  name: string;
  url: string;
  created: Timestamp;
  creator: { uid: Uid; email: string; username: string };
  state: VercelReadyState;
  meta: t.JsonMap;
  target: VercelTargetName | string;
  aliasError: null | VercelHttpError;
  aliasAssigned: Timestamp;
};

export type VercelDeployment = {
  id: Uid;
  url: string | null; // A string with the unique URL of the deployment. If it hasn't finished uploading (is incomplete), the value will be null.
  name: string;
  meta: t.JsonMap; // An object containing the deployment's metadata
  plan: string; // The pricing plan the deployment was made under. eg 'pro' | 'free';
  regions?: string[]; // The regions the deployment exists in, eg. ["sfo1"].
  routes?: Record<string, string>[]; // A list of routes objects used to rewrite paths to point towards other internal or external paths. For example; [{ "src": "/docs", "dest": "https://docs.example.com" }].
  functions?: Record<string, VercelFunctionConfig>; // A list of objects used to configure your Serverless Functions.
  public?: boolean; // A boolean representing if the deployment is public or not. By default this is false.
  ownerId: string; // The unique ID of the user or team the deployment belongs to.
  readyState: VercelReadyState;
  createdAt: Timestamp;
  createdIn: string; // The region where the deployment was first created, e.g. "sfo1".
  env: VercelEnvVariable[]; // The keys of the environment variables that were assigned during runtime.
  build: { env: VercelEnvVariable[] }; // The keys of the environment variables that were assigned during the build phase.
  target: VercelTargetName | string; // If defined, either staging if a staging alias in the format <project>.<team>.vercel.app was assigned upon creation, or production if the aliases from alias were assigned.
  alias: string[]; // A list of all the aliases (default aliases, staging aliases and production aliases) that were assigned upon deployment creation.
  aliasError: null | VercelHttpError; // An object that will contain a code and a message when the aliasing fails, otherwise the value will be null.
  aliasAssigned: Timestamp;
};

export type VercelDeploymentFile = {
  name: string;
  type: 'file' | 'directory';
  uid: Uid;
  children: VercelDeploymentFile[];
};
