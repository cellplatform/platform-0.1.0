import { constants, Client, Schema, t } from '../src/common';

// const HOST = 'dev.db.team';
const HOST = 'localhost:8080';
const NS = 'ns:ck68bc6f2000b08l59z4v14g2';

const client = Client.create(HOST);
const ns = client.ns(NS);

(async () => {
  const cells: t.ICellMap = {
    // A1: { value: 'title' },
    // B1: { value: 'string' },
    // C1: { value: 'Meeting Invite.' },
  };

  const add = (row: number, key: string, type: string, value: string) => {
    cells[`A${row}`] = { value: key };
    cells[`B${row}`] = { value: type };
    cells[`C${row}`] = { value: value };
  };

  cells.A1 = { value: 'title' };
  cells.B1 = { value: 'Meeting Invite.' };

  // Invitees.
  cells.A2 = { value: 'invitees:' };

  cells.B2 = { value: 'phil@hypersheet.io' };
  cells.C2 = { value: 'http://localhost:8080/cell:ck5st4aop0000ffet9pi2fkvp!B1/file:621bttku.png' };

  cells.B3 = { value: 'woo@hypersheet.io' };
  cells.C3 = { value: 'http://localhost:8080/cell:ck5st4aop0000ffet9pi2fkvp!B1/file:2z14tt2l.jpg' };

  cells.B4 = { value: 'gautam@hypersheet.io' };
  cells.C4 = { value: 'http://localhost:8080/cell:ck5st4aop0000ffet9pi2fkvp!B1/file:2y10ttxl.jpg' };

  // Activity log (REF).
  cells.A5 = { value: 'activity log' };
  cells.B5 = { value: 'ns:ck68ivf06000008l44wpo1dxl' };

  // State.
  cells.A6 = { value: 'state:' };

  cells.B7 = { value: 'date:' };
  cells.C7 = { value: 'Thu Feb 06 2020 11:00:00 GMT+1300' };

  // add(1, 'title', 'string', 'Meeting Invite.');
  // add(2, 'to', 'email', 'phil@hypersheet.io, woo@hypersheet.io, gautam@hypersheet.io');

  await ns.write({ cells });
  const res = await ns.read({ data: true });

  // console.log('res.changes', res.);
  console.log('-------------------------------------------');
  console.log('res', res.body.data);
})();
