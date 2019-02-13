import { npm } from '..';
import { log } from '../common';
import { NpmPackage } from '.';

describe('NpmPackage (integration)', function() {
  this.timeout(20000);

  it.skip('latestFields (static)', async () => {
    const res = await NpmPackage.getLatestVersions(
      {
        react: 'latest',
        'react-dom': '1.2.3',
      },
      (name, version) => version === 'latest',
    );
    log.info(res);
  });

  it.skip('latestFields (static)', async () => {
    const pkg = npm.pkg('./test/sample');
    const res = await pkg.updateVersions({
      // types: ['dependencies', 'devDependencies'],
      // updateState: false,
      filter: (name, version) => version === 'latest' || name === 'express',
    });
    log.info(res);
  });
});
