import { expect } from 'chai';
import { PeerEventNamespace } from './PeerEvents.ns';
import { Test } from 'sys.ui.dev';

export default Test.describe('PeerEvents', (e) => {
  e.describe('is', (e) => {
    const payload = {};
    const { is } = PeerEventNamespace;

    e.it('is.base (generic)', () => {
      expect(is.base({ type: 'foo', payload })).to.eql(false);

      expect(is.base({ type: 'sys.net/peer', payload })).to.eql(true);
      expect(is.base({ type: 'sys.net/group', payload })).to.eql(true);
      expect(is.base({ type: 'sys.net/fs', payload })).to.eql(true);
    });

    e.it('is.peer.base', () => {
      expect(is.peer.base({ type: 'foo', payload })).to.eql(false);
      expect(is.peer.base({ type: 'sys.net/peer', payload })).to.eql(true);
      expect(is.peer.base({ type: 'sys.net/peer/foo', payload })).to.eql(true);
    });

    e.it('is.peer.data', () => {
      expect(is.peer.data({ type: 'foo', payload })).to.eql(false);
      expect(is.peer.base({ type: 'sys.net/peer/data', payload })).to.eql(true);
    });

    e.it('is.peer.connection', () => {
      expect(is.peer.connection({ type: 'foo', payload })).to.eql(false);
      expect(is.peer.connection({ type: 'sys.net/peer/conn', payload })).to.eql(true);
    });

    e.it('is.peer.local', () => {
      expect(is.peer.local({ type: 'foo', payload })).to.eql(false);
      expect(is.peer.local({ type: 'sys.net/peer/local', payload })).to.eql(true);
    });

    e.it('is.group.base', () => {
      expect(is.group.base({ type: 'foo', payload })).to.eql(false);
      expect(is.group.base({ type: 'sys.net/group', payload })).to.eql(true);
    });

    e.it('is.fs.base', () => {
      expect(is.fs.base({ type: 'foo', payload })).to.eql(false);
      expect(is.fs.base({ type: 'sys.net/fs', payload })).to.eql(true);
    });
  });
});
