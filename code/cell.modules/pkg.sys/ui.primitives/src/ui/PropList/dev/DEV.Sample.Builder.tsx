import { PropList } from '..';
const pkg = { name: 'foobar', version: '1.2.3' };

export type MyFields =
  | 'Module'
  | 'Module.Name'
  | 'Module.Version'
  | 'Factory'
  | 'Factory.None'
  | 'Factory.Many'
  | 'Factory.EmptyArray';

const allFields: MyFields[] = [
  'Module',
  'Module.Name',
  'Module.Version',
  'Factory',
  'Factory.None',
  'Factory.Many',
  'Factory.EmptyArray',
];
const defaultFields: MyFields[] = ['Module.Name', 'Module.Version'];

export const BuilderSample = {
  allFields,
  defaultFields,

  toItems(args: { fields?: MyFields[] }) {
    const { fields = defaultFields } = args;
    return PropList.builder<MyFields>()
      .field('Module', { label: 'Module', value: `${pkg.name}@${pkg.version}` })
      .field('Module.Name', { label: 'Name', value: pkg.name })
      .field('Module.Version', { label: 'Version', value: pkg.version })
      .field('Factory', () => ({ label: 'Factory', value: 123 }))
      .field('Factory.None', () => undefined)
      .field('Factory.Many', () => [
        { label: 'One', value: 123 },
        { label: 'Two', value: 456 },
        { label: 'Three', value: 789 },
      ])
      .items(fields);
  },
};
