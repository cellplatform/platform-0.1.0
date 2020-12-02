import { fs, expect, TestCompile, time } from '../../test';

import vm from 'vm';

const DIR = {
  NODE: TestCompile.node.outdir,
  TMP_RUNTIME: 'tmp/runtime.node',
};

const compileTestBundle = (force?: boolean) => TestCompile.node.bundle(force);

describe.only('Vm', function () {
  this.timeout(99999);

  /**
   * Ensure the sample [node] code as been bundled.
   */
  before(async () => compileTestBundle());
  beforeEach(async () => await fs.remove(fs.resolve(DIR.TMP_RUNTIME)));

  it('TMP', async () => {
    await compileTestBundle(true);

    const dir = fs.resolve(DIR.NODE);
    const path = fs.join(dir, 'main.js');

    let response: any;

    const context = {
      require: (path: string) => {
        path = fs.join(dir, path);
        console.log('path', path);
        return require(path);
      },
      console,
      self: {
        res(value: any) {
          console.log('value', value);
          response = value;
        },
      },
    };

    const code = (await fs.readFile(path)).toString();

    // const script = new vm.Script('count += 1; name = "kitty";');
    const script = new vm.Script(code);

    vm.createContext(context);
    const res = script.runInContext(context);

    await time.wait(1500);

    console.log('-------------------------------------------');
    console.log('res', res);
    console.log('resposne', response);
    // console.log('typeof response.foo', typeof response.foo);
  });
});

// import { expect, t, fs, Schema, time } from '../test';
// import { compile } from '../compiler/compile';

// import { VM, NodeVM } from 'vm2';
// import vm from 'vm';

// describe.only('vm2', function () {
//   this.timeout(99999);

//   it('VM', async () => {
//     //
//     const vm = new VM();
//     const res = vm.run('console.log(1234);1234;');
//     console.log('res', res);
//   });

//   it('NodeVM', async () => {
//     // await compileNode(true);

//     const dir = fs.resolve('dist/node');
//     const path = fs.join(dir, 'main.js');

//     const vm = new NodeVM({
//       console: 'inherit',
//       require: {
//         external: true,
//         root: './',
//         builtin: ['fs', 'path'],
//         resolve: (moduleName: string, parentDirname: string) => {
//           console.log('moduleName', moduleName);
//           console.log('parentDirname', parentDirname);

//           return moduleName;
//         },
//       },
//     });

//     const code = (await fs.readFile(path)).toString();
//     console.log('code', code.substring(0, 30));
//     console.log('-------------------------------------------');

//     const res = vm.run(code, path);

//     console.log('-------------------------------------------');
//     console.log('res', res);
//   });

//   it.only('VM', async () => {
//     // await compileNode(true);

//     const dir = fs.resolve('dist/node');
//     const path = fs.join(dir, 'main.js');

//     let response: any;

//     const context = {
//       require: (path: string) => {
//         path = fs.join(dir, path);
//         console.log('path', path);
//         return require(path);
//       },
//       console,
//       self: {
//         res(value: any) {
//           console.log('value', value);
//           response = value;
//         },
//       },
//     };

//     const code = (await fs.readFile(path)).toString();

//     // const script = new vm.Script('count += 1; name = "kitty";');
//     const script = new vm.Script(code);

//     vm.createContext(context);
//     const res = script.runInContext(context);

//     await time.wait(1500);

//     console.log('-------------------------------------------');
//     console.log('res', res);
//     console.log('resposne', response);
//     console.log('typeof response.foo', typeof response.foo);
//   });
// });
