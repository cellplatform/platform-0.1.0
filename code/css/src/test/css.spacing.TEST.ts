import { expect } from 'chai';
import { transform } from '../css/css';

describe('padding', function() {
  it('PaddingX', () => {
    const result = transform({
      PaddingX: 14,
      paddingLeft: 1234, // Overwritten.
    }) as any;
    expect(result.paddingLeft).to.equal(14);
    expect(result.paddingRight).to.equal(14);
  });

  it('PaddingY', () => {
    const result = transform({
      PaddingY: 20,
    }) as any;
    expect(result.paddingTop).to.equal(20);
    expect(result.paddingBottom).to.equal(20);
  });

  it('Padding (10)', () => {
    const result = transform({
      Padding: 20,
    }) as any;
    expect(result.paddingTop).to.equal(20);
    expect(result.paddingRight).to.equal(20);
    expect(result.paddingBottom).to.equal(20);
    expect(result.paddingLeft).to.equal(20);
  });

  it('Padding ([10, null, "5em", "30px"])', () => {
    const result = transform({
      Padding: [10, null, '5em', '30px'],
    }) as any;
    expect(result.paddingTop).to.equal(10);
    expect(result.paddingRight).to.equal(undefined);
    expect(result.paddingBottom).to.equal('5em');
    expect(result.paddingLeft).to.equal(30);
  });
});

describe('margin', function() {
  it('MarginX', () => {
    const result = transform({
      MarginX: 14,
      marginLeft: 1234, // Overwritten.
    }) as any;
    expect(result.marginLeft).to.equal(14);
    expect(result.marginRight).to.equal(14);
  });

  it('MarginY', () => {
    const result = transform({
      MarginY: 20,
    }) as any;
    expect(result.marginTop).to.equal(20);
    expect(result.marginBottom).to.equal(20);
  });

  it('Margin (10)', () => {
    const result = transform({
      Margin: 20,
    }) as any;
    expect(result.marginTop).to.equal(20);
    expect(result.marginRight).to.equal(20);
    expect(result.marginBottom).to.equal(20);
    expect(result.marginLeft).to.equal(20);
  });

  it('Margin ([10, null, "5em", "30px"])', () => {
    const result = transform({
      Margin: [10, null, '5em', '30px'],
    }) as any;
    expect(result.marginTop).to.equal(10);
    expect(result.marginRight).to.equal(undefined);
    expect(result.marginBottom).to.equal('5em');
    expect(result.marginLeft).to.equal(30);
  });
});
