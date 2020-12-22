import { fs } from './common';

const file = fs.readFileSync(fs.resolve('tmp/editor.main.js')).toString();
const lines = file.split('\n');

lines
  .filter((line) => line.includes(`'editor.action`))
  .forEach((line) => {
    const match = line.match(/'.*'/g);
    if (match) {
      const action = match[0];
      console.log(action);
    }
  });
