import { configure } from './compiler';
export default configure()
  .mode('dev')
  .title('My Title')
  .beforeCompile((e) => {
    e.modify((webpack) => {
      //
    });
  });
