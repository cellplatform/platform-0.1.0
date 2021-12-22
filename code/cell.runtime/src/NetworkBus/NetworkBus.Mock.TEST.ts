import { t, expect, rx, is } from '../test';
import { NetworkBusMock } from '.';

type E = { type: 'foo'; payload: { count?: number } };

describe('NetworkBusMock', () => {
  it('defaults', () => {
    const netbus = NetworkBusMock<E>();
    expect(netbus.mock.local).to.eql('uri:me');
    expect(netbus.mock.out).to.eql([]);
    expect(netbus.mock.remotes).to.eql([]);
  });

  it('options', () => {
    const remotes: t.NetworkBusUri[] = ['uri:one', 'uri:two'];
    const netbus = NetworkBusMock<E>({ local: 'foo', remotes });
    expect(netbus.mock.local).to.eql('foo');
    expect(netbus.mock.remotes.map(({ uri }) => uri)).to.eql(remotes);
  });

  it('remotes', () => {
    const bus = rx.bus<E>();

    const netbus = NetworkBusMock<E>();
    expect(netbus.mock.remotes).to.eql([]);

    const res1 = netbus.mock.remote('uri:foo', bus);
    expect(res1.uri).to.eql('uri:foo');
    expect(res1.bus).to.equal(bus);
    expect(res1.fired).to.eql([]);

    const res2 = netbus.mock.remote('uri:bar');
    expect(res2.uri).to.eql('uri:bar');
    expect(is.observable(res2.bus.$)).to.equal(true);
    expect(res2.fired).to.eql([]);

    expect(netbus.mock.remotes.map(({ uri }) => uri)).to.eql(['uri:foo', 'uri:bar']);
  });
});
