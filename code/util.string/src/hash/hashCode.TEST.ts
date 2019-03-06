import { expect } from 'chai';
import { str } from '..';

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec quam lorem. Praesent fermentum, augue ut porta varius, eros nisl euismod ante, ac suscipit elit libero nec dolor. Morbi magna enim, molestie non arcu id, varius sollicitudin neque. In sed quam mauris. Aenean mi nisl, elementum non arcu quis, ultrices tincidunt augue. Vivamus fermentum iaculis tellus finibus porttitor. Nulla eu purus id dolor auctor suscipit. Integer lacinia sapien at ante tempus volutpat.';

describe('hash', () => {
  it('empty string', () => {
    expect(str.hashCode('')).to.eql(0);
  });

  it('short: foo', () => {
    expect(str.hashCode('foo')).to.eql(101574);
  });

  it('long: "lorem ipsum" * 99', () => {
    const LONG = Array.from({ length: 99 }).reduce((acc, next) => `${acc}\n${LOREM}`, '') as string;
    expect(str.hashCode(LONG)).to.eql(-1668628634);
  });
});
