import { expect, t } from '../../test';
import { PeerEventNamespace } from './PeerEvents.ns';

describe('Events Namespace', () => {
  describe('is', () => {
    const payload = {};
    const { is } = PeerEventNamespace;

    it('is.event ({ type, payload })', () => {
      expect(is.event(undefined)).to.eql(false);
      expect(is.event(123)).to.eql(false);
      expect(is.event('foo')).to.eql(false);
      expect(is.event({})).to.eql(false);
      expect(is.event({ type: 'name' })).to.eql(false);

      expect(is.event({ type: 'name', payload })).to.eql(true);
    });

    it('is.base (generic)', () => {
      expect(is.base({ type: 'foo', payload })).to.eql(false);

      expect(is.base({ type: 'sys.net/peer', payload })).to.eql(true);
      expect(is.base({ type: 'sys.net/group', payload })).to.eql(true);
      expect(is.base({ type: 'sys.net/fs', payload })).to.eql(true);
    });

    it('is.peer.base', () => {
      expect(is.peer.base({ type: 'foo', payload })).to.eql(false);
      expect(is.peer.base({ type: 'sys.net/peer', payload })).to.eql(true);
      expect(is.peer.base({ type: 'sys.net/peer/foo', payload })).to.eql(true);
    });

    it('is.peer.data', () => {
      expect(is.peer.data({ type: 'foo', payload })).to.eql(false);
      expect(is.peer.base({ type: 'sys.net/peer/data', payload })).to.eql(true);
    });

    it('is.peer.connection', () => {
      expect(is.peer.connection({ type: 'foo', payload })).to.eql(false);
      expect(is.peer.connection({ type: 'sys.net/peer/conn', payload })).to.eql(true);
    });

    it('is.peer.local', () => {
      expect(is.peer.local({ type: 'foo', payload })).to.eql(false);
      expect(is.peer.local({ type: 'sys.net/peer/local', payload })).to.eql(true);
    });

    it('is.group.base', () => {
      expect(is.group.base({ type: 'foo', payload })).to.eql(false);
      expect(is.group.base({ type: 'sys.net/group', payload })).to.eql(true);
    });

    it('is.fs.base', () => {
      expect(is.fs.base({ type: 'foo', payload })).to.eql(false);
      expect(is.fs.base({ type: 'sys.net/fs', payload })).to.eql(true);
    });
  });
});
