import { expect } from 'chai';
import { toposort } from './toposort';

describe('util.toposort', () => {
  it('sorts (string)', () => {
    const graph: string[][] = [
      ['foo', 'one'],
      ['foo', 'two'],
      ['bar', 'foo'],
    ];
    const res = toposort(graph);
    expect(res).to.eql(['bar', 'foo', 'one', 'two']);
  });

  it('sorts (number)', () => {
    const graph: number[][] = [
      [1, 2],
      [1, 3],
      [4, 1],
    ];
    const res = toposort(graph);
    expect(res).to.eql([4, 1, 2, 3]);
  });

  it('sorts (string|number)', () => {
    const graph: Array<Array<string | number>> = [
      [1, 'one'],
      [1, 'two'],
      [999, 1],
    ];
    const res = toposort(graph);
    expect(res).to.eql([999, 1, 'one', 'two']);
  });

  it('empty', () => {
    const graph: string[][] = [];
    const res = toposort<string>(graph);
    expect(res).to.eql([]);
  });
});
