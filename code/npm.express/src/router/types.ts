import { t } from '../common';

export type GetNpmRouteContext = () => Promise<INpmRouteContext>;

export type INpmRouteContext = {
  name: string;
  downloadDir: string;
  prerelease: t.NpmPrerelease;
};
