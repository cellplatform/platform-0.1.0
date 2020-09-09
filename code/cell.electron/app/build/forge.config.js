/* eslint-disable */

const { resolve } = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: resolve(process.cwd(), '../.env') });

/**
 *
 * https://www.electronforge.io/configuration
 * https://electron.github.io/electron-packager/master/interfaces/electronpackager.options.html
 *
 * Suggested example from Electron docs:
 *    https://www.electronjs.org/docs/tutorial/code-signing#electron-forge
 *    https://github.com/electron/fiddle/blob/master/forge.config.js
 *
 * Apple Developer ID:
 *    https://developer.apple.com/developer-id/
 * Apple Gatekeeper:
 *    https://developer.apple.com/developer-id/
 *
 */
module.exports = {
  packagerConfig: {
    name: 'A1',
    icon: 'assets/icons/app/app.icns',
    ignore: (path) => ignore(path),
    prune: true,

    /**
     * MacOS.
     * For category types see Apple Docs at:
     *    https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/LaunchServicesKeys.html#//apple_ref/doc/uid/TP40009250-SW8
     */
    appBundleId: 'cell.app.a1',
    appCategoryType: 'public.app-category.productivity',

    /**
     * MacOS: Code Signing.
     *        https://www.electronjs.org/docs/tutorial/code-signing
     */
    osxSign: {
      identity: process.env.OSX_SIGN_IDENTITY,
      'hardened-runtime': true,
      'gatekeeper-assess': false,
      entitlements: 'build/entitlements.plist',
      'entitlements-inherit': 'build/entitlements.plist',
      'signature-flags': 'library',
    },
    osxNotarize: {
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
    },
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: { name: 'A1' },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
  ],
};

/**
 * [Helpers]
 */

/**
 * Filter to exclude various files from being
 * included in the distribution bundle.
 */
function ignore(path) {
  if (path.startsWith('/node_modules/')) {
    return false; // Allow.
  }

  const startsWith = [
    '/src',
    '/sh',
    '/tmp',
    '/yarn.lock',
    '/tslint.json',
    '/tsconfig.json',
    '/forge.config.js',
    '/lib/build',
    '/assets/icons/icon.src.iconsproj',
  ];
  if (startsWith.some((match) => path.startsWith(match))) {
    return true; // Ignore.
  }

  const endsWith = ['.iconsproj', '.d.ts', '.mjs'];
  if (endsWith.some((match) => path.endsWith(match))) {
    return true; // Ignore.
  }

  return false; // Allow.
}
