export type GetNpmRouteContext = () => Promise<INpmRouteContext>;

export type INpmRouteContext = {
  dir: string;
  name: string;
};
