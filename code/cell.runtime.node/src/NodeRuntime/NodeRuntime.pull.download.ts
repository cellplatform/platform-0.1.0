import { deleteUndefined, fs, Hash, Http, Schema, t } from '../common';

/**
 * Download a manifest to a directory.
 */
export async function downloadFiles(url: t.ManifestUrl, targetDir: string) {
  const errors: t.IRuntimeError[] = [];
  const addError = (message: string, stack?: string) => {
    const bundle = url;
    errors.push(deleteUndefined({ type: 'RUNTIME/pull', bundle, message, stack }));
  };

  const doneWithError = (message: string, stack?: string) => {
    addError(message, stack);
    return done();
  };

  let downloaded = 0;
  const done = () => {
    const ok = errors.length === 0;
    return { ok, total: { downloaded }, targetDir, manifest, errors };
  };

  // Pull the manifest JSON.
  const manifestUrl = new URL(url);
  const http = Http.create();
  const res = await http.get(manifestUrl.href);
  if (!res.ok) {
    const message = `[${res.status}] Failed to retrieve bundle manifest. ${res.statusText}`.trim();
    return doneWithError(message);
  }

  // Ensure the manifest is of type module.
  const manifest = res.json as t.ModuleManifest;
  if (manifest.kind !== 'module') {
    return doneWithError(`Manifest kind '${manifest.kind || '<none>'}' not a module.`);
  }

  // Ensure the manifest contains files.
  if (manifest.files.length === 0) {
    return doneWithError(`Manifest does not contain any files.`);
  }

  const saveText = async (path: string, body: string) => {
    await fs.ensureDir(fs.dirname(path));
    await fs.writeFile(path, body);
  };

  const validateFile = async (source: t.ManifestFile, path: string) => {
    const local = Uint8Array.from(await fs.readFile(path));
    const localHash = Hash.sha256(local);
    if (localHash !== source.filehash) {
      const err = `Hash mismatch on '${source.path}'. Downloaded file '${localHash}'. Expected '${source.filehash}'`;
      addError(err);
    }
  };

  const pullAndSave = async (source: t.ManifestFile) => {
    try {
      const trimStart = (path: string) => path.replace(/^\/*/, '');
      const dir = trimStart(fs.dirname(manifestUrl.pathname));
      const sourcePath = `${dir}/${trimStart(source.path)}`;
      const targetPath = fs.join(targetDir, source.path);
      const url = `${manifestUrl.origin}/${sourcePath}`;

      const res = await http.get(url);
      if (!res.ok) {
        const err = `[${res.status}] Failed while pulling file: ${url}`;
        return addError(err);
      }

      // Save.
      const body = res.body;
      if (res.text) {
        await saveText(targetPath, res.text); // TEMP 🐷
      } else if (typeof body === 'object') {
        await fs.stream.save(targetPath, body as any);
      } else if (typeof body === 'string') {
        await saveText(targetPath, body);
      } else {
        const type = typeof body;
        const mime = Schema.Mime.toType(sourcePath, '<unknown>');
        const err = `The body type '${type}' for pulled file '${sourcePath}' is not supported`;
        return addError(`${err} (mime:${mime}, ${origin}).`);
      }

      // Validate hash.
      await validateFile(source, targetPath);
      downloaded++;
    } catch (error: any) {
      addError(`Failed while downloading file '${source.path}'. ${error.message}`.trim());
    }
  };

  // Download and save all files.
  const json = JSON.stringify(manifest, null, '  ');
  await fs.ensureDir(targetDir);
  await fs.writeFile(fs.join(targetDir, fs.basename(manifestUrl.pathname)), json);
  await Promise.all(manifest.files.map(pullAndSave));

  // Finish up.
  return done();
}
