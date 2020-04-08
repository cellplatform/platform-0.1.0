/**
 * https://www.electronforge.io/configuration
 */
module.exports = {
  packagerConfig: {
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
