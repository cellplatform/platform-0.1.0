import { expect } from 'chai';
import { value } from '.';

const { defaultValue } = value;

describe('defaultValue', () => {
  it('does not change the given value', () => {
    expect(defaultValue(1)).to.eql(1);
    expect(defaultValue(1, 2)).to.eql(1);
    expect(defaultValue(0, 2)).to.eql(0);
    expect(defaultValue(undefined)).to.eql(undefined);
    expect(defaultValue('foo', 'bar')).to.eql('foo');
    expect(defaultValue('', 'bar')).to.eql('');
    expect(defaultValue<boolean>(true, false)).to.eql(true);
    expect(defaultValue<boolean>(false, true)).to.eql(false);
  });

  it('uses the given default value', () => {
    expect(defaultValue(undefined, 1)).to.eql(1);
    expect(defaultValue<string>(undefined, 'bar')).to.eql('bar');
    expect(defaultValue<string>('' || undefined, 'bar')).to.eql('bar');
    expect(
      defaultValue<{ foo: number }>(undefined, { foo: 123 }),
    ).to.eql({
      foo: 123,
    });
    expect(defaultValue<boolean>(undefined, false)).to.eql(false);
    expect(defaultValue<boolean>(undefined, true)).to.eql(true);
  });
});

describe('deleteUndefined', () => {
  it('retains existing values, removes undefined', () => {
    const res = value.deleteUndefined({
      nothing: undefined,
      yes: true,
      no: false,
      zero: 0,
      value: null,
      text: '',
    });

    expect(res).to.eql({
      yes: true,
      no: false,
      zero: 0,
      value: null,
      text: '',
    });
  });
});

describe('deleteEmpty', () => {
  it('deletes empty/undefined values', () => {
    const res = value.deleteEmpty({
      nothing: undefined,
      yes: true,
      no: false,
      zero: 0,
      value: null,
      text: '',
    });
    expect(res).to.eql({
      yes: true,
      no: false,
      zero: 0,
      value: null,
    });
  });
});

describe('isStatusOk', () => {
  it('is ok', async () => {
    expect(value.isStatusOk(200)).to.eql(true);
    expect(value.isStatusOk(201)).to.eql(true);
  });

  it('is not ok', async () => {
    expect(value.isStatusOk(404)).to.eql(false);
    expect(value.isStatusOk(500)).to.eql(false);
    expect(value.isStatusOk(0)).to.eql(false);
    expect(value.isStatusOk(undefined as any)).to.eql(false);
  });
});

describe('plural', () => {
  it('singular', async () => {
    expect(value.plural(1, 'item')).to.eql('item');
    expect(value.plural(-1, 'item')).to.eql('item');
    expect(value.plural(1, 'item', 'items')).to.eql('item');
    expect(value.plural(-1, 'item', 'items')).to.eql('item');
  });

  it('plural', async () => {
    expect(value.plural(0, 'item', 'items')).to.eql('items');
    expect(value.plural(2, 'item', 'items')).to.eql('items');
    expect(value.plural(-2, 'item', 'items')).to.eql('items');
    expect(value.plural(999, 'item', 'items')).to.eql('items');
  });

  it('inferred "s"', async () => {
    expect(value.plural(0, 'item')).to.eql('items');
    expect(value.plural(2, 'item')).to.eql('items');
    expect(value.plural(-2, 'item')).to.eql('items');
    expect(value.plural(999, 'item')).to.eql('items');
  });
});
