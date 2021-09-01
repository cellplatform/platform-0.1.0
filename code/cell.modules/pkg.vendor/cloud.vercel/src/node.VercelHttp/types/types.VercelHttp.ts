import { t } from './common';

type Id = string;
type Timestamp = number; // An Integer representing a date in milliseconds since the UNIX epoch.
type Res = VercelHttpResponse;
type Sha1 = string;
type Mime = string;
type Milliseconds = number;

export type VercelMeta = { key: string; value: string };

export type VercelHttpResponse = {
  ok: boolean;
  status: number;
  error?: t.VercelHttpError;
};

/**
 * Wrapper around the HTTP end-point.
 * https://vercel.com/docs/api
 */
export type VercelHttp = {
  version: number;
  teams: VercelHttpTeams;
  team(id: string): VercelHttpTeam;
};

export type VercelHttpTeams = {
  /**
   * https://vercel.com/docs/api#endpoints/teams/list-all-your-teams
   */
  list(): Promise<Res & { teams: t.VercelTeam[] }>;
};

/**
 * Operations on a team.
 */
export type VercelHttpTeam = {
  id: Id;

  /**
   * https://vercel.com/docs/api#endpoints/teams/get-single-team-information
   */
  info(): Promise<Res & { team: t.VercelTeam }>;

  /**
   * https://vercel.com/docs/api#endpoints/projects
   */
  projects(options?: {
    limit?: number; // Limit the number of projects returned.
    since?: Timestamp; // The updatedAt point where the list should [start].
    until?: Timestamp; // The updatedAt point where the list should [end].
    search?: string; // Search projects by the name field.
  }): Promise<Res & { projects: t.VercelProject[] }>;

  project(name: string): VercelHttpTeamProject;

  /**
   * https://vercel.com/docs/api#endpoints/deployments/list-deployments
   */
  deployments(options?: {
    limit?: number; // Maximum number of deployments to list from a request. (default: 5, max: 100)
    from?: Timestamp; // Get the deployment created after this Date timestamp. (default: current time)
    projectId?: Id; // Filter deployments from the given project identifier.
    filter?: VercelMeta | VercelMeta[]; // meta-[KEY]. Filter deployments by the given meta key value pairs. e.g., meta-githubDeployment=1.
  }): Promise<Res & { deployments: t.VercelListDeployment[] }>;

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
  info(): Promise<Res & { project: t.VercelProject }>;

  /**
   * https://vercel.com/docs/api#endpoints/projects/create-a-project
   */
  create(options?: { git?: t.VercelGitRepo }): Promise<Res & { project: t.VercelProject }>;

  /**
   * https://vercel.com/docs/api#endpoints/deployments/create-a-new-deployment
   */
  deploy(args: VercelHttpDeployArgs): Promise<VercelHttpDeployResponse>;
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
  info(): Promise<Res & { deployment: t.VercelDeployment }>;

  /**
   * https://vercel.com/docs/api#endpoints/deployments/list-deployment-files
   */
  files(): Promise<Res & { files: VercelHttpDeploymentFiles }>;
};

/**
 * Upload deployment files.
 * https://vercel.com/docs/api#endpoints/deployments/upload-deployment-files
 */
export type VercelHttpUploadFiles = {
  post(input: string | Uint8Array): Promise<VercelHttpUploadPostResponse>;
  upload(
    dir: string,
    options?: { filter?: (path: string) => boolean; batch?: number },
  ): Promise<VercelHttpUploadResponse>;
};

export type VercelHttpUploadPostResponse = t.VercelHttpResponse & {
  digest: Sha1;
  contentType: Mime;
  contentLength: number;
  elapsed: Milliseconds;
};

export type VercelHttpUploadResponse = t.VercelHttpResponse & {
  elapsed: Milliseconds;
  total: { files: number; failed: number };
  files: VercelHttpUploadResponseItem[];
};

export type VercelHttpUploadResponseItem = {
  ok: boolean;
  status: number;
  contentType: Mime;
  file: t.VercelFileUpload;
  error?: t.VercelHttpError;
  elapsed: Milliseconds;
};

/**
 * Operations for inspecting and saving a set of deployment files.
 */
export type VercelHttpDeploymentFiles = {
  list: t.VercelDeploymentFile[];
  pull(dir: string): Promise<VercelHttpFilesPullResult>;
};

export type VercelHttpFilesPullResult = { ok: boolean; errors: VercelHttpFilesPullError[] };
export type VercelHttpFilesPullError = {
  message: string;
  dir: string;
  file: { id: Id; name: string };
  url: string;
};

/**
 * Deploy
 */

/**
 * https://vercel.com/docs/api#endpoints/deployments/create-a-new-deployment
 */
export type VercelHttpDeployArgs = {
  dir: string; // Source directory.
  name?: string; // A string with the name used in the deployment URL (max 52-chars). Derived from module [namespace@version] if ommited.
  env?: Record<string, string>; // An object containing the deployment's environment variable names and values. Secrets can be referenced by prefixing the value with @.
  buildEnv?: Record<string, string>; // An object containing the deployment's environment variable names and values to be passed to Builds.
  functions?: Record<string, t.VercelFunctionConfig>; // A list of objects used to configure your Serverless Functions.
  routes?: Record<string, string>[]; // A list of routes objects used to rewrite paths to point towards other internal or external paths. For example; [{ "src": "/docs", "dest": "https://docs.example.com" }].
  regions?: string[]; // An array of the regions the deployment's Serverless Functions should be deployed to. For example, ["sfo", "bru"].
  public?: boolean; // A boolean representing if the deployment is public or not. By default this is false.
  target?: 'staging' | 'production';
  alias?: string | string[];
};

export type VercelHttpDeployResponse = VercelHttpResponse & {
  deployment: { id: Id; team: string; project: string; regions: string[] };
  paths: string[];
  meta: VercelHttpDeployMeta;
  urls: { public: string; inspect: string };
};

export type VercelHttpDeployMeta = VercelHttpDeployMetaModule | VercelHttpDeployMetaPlainFiles;
export type VercelHttpDeployMetaModule = t.ModuleManifestInfo & {
  kind: 'bundle:code/module';
  modulehash: string; // [manifest].hash.module
  fileshash: string; //  [manifest].hash.files
  bytes: string;
};
export type VercelHttpDeployMetaPlainFiles = {
  kind: 'bundle:plain/files';
};
