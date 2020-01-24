const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec quam lorem. Praesent fermentum, augue ut porta varius, eros nisl euismod ante, ac suscipit elit libero nec dolor. Morbi magna enim, molestie non arcu id, varius sollicitudin neque. In sed quam mauris. Aenean mi nisl, elementum non arcu quis, ultrices tincidunt augue. Vivamus fermentum iaculis tellus finibus porttitor. Nulla eu purus id dolor auctor suscipit. Integer lacinia sapien at ante tempus volutpat.';

console.log('👋');
console.log('👋 console.log():');
console.log('👋   Hello World!');
console.log('👋');

const el = document.getElementById('root');
const message = `Text updated from TypeScript. (Parcel v1)`;
el.innerHTML = `<strong>${message}</strong> ${LOREM}`;
