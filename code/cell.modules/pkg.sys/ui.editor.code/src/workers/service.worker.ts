const ctx: ServiceWorker = self as any;

import { BundleManifest } from '@platform/cell.types/lib/types.Compiler';

(async () => {
  return; // TEMP 🐷

  const URL =
    'http://localhost:8080/cell:ckgu71a83000dl0et1676dq4y:A1/file/sample/index.json?expires=10m';

  const URL2 =
    'https://platform.sfo2.cdn.digitaloceanspaces.com/tmp/test.http/ns.ckgu71a83000dl0et1676dq4y/p3eft4a?AWSAccessKeyId=HGTXY6PUUBB6GL6RBD4I&Expires=1605594553&Signature=Q%2Bzbm3C87DtR5psYFtfg8MvEGf4%3D';

  const Manifest = async (url: string) => {
    const payload = await fetch(URL2, { method: 'GET', mode: 'cors' });

    console.log('payload', payload);

    const json = (await payload.json()) as BundleManifest;

    const manifest = {
      url,
      status: payload.status,
      json,
      find: (path: string) => json.files.find((file) => file.path.endsWith(path)),
    };

    return manifest;
  };

  const Url = (text: string) => {
    const host = (text.match(/http(s?)\:\/\/.+?\//) || [])[0].replace(/\/*$/, '');
    let path = text.substring(host.length);
    let hash = '';
    let querystring = '';
    if (path.includes('#')) {
      const index = path.indexOf('#');
      hash = path.substring(index + 1);
      path = path.substring(0, index);
    }
    if (path.includes('?')) {
      const index = path.indexOf('?');
      querystring = path.substring(index + 1);
      path = path.substring(0, index);
    }

    path = path.replace(/^\//, '');

    return { host, path, hash, querystring, toString: () => text };
  };

  const singleton = Manifest(URL);

  (async () => {
    const manifest = await singleton;
    console.log('manifest.files', manifest.json.files);
  })();

  ctx.addEventListener('install', async (e) => {
    // console.log('service-worker-installed:', e);
  });

  ctx.addEventListener('fetch', async (event: any) => {
    // return;
    const manifest = await singleton;

    const url = Url(event.request.url);
    // console.log('u', url.path);

    const file = manifest.find(url.path);
    if (file && file.uri) {
      // console.log('f', file);
      const target = `http://localhost:8080/${file.uri}`;
      // console.log('target', target);

      event.respondWith(
        (async () => {
          // const res = await fetch(target);

          const file = await fetch(target);
          const infoJson = await (await fetch(`${target}/info`)).json();
          const mime = infoJson.data.props.mimetype;
          // infoJson.
          // console.log('infoJson', infoJson);
          // console.log('mime', mime);
          // console.log('file', file);

          return file;

          const res = await fetch(event.request);
          // console.log('res', res);
          return res;
        })(),
      );
    }

    // console.groupEnd();
    // const manifest = await getManifest(URL);
    // event.respondWith(
    //   caches.open('code.editor').then(function (cache) {
    //     return cache.match(event.request).then(function (response) {
    //       return (
    //         response ||
    //         fetch(event.request).then(function (response) {
    //           cache.put(event.request, response.clone());
    //           return response;
    //         })
    //       );
    //     });
    //   }),
    // );
  });

  // const checkCache = async (url: string) => {};
})();
