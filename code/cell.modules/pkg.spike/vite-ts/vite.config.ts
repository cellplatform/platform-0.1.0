import { resolve } from 'path';
import { defineConfig, UserConfig } from 'vite';

const config: UserConfig = {
  build: {
    lib: {
      entry: resolve(__dirname, 'src/Rx.ts'),
      name: 'Lib.Foo',
      // the proper extensions will be added
      fileName: 'lib.foo',
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      // external: ['rxjs'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          // rxjs: 'rxjs',
        },
      },
    },
  },
};

export default defineConfig(async (e) => {
  console.log('define', e);
  return config;
});
