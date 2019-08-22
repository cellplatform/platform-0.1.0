import { Config } from '../config';
import { Manifest, Site } from '../manifest';
import { cli, http, log, util } from './common';

/**
 * Resets the cache on sites.
 */
export async function run(
  args: { config?: Config; manifest?: Manifest; site?: string | Site } = {},
) {
  const config = args.config || (await Config.create());
  const site = typeof args.site === 'string' ? args.site : args.site ? args.site.name : undefined;

  let manifest = args.manifest;

  if (!manifest) {
    log.info();
    await cli
      .tasks()
      .task('pull latest manifest', async e => {
        manifest = await config.manifest.local.ensureLatest({ minimal: true });
      })
      .run({ concurrent: true });
  }

  // Ensure the local manifest is up-to-date.
  if (!manifest) {
    log.error(`The manifest could not be found.`);
    return cli.exit(1);
  }

  // Create the list of domains.
  const sites = manifest.sites.filter(item => (site ? item.name === site : true));
  const domains = sites
    .map(site => site.domain.filter(domain => !util.isDomainRegex(domain)).map(domain => domain))
    .reduce((acc, next) => [...acc, ...next], [])
    .map(domain => util.stripHttp(domain))
    .filter(domain => domain !== 'localhost')
    .map(domain => `https://${domain}`);

  // Build the list of tasks.
  const tasks = cli.tasks();
  domains.forEach(domain => {
    const title = `${domain}`;
    tasks.task(title, async e => {
      const url = `${domain}/.manifest`;
      const res = await http.post(url);
      if (!res.ok) {
        e.error(`${res.status}: ${res.statusText}`);
      }
    });
  });

  log.info();
  log.info.cyan(`Resetting manifest cache 👌`);
  log.info();
  await tasks.run({ concurrent: true });
  log.info();
}
