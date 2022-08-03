import { log, t } from './common';

export const VercelLog = {
  /**
   * Display output before a deployment is pushed to the cloud.
   */
  async beforeDeploy(args: { info: t.VercelSourceBundleInfo; alias?: string; project?: string }) {
    const { info, alias, project } = args;

    log.info();
    log.info.gray('deploying:');
    log.info.gray(' • name:    ', log.white(info.name));
    log.info.gray(' • size:    ', info.files.toString());
    if (project) log.info.gray(' • project: ', project);
    if (alias) log.info.gray(' • alias:   ', log.green(alias));
    log.info.gray();

    return { info };
  },

  /**
   * Display output after a deployment is pushed to the cloud.
   */
  async afterDeploy(res: t.VercelHttpDeployResponse) {
    const { ok, status } = res;
    const { name, urls } = res.deployment;

    const logUrl = (url: string) => {
      const isVercel = url.includes('vercel');
      const text = isVercel ? log.gray(url) : log.white(url);
      log.info.gray(` • ${text}`);
      if (!isVercel) log.info.gray(` • ${text}?dev`);
    };

    log.info(ok ? log.green(status) : log.yellow(status));
    log.info.gray(name);
    logUrl(urls.inspect);
    urls.public.forEach((url) => logUrl(url));
    if (res.error) log.info.yellow('error', res.error);
    log.info.gray();
  },
};
