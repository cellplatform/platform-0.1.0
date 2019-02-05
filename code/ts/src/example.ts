export const FOO = 123;

export const Foo = 456;

const foo = { number: 123 };
const bar = { text: 'hello' };
export const baz = { ...foo, ...bar };

export class Thing {
  private readonly _hidden: number;
  constructor() {
    this._hidden = 1;
  }
  public foo() {
    return this._hidden;
  }
}
