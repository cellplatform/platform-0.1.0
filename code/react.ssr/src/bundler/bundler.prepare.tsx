import * as ReactDOMServer from 'react-dom/server';

import { constants, fs, jsYaml, t, time } from '../common';
import * as logger from './bundler.log';

const renderStatic = require('glamor/server').renderStatic;

/**
 * Prepares a bundle for publishing.
 */
export async function prepare(args: {
  bundleDir: string;
  entries?: t.IBundleEntryElement[];
  silent?: boolean;
}) {
  const { entries } = args;

  const bundleDir = fs.resolve(args.bundleDir);
  if (!(await fs.pathExists(bundleDir))) {
    throw new Error(`Cannot prepare, the directory does not exist. ${bundleDir}`);
  }

  // Write a YAML file describing the contents of the bundle.
  const path = fs.join(bundleDir, constants.PATH.BUNDLE_MANIFEST);
  const manifest = await bundleManifest.write({ path, entries });

  // Finish up.
  if (!args.silent) {
    logger.bundle({ bundleDir, manifest });
  }
  return { bundleDir, manifest };
}

/**
 * Create a bundle manifest for the given path.
 */
const bundleManifest = {
  async create(args: { path: string; entries?: t.IBundleEntryElement[] }) {
    const dir = fs.dirname(args.path);
    const version = fs.basename(dir);
    const dirSize = await fs.size.dir(dir);

    const paths = await fs.glob.find(fs.join(dir, '**'));
    const files = paths.map(path => {
      const size = dirSize.files.find(item => item.path === path);
      const file: t.IBundleFile = {
        path: path.substring(dir.length + 1),
        bytes: size ? size.bytes : -1,
      };
      return file;
    });

    const entries = (args.entries || [])
      .filter(entry => files.some(file => file.path === entry.file))
      .map(entry => renderEntry(entry));

    const manifest: t.IBundleManifest = {
      version,
      createdAt: time.now.timestamp,
      bytes: dirSize.bytes,
      size: dirSize.toString(),
      files,
      entries,
    };
    return manifest;
  },

  /**
   * Create and write a bundle manifest to disk.
   */
  async write(args: { path: string; entries?: t.IBundleEntryElement[] }) {
    const manifest = await bundleManifest.create(args);
    const yaml = jsYaml.safeDump(manifest);
    await fs.writeFile(args.path, yaml);
    return manifest;
  },
};

/**
 * [Helpers]
 */

function renderEntry(args: t.IBundleEntryElement): t.IBundleEntryHtml {
  const { id = 'root', file, el } = args;
  const { html, css } = renderStatic(() => ReactDOMServer.renderToString(el));
  return { file, id, html, css };
}
