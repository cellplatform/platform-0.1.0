/**
 * Prepares a bundle for publishing.
 */
export async function prepare(args: {}) {
  //
}

// // Size.
// const size = await fs.size.dir(targetDir);

// // Create index [manifest.yml].
// const names = await fs.readdir(targetDir);
// const files = (await Promise.all(
//   names.map(async name => ({ name, isFile: await fs.is.file(fs.join(targetDir, name)) })),
// ))
//   .filter(item => item.isFile)
//   .map(item => item.name);
// const dirs = names.filter(name => !files.includes(name));

// const manifest = {
//   createdAt: time.now.timestamp,
//   bytes: size.bytes,
//   size: size.toString(),
//   files,
//   dirs,
// };
// const yaml = jsYaml.safeDump(manifest);
// await fs.writeFile(fs.join(targetDir, 'manifest.yml'), yaml);
