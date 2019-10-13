/**
 * A project schema.
 */
export type IProject<M extends IProjectMeta = IProjectMeta> = {
  meta: M;
};

/**
 * Meta data about a project.
 */
export type IProjectMeta = {
  name: string;
};
