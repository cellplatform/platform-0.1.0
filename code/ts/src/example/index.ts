import { Foo } from './Foo';
export const FOO = 123;

const foo = { number: 123 };
const bar = { text: 'hello' };
export const baz = { ...foo, ...bar };

export class Thing {
  private readonly _hidden: number;
  constructor() {
    this._hidden = 1;
  }
  public get foo() {
    return this._hidden;
  }
}

const instance = new Foo();
console.log(instance); // tslint:disable-line
