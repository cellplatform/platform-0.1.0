/**
 *
 * https://www.electronforge.io/configuration
 * https://electron.github.io/electron-packager/master/interfaces/electronpackager.options.html
 *
 */
module.exports = {
  packagerConfig: {
    name: 'Workbench',
    icon: './assets/icons/app/app.icns',
    ignore: path => ignore(path),
    prune: true,

    // MacOS:
    appCategoryType: 'public.app-category.productivity', // See Apple Docs: https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/LaunchServicesKeys.html#//apple_ref/doc/uid/TP40009250-SW8
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'cell',
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
  ],
  hooks: {},
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
  ];
  if (startsWith.some(match => path.startsWith(match))) {
    return true; // Ignore.
  }

  const endsWith = ['.iconsproj', '.d.ts', '.mjs'];
  if (endsWith.some(match => path.endsWith(match))) {
    return true; // Ignore.
  }

  return false; // Allow.
}
