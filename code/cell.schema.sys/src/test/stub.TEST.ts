import { stub, expect } from '../test';

describe('stub', () => {
  it('App', async () => {
    const cells = { A1: { value: 'hello' } };
    const sheet = await stub.App.sheet('ns:foo', cells);

    const data = await sheet.data('App').load();
    const row = data.row(0);
    expect(row.props.name).to.eql('hello');
  });

  it('AppWindow', async () => {
    const cells = { A1: { value: '=myApp' } };
    const sheet = await stub.AppWindow.sheet('ns:foo', cells);

    const data = await sheet.data('AppWindow').load();
    const row = data.row(0);
    expect(row.props.app).to.eql('=myApp');
  });

  it('AppData', async () => {
    const cells = { A1: { value: '=myApp' } };
    const sheet = await stub.AppData.sheet('ns:foo', cells);

    const data = await sheet.data('AppData').load();
    const row = data.row(0);
    expect(row.props.app).to.eql('=myApp');
  });
});
