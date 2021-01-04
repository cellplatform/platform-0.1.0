import { fs } from './libs';
import { Package } from './util.Package';

export const NodeModules = {
  /**
   * Find the path to the given module.
   */
  async pathToModule(
    dir: string,
    module: string,
    options: { root?: boolean } = {},
  ): Promise<string> {
    if (!dir || dir === '/') return '';

    const node_modules = await NodeModules.closestNodeModulesPath(dir);
    if (!node_modules) return '';

    let path = fs.join(node_modules, module);
    if (await fs.pathExists(`${path}.d.ts`)) path = fs.dirname(path);
    if (await fs.pathExists(path)) {
      if (options.root) {
        const pkg = await Package.findClosestPath(path);
        if (!pkg) throw new Error(`Cannot find root package module for: ${path}`);
        return pkg.dir;
      } else {
        return path;
      }
    }

    return NodeModules.pathToModule(fs.dirname(dir), module, options); // <== 🌳 RECURSION
  },

  /**
   * Walks up a path looking for the first [node_modules] folder.
   */
  async closestNodeModulesPath(path: string): Promise<string> {
    if (!path || path === '/') return '';
    if (path.endsWith('/node_modules')) return path;
    if (await fs.pathExists(fs.join(path, 'node_modules'))) return fs.join(path, 'node_modules');
    return NodeModules.closestNodeModulesPath(fs.dirname(path)); // <== 🌳 RECURSION
  },
};
