import { registerLanguage } from './Configure.language';
import { staticPaths } from './Configure.paths';
import { registerPrettier } from './Configure.prettier';
import { defineThemes } from './Configure.theme';
import { env } from './Configure.env';

/**
 * Code editor configuration setup.
 */
export const Configure = {
  registerLanguage,
  registerPrettier,
  defineThemes,
  staticPaths,
  env,
};
