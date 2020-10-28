import { fs, HttpClient, logger, Model, parseUrl, Schema, t, Uri } from '../common';
import { BundleManifest } from '../Compiler';
import { bundle } from './task.bundle';
import { getManifestFile, upload } from './task.cell.upload';

type B = t.CompilerModelBuilder;

/**
 * Cell compilation target.
 */
export const cell: t.CompilerCreateCell = (hostInput, cellInput) => {
  const uri = typeof cellInput === 'object' ? cellInput : Uri.cell(cellInput);
  const parsedHost = parseUrl(hostInput);
  const host = parsedHost.host;
  const client = HttpClient.create(host).cell(uri.toString());

  const runBundle = async (args: { config: B; manifestUri: string; silent?: boolean }) => {
    const { manifestUri, silent } = args;
    const config = args.config.clone().env({ manifestUri });
    return await bundle(config, { silent });
  };

  const cell: t.CompilerCell = {
    host: `${parsedHost.protocol}//${parsedHost.host}`,
    uri,

    async upload(config, options = {}) {
      const { silent, targetDir } = options;
      const model = Model(config);
      const bundleDir = model.bundleDir;
      const targetCell = uri.toString();

      /**
       * [1] Ensure manifest file URI exists.
       *     NOTE: This is passed into the bundler as an environment variable.
       */
      const manifestUri = await getManifestUri({ client, bundleDir, targetDir });

      /**
       * [2] Bundle.
       */
      if (options.bundle || !(await fs.pathExists(bundleDir))) {
        await runBundle({ config, manifestUri, silent });
      }

      if (!silent) {
        logger.hr();
      }

      /**
       * [3] Upload.
       */
      const res = await upload({
        host,
        config: config.toObject(),
        targetCell,
        targetDir,
        silent,
      });

      return res;
    },
  };

  return cell;
};

/**
 * [Helpers]
 */

const getManifestUri = async (args: {
  client: t.IHttpClientCell;
  bundleDir: string;
  targetDir?: string;
}) => {
  const { client, bundleDir, targetDir } = args;

  const manifestPath = {
    local: fs.join(bundleDir, BundleManifest.filename),
    remote: fs.join(targetDir || '', BundleManifest.filename),
  };

  // Look for existing cell manifest.
  let uri = '';
  const info = await client.file.name(manifestPath.remote).info();
  if (info.ok) {
    // Existing manifest exists on remote cell.
    // Use the retrieved URI.
    uri = info.body.uri;
  } else {
    // Existing manifest does not exist on remote cell.
    // Upload a manifest to get the URI.

    if (!(await fs.pathExists(manifestPath.local))) {
      // NB: Write a dummy manifest file.
      await fs.ensureDir(fs.dirname(manifestPath.local));
      await fs.writeJson(manifestPath.local, {});
    }

    // Upload the file.
    const manifestFile = await getManifestFile({ bundleDir, targetDir });
    const manifestUpload = await client.files.upload(manifestFile);
    if (manifestUpload.error) {
      throw new Error(manifestUpload.error.message);
    }

    // Read out the file link data on the cell to get at the URI.
    const links = manifestUpload.body.cell.links;
    const fileLink = Schema.file.links.find(links).byName(manifestPath.remote);
    if (!fileLink) {
      const err = `The uploaded manifest was not correctly attached to [${client.uri.toString()}].`;
      throw new Error(err);
    }
    uri = fileLink.uri.toString();
  }

  return uri;
};
