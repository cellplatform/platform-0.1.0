import { configure } from './compiler';
export default configure()
  .mode('prod')
  .target('node')
  .beforeCompile((e) => {
    e.modify((webpack) => {
      //
    });
  });
