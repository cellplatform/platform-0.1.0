import { NodeRuntime } from '@platform/cell.runtime.node';

import { createMock, expect, fs, Http, readFile, t } from '../../test';
import { samples } from '../module.cell.runtime.node/NodeRuntime.TEST';

export { SampleNodeIn, SampleNodeOut } from './sample.NodeRuntime/types';
export { samples };

type B = t.RuntimeBundleOrigin;

export const noManifestFilter = (file: t.IHttpClientCellFileUpload) => {
  return !file.filename.endsWith('index.json'); // NB: Cause error by filtering out the manifest file.
};

export const createFuncMock = async () => {
  const runtime = NodeRuntime.create();
  const mock = await createMock({ runtime });
  const http = Http.create();
  const url = mock.urls.fn.run;
  return { url, mock, http, runtime };
};

export const prepare = async (options: { dir?: string; uri?: string } = {}) => {
  const { dir, uri = 'cell:foo:A1' } = options;
  const { mock, runtime, http, url } = await createFuncMock();
  const { host } = mock;
  const client = mock.client.cell(uri);
  const bundle: B = { host, uri, dir };
  return { mock, runtime, http, client, bundle, url, uri };
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
  const json = JSON.parse(file?.data.toString() || '');
  return json as t.BundleManifest;
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
  const upload = await client.files.upload(files);
  expect(upload.ok).to.eql(true);
  return { files, upload, bundle };
};
