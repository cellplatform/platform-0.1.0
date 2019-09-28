import { t } from '../common';
import { ast } from '../ast';
export { isFormula } from './util';

export function create(args: { text: string }) {
  const { text } = args;

  const tree = ast.toTree(text);

  // console.log('tree', tree);

  const formula: t.IFormula = {
    text,
    name: 'foo',
  };
  return formula;
}
