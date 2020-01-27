import { expect } from 'chai';
import { style } from '..';

describe('padding', function() {
  it('PaddingX', () => {
    const res = style.transform({
      PaddingX: 14,
      paddingLeft: 1234, // Overwritten.
    }) as any;
    expect(res.paddingLeft).to.equal(14);
    expect(res.paddingRight).to.equal(14);
  });

  it('PaddingY', () => {
    const res = style.transform({
      PaddingY: 20,
    }) as any;
    expect(res.paddingTop).to.equal(20);
    expect(res.paddingBottom).to.equal(20);
  });

  it('Padding (10)', () => {
    const res = style.transform({
      Padding: 20,
    }) as any;
    expect(res.paddingTop).to.equal(20);
    expect(res.paddingRight).to.equal(20);
    expect(res.paddingBottom).to.equal(20);
    expect(res.paddingLeft).to.equal(20);
  });

  it('Padding ([10, null, "5em", "30px"])', () => {
    const res = style.transform({
      Padding: [10, null, '5em', '30px'],
    }) as any;
    expect(res.paddingTop).to.equal(10);
    expect(res.paddingRight).to.equal(undefined);
    expect(res.paddingBottom).to.equal('5em');
    expect(res.paddingLeft).to.equal(30);
  });
});

describe('margin', function() {
  it('MarginX', () => {
    const res = style.transform({
      MarginX: 14,
      marginLeft: 1234, // Overwritten.
    }) as any;
    expect(res.marginLeft).to.equal(14);
    expect(res.marginRight).to.equal(14);
  });

  it('MarginY', () => {
    const res = style.transform({
      MarginY: 20,
    }) as any;
    expect(res.marginTop).to.equal(20);
    expect(res.marginBottom).to.equal(20);
  });

  it('Margin (10)', () => {
    const res = style.transform({
      Margin: 20,
    }) as any;
    expect(res.marginTop).to.equal(20);
    expect(res.marginRight).to.equal(20);
    expect(res.marginBottom).to.equal(20);
    expect(res.marginLeft).to.equal(20);
  });

  it('Margin ([10, null, "5em", "30px"])', () => {
    const res = style.transform({
      Margin: [10, null, '5em', '30px'],
    }) as any;
    expect(res.marginTop).to.equal(10);
    expect(res.marginRight).to.equal(undefined);
    expect(res.marginBottom).to.equal('5em');
    expect(res.marginLeft).to.equal(30);
  });
});
