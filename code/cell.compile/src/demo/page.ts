console.log('hello', 1235);

const f = import('./m');

f.then(e => {
  console.log('e', e);
});

// import * as parcel from 'parcel';

// console.log('parcel', parcel);
