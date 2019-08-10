import * as React from 'react';

// import { Temp } from '../entry/Temp';
import { cors, express, fs, helmet, is, log, PKG } from '../common';
import * as render from './render';
import { manifest } from '../manifest';

export * from '../types';

// import { HomePage } from '../pages/HomePage';

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

export function init(args: { bundle: string }) {
  /**
   * Create the express web server.
   */
  const app = express()
    .use(helmet())
    .use(cors());
  // .use(express.static(fs.resolve('./static')))
  // .use('/css', express.static(fs.resolve('./static/css')))
  // .use('/app', express.static(fs.resolve('./static/app')));

  (async () => {
    const url = 'https://platform.sfo2.digitaloceanspaces.com/modules/react.ssr/manifest.yml';
    const m = await manifest.cloud.pull({ url });
    console.log('-------------------------------------------');
    console.log(m);
    console.log('m.manifest', m.manifest);
  })();

  app.get('/', async (req, res) => {
    try {
      const el = <div>TEMP</div>;
      const entry = fs.join(args.bundle, 'index.html');

      const page = await manifest.bundle.fromFile(entry);
      console.log('manifest', page);

      const scripts = page.scripts.map(file => fs.join('app', file));
      // console.log('scripts', scripts);
      const html = render.toHtml({
        el,
        title: 'Hypersheet',
        scripts,
        stylesheets: ['/css/normalize.css', '/css/global.css'],
      });
      res.send(html);
    } catch (error) {
      console.log('-------------------------------------------');
      console.log('error.message', error.message);
    }
  });

  /**
   * Start the server listening for requests.
   */
  const start = async (options: { port?: number } = {}) => {
    const port = options.port || 3000;
    await app.listen({ port });

    const url = log.cyan(`http://localhost:${log.magenta(port)}`);
    log.info.gray(`\n👋  Running on ${url}`);
    log.info();
    log.info.gray(`   - version:   ${log.white(PKG.version)}`);
    log.info.gray(`   - package:   ${PKG.name}`);
    log.info.gray(`   - prod:      ${is.prod}`);
    log.info();
  };

  // Finish up.
  return { start };
}
