import { expect, Mock, Uri } from '../../test';
import { Genesis, CellInfo } from '.';

describe('data.http: Genesis', () => {
  it('Genesis.cell', async () => {
    const { http, dispose } = await Mock.server();
    const A1 = Uri.create.A1();
    const genesis = Genesis(http, async () => A1);
    const getProps = async () => await http.cell(A1).db.props.read<CellInfo>();

    expect((await genesis.cell.uri()).toString()).to.eql(A1);
    expect((await getProps()).status).to.eql(404);

    await genesis.cell.ensureExists();

    const props = (await getProps()).body;
    expect(props.title).to.eql('Genesis');
    expect(props.type).to.eql('sys.data.Genesis');

    await dispose();
  });
});
