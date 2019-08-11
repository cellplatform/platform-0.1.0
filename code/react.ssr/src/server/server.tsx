import { cors, express, fs, helmet, is, log } from '../common';
import * as router from './router';

const PKG = require(fs.resolve('package.json')) as { name: string; version: string };

export * from '../types';

/**
 * [Express]
 */

/**
 * TEMP
 */
// app.get('/', (req, res) => {
//   const el = <div>TEMP</div>;
//   const scripts = manifest.scripts.map(file => fs.join('app', file));
//   const html = render.toHtml({
//     el,
//     title: 'Hypersheet',
//     scripts,
//     stylesheets: ['/css/normalize.css', '/css/global.css'],
//   });
//   res.send(html);
// });

/**
 * [Start]
 */

export function init(args: { manifestUrl: string; apiSecret?: string }) {
  const { manifestUrl, apiSecret } = args;

  /**
   * Create the express web server.
   */
  const app = express()
    .use(helmet())
    .use(cors())
    .use(router.init({ manifestUrl, apiSecret }));

  // .use(express.static(fs.resolve('./static')))
  // .use('/css', express.static(fs.resolve('./static/css')))
  // .use('/app', express.static(fs.resolve('./static/app')));

  // (async () => {
  //   const url = 'https://platform.sfo2.digitaloceanspaces.com/modules/react.ssr/manifest.yml';

  //   const m = await Manifest.get({ url, baseUrl: url });

  //   console.log('m', m);
  //   console.log('m.manifest', m);

  //   const site = m.site('localhost:3000');

  //   if (site) {
  //     console.log('site.files', site.files);
  //     console.log('site.dirs', site.dirs);
  //   }

  //   const route = site ? site.route('/foo') : undefined;
  //   if (route) {
  //     const e = await route.entry();
  //     console.log('-------------------------------------------');
  //     console.log('e', e);
  //   }
  //   // const entry = await site.e

  //   // // const s1 = m.route('localhost');
  //   // const s2 = m.route({ domain: 'localhost:3000', path: '/foo' });
  //   // //
  //   // // console.log('s1', s1);
  //   // console.log('s2', s2);
  //   // if (s2) {
  //   //   const e = await s2.entry();
  //   //   console.log('-------------------------------------------');
  //   //   console.log('e', e);
  //   // }
  // })();

  // app.get('/', async (req, res) => {
  //   try {
  //     // const el = <div>TEMP</div>;
  //     // const entry = fs.join(args.bundle, 'index.html');
  //     res.send({ foo: 123 });

  //     // const page = await manifest.bundle.fromFile(entry);
  //     // console.log('manifest', page);

  //     // const scripts = page.scripts.map(file => fs.join('app', file));
  //     // // console.log('scripts', scripts);
  //     // const html = render.toHtml({
  //     //   el,
  //     //   title: 'Hypersheet',
  //     //   scripts,
  //     //   stylesheets: ['/css/normalize.css', '/css/global.css'],
  //     // });
  //     // res.send(html);
  //   } catch (error) {
  //     console.log('-------------------------------------------');
  //     console.log('error.message', error.message);
  //   }
  // });

  /**
   * Start the server listening for requests.
   */
  const start = async (options: { port?: number; silent?: boolean } = {}) => {
    const port = options.port || 3000;
    await app.listen({ port });

    if (!options.silent) {
      const url = log.cyan(`http://localhost:${log.magenta(port)}`);
      log.info();
      log.info.gray(`👋  Running on ${url}`);
      log.info();
      log.info.gray(`   - version:   ${log.white(PKG.version)}`);
      log.info.gray(`   - package:   ${PKG.name}`);
      log.info.gray(`   - prod:      ${is.prod}`);
      log.info();
    }
  };

  // Finish up.
  return { start };
}
