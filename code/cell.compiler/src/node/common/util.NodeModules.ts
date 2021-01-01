import { fs } from './libs';

export const NodeModules = {
  /**
   * Find the path to the given module.
   */
  async pathToModule(dir: string, module: string): Promise<string> {
    if (!dir || dir === '/') return '';

    const node_modules = await NodeModules.closestNodeModulesPath(dir);
    if (!node_modules) return '';

    const path = fs.join(node_modules, module);
    if (await fs.pathExists(path)) return path;
    if (await fs.pathExists(`${path}.d.ts`)) return fs.dirname(path);

    return NodeModules.pathToModule(fs.dirname(dir), module); // <== 🌳 RECURSION
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
