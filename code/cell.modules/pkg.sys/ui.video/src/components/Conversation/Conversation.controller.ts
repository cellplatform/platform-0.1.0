import { Observable, Subject, BehaviorSubject } from 'rxjs';
import {
  takeUntil,
  take,
  takeWhile,
  map,
  filter,
  share,
  delay,
  distinctUntilChanged,
  debounceTime,
  tap,
} from 'rxjs/operators';
import { t, rx, PeerJS, R } from './common';

/**
 * Manages state changes.
 */
export function stateController(args: { bus: t.EventBus<any>; model: t.ConversationModel }) {
  const { model } = args;
  let peer: PeerJS;
  const connections: PeerJS.DataConnection[] = [];

  const bus = args.bus.type<t.PeerEvent>();
  const dispose = () => dispose$.next();
  const dispose$ = new Subject<void>();
  const $ = bus.event$.pipe(takeUntil(dispose$));

  console.log('state controller');

  const changeModel = (data: Partial<t.ConversationState>) => {
    bus.fire({ type: 'Peer/model', payload: { data } });
  };

  /**
   * Init
   */
  rx.payload<t.PeerCreatedEvent>($, 'Peer/created')
    .pipe()
    .subscribe((e) => {
      console.log('created', e);

      peer = e.peer;
      /**
       * INCOMING (Recieve)
       */
      peer.on('connection', (conn) => {
        conn.on('data', (data) => {
          if (typeof data === 'object') {
            changeModel(data);
          }
        });
      });
    });

  /**
   * Peer connected. Setup outgoing connection.
   */
  rx.payload<t.PeerConnectEvent>($, 'Peer/connect')
    .pipe(filter((e) => Boolean(peer)))
    .subscribe((e) => {
      const conn = peer.connect(e.id);
      conn.on('open', () => connections.push(conn));
    });

  /**
   * Listen for data publish events.
   */
  rx.payload<t.PeerPublishEvent>($, 'Peer/publish')
    .pipe(filter((e) => Boolean(peer)))
    .subscribe((e) => {
      connections.forEach((conn) => conn.send(e.data));
      changeModel(e.data);
    });

  /**
   * Update model with new state.
   */
  rx.payload<t.PeerModelEvent>($, 'Peer/model')
    .pipe(filter((e) => Boolean(peer)))
    .subscribe((e) => {
      const state = { ...model.state, ...e.data };
      if (!R.equals(state, model.state)) {
        model.change(state);
      }
    });

  return {
    dispose$: dispose$.asObservable(),
    dispose,
  };
}
