import { expect } from 'chai';
import { log } from '@platform/log/lib/server';

describe('package.json', () => {
  const pkg = require('../../package.json');

  it('has locked version: handsontable@6.2.2', () => {
    const deps = pkg.dependencies;
    const PKG = 'handsontable';
    const MIT = '6.2.2';

    let msg = `\nWARNING [${PKG}] must be version ${log.green(MIT)} not ${log.red(MIT)}.`;
    if (deps.handsontable !== MIT) {
      msg += log.gray(`\nv${MIT} is the latest version licended under the MIT licence.\n`);
      log.info.yellow(msg);
    }

    expect(deps[PKG]).to.eql(MIT, msg);
  });
});
