import { NodeRuntime } from '@platform/cell.runtime.node';

import { RouterMock, expect, fs, Http, readFile, t, rx, Schema } from '../../test';
import { Samples } from '../module.cell.runtime.node/Samples';

export * from './sample.NodeRuntime/types';
export * from './sample.pipe/types';
export { Samples };

type B = t.RuntimeBundleOrigin;
const trimSlashes = (path?: string) => (path || '').trim().replace(/^\/*/, '').replace(/\/*$/, '');

const toManifestUrl = (bundle: B) => {
  const { host, dir, uri = 'cell:foo:A1' } = bundle;
  const path = trimSlashes(dir) ? `${trimSlashes(dir)}/index.json` : 'index.json';
  return Schema.urls(host).cell(uri).file.byName(path).toString();
};

export const createFuncMock = async () => {
  const bus = rx.bus();
  const runtime = NodeRuntime.create({ bus, stdlibs: ['os', 'fs', 'tty', 'util', 'path'] });
  const mock = await RouterMock.create({ runtime });
  const http = Http.create();
  const url = mock.urls.fn.run;
  return { bus, url, mock, http, runtime };
};

export const prepare = async (options: { dir?: string; uri?: string } = {}) => {
  const { dir, uri = 'cell:foo:A1' } = options;
  const { bus, mock, runtime, http, url } = await createFuncMock();
  const { host } = mock;
  const client = mock.client.cell(uri);
  const bundle: B = { host, uri, dir };
  const manifestUrl = toManifestUrl(bundle);
  return { bus, mock, runtime, http, client, bundle, url, uri, manifestUrl };
};

export const bundleToFiles = async (sourceDir: string, targetDir?: string) => {
  targetDir = (targetDir || '').trim();
  const base = fs.resolve('.');
  const paths = await fs.glob.find(fs.join(base, sourceDir, '**'));
  const files = await Promise.all(
    paths.map(async (path) => {
      const data = await readFile(path);
      let filename = path.substring(fs.join(base, sourceDir).length + 1);
      filename = targetDir ? fs.join(targetDir, filename) : filename;
      return { filename, data } as t.IHttpClientCellFileUpload;
    }),
  );
  return files;
};

export const getManifest = (files: t.IHttpClientCellFileUpload[]) => {
  const file = files.find((f) => f.filename.endsWith('index.json'));
  const text = file?.data ? new TextDecoder().decode(file.data) : '';
  return JSON.parse(text) as t.ModuleManifest;
};

export const uploadBundle = async (
  client: t.IHttpClientCell,
  dist: string,
  bundle: B,
  options: { filter?: (file: t.IHttpClientCellFileUpload) => boolean } = {},
) => {
  const { filter } = options;
  let files = await bundleToFiles(dist, bundle.dir);
  files = filter ? files.filter((file) => filter(file)) : files;
  const upload = await client.fs.upload(files);
  expect(upload.ok).to.eql(true, 'Failed to upload sample bundle.');

  const manifestUrl = toManifestUrl(bundle);
  return { files, upload, bundle, manifestUrl };
};
