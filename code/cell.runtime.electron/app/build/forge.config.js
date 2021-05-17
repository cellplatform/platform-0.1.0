/* eslint-disable */

const { resolve } = require('path');
const { fs } = require('@platform/fs');
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
 * Apple Developer ID (Gatekeeper):
 *    https://developer.apple.com/developer-id
 *
 * Blog posts:
 *    https://kilianvalkhof.com/2019/electron/notarizing-your-electron-application
 *
 */
const config = {
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
    {
      /**
       * DMG format options:
       *
       *   'UDRW' - UDIF read/write image
       *   'UDRO' - UDIF read-only image
       *   'UDCO' - UDIF ADC-compressed image
       *   'UDZO' - UDIF zlib-compressed image
       *   'ULFO' - UDIF lzfse-compressed image (OS X 10.11+ only)
       *   'UDBZ' - UDIF bzip2-compressed image (Mac OS X 10.4+ only)
       *
       * See
       *    https://www.electronforge.io/config/makers/dmg
       *    https://js.electronforge.io/maker/dmg/interfaces/makerdmgconfig
       */
      name: '@electron-forge/maker-dmg',
      config: {
        title: '<name-version>',
        background: 'assets/macos/dmg-background.png',
        icon: 'assets/icons/app/app.icns',
        format: 'ULFO',
        overwrite: true,
      },
    },
  ],
};

const Configure = {
  /**
   * Update title string to include version numbers.
   */
  titles() {
    const item = config.makers.find((item) => item.name === '@electron-forge/maker-dmg');
    const pkg = fs.readJsonSync(resolve(process.cwd(), 'package.json'));
    item.config.title = `${config.packagerConfig.name} - version ${pkg.version}`;
  },

  /**
   * Code signing setup.
   */
  notarization() {
    if (process.platform !== 'darwin') {
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      return;
    }

    const { APPLE_ID, APPLE_ID_PASSWORD } = process.env;

    if (!APPLE_ID || !APPLE_ID_PASSWORD) {
      const msg = `\n\nShould be notarizing, but environment variables APPLE_ID or APPLE_ID_PASSWORD are missing!\n`;
      console.warn(msg);
      return;
    }

    if (process.env.NOTARIZE === 'false') {
      return;
    }

    // console.warn('\n\n🐷 Skipping notarization (TEMPORARY)\n');
    // return;

    config.packagerConfig.osxNotarize = {
      appleId: APPLE_ID,
      appleIdPassword: APPLE_ID_PASSWORD,
    };
  },
};

/**
 * Dynamic configuration of configuration object.
 */
(() => {
  Configure.notarization();
  Configure.titles();
})();

module.exports = config;

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
    '/build',
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
