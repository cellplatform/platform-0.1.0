import { t, R } from './common';

export type Ref = { id: Id; position: t.BoxPosition; size: { root: t.DomRect; child: t.DomRect } };
export type Refs = { [id: string]: Ref };

type Id = string;
type Index = number;
type Info = t.PositioningLayoutInfo;
type Overlap = t.PositioningLayoutOverlapInfo;

/**
 * API for querying layers.
 */
export function Query(layers: t.PositioningLayer[], refs: Refs) {
  const api: t.PositioningLayoutQuery = {
    get all() {
      return api.match();
    },
    index(index) {
      return find(index, layers, refs)[0];
    },
    match(id) {
      return find(id, layers, refs);
    },
    first(id) {
      return find(id, layers, refs)[0];
    },
    overlap(input) {
      return findOverlapping(input, api.match());
    },
  };
  return api;
}

/**
 * Lookup layers.
 */
function find(input: Id | Index | undefined, layers: t.PositioningLayer[], refs: Refs) {
  const list: Info[] = [];

  const add = (ref?: Ref) => {
    if (ref) {
      const index = layers.findIndex((layer) => layer.id === ref.id);
      const layer = layers[index];
      if (layer) {
        const id = ref.id;
        const size = ref.size.child;
        const position = layer.position;
        list.push({ index, id, size, position });
      }
    }
  };

  // Wildcard (all).
  if (input === undefined || input === '*') {
    layers.forEach((layer) => add(refs[layer.id]));
  }

  // Specific index.
  if (typeof input === 'number') {
    add(refs[layers[input]?.id]);
  }

  // ID match.
  if (typeof input === 'string' && input !== '*') {
    const matches = layers.filter((layer) => matchLayer(input, layer.id));
    matches.forEach((layer) => add(refs[layer.id]));
  }

  return list;
}

function matchLayer(query: string, id: Id) {
  if (query === id) return true;
  if (query.startsWith('*') && id.endsWith(query.replace(/^\*/, ''))) return true;
  if (query.endsWith('*') && id.startsWith(query.replace(/\*$/, ''))) return true;
  return false;
}

function findOverlapping(input: Id | Index, layers: Info[]): Overlap[] {
  const list: Overlap[] = [];
  const target = layers.find((layer) =>
    typeof input === 'number' ? layer.index === input : layer.id === input,
  );

  if (target) {
    layers.forEach((layer) => {
      if (layer.id === target.id) return; // Do not compare with self.
      const { x, y } = getOverlap(target.size, layer.size);
      if (x || y) {
        list.push({ ...layer, x, y });
      }
    });
  }

  return list;
}

function getOverlap(a: t.DomRect, b: t.DomRect) {
  let x = false;
  let y = false;

  if (a.left >= b.left && a.left <= b.right) x = true;
  if (b.left >= a.left && b.left <= a.right) x = true;

  if (a.top >= b.top && a.top <= b.bottom) y = true;
  if (b.top >= a.top && b.top <= a.bottom) y = true;

  return { x, y };
}
