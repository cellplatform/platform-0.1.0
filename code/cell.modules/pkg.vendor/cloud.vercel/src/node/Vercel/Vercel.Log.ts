import { log, t } from './common';

export const VercelLog = {
  async beforeDeploy(deployment: t.VercelDeploy, options: { alias?: string } = {}) {
    const { alias } = options;
    const info = await deployment.info();

    log.info();
    log.info.gray('deploying:');
    log.info.gray(' • name:  ', log.white(info.name));
    log.info.gray(' • size:  ', info.files.toString());
    log.info.gray(' • alias: ', alias ? alias : log.gray('<undefined>'));
    log.info.gray();

    return { info };
  },

  afterDeploy(res: t.VercelHttpDeployResponse) {
    const { ok, status } = res;
    const { name, urls } = res.deployment;

    const logUrl = (url: string) => {
      const text = url.includes('vercel') ? log.gray(url) : log.white(url);
      log.info.gray(' • ', text);
    };

    log.info(ok ? log.green(status) : log.yellow(status));
    log.info.gray(name);
    logUrl(urls.inspect);
    urls.public.forEach((url) => logUrl(url));
    if (res.error) log.info.yellow('error', res.error);
    log.info.gray();
  },
};
