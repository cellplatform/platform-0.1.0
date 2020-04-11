/**
 * https://www.electronforge.io/configuration
 * https://electron.github.io/electron-packager/master/interfaces/electronpackager.options.html
 */
module.exports = {
  packagerConfig: {
    name: 'Cell',
    icon: './assets/icons/app/app.icns',
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
