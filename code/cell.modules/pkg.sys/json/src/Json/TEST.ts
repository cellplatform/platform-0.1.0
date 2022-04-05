import { Test, expect } from 'sys.ui.dev';
import { Json } from '.';
import { JsonBus } from '../Json.Bus';
import { Patch } from '../Json.Patch';

export default Test.describe('Json', (e) => {
  e.it('exposes [JsonBus]', () => {
    expect(Json.Bus).to.equal(JsonBus);
  });

  e.it('exposes [Patch]', () => {
    expect(Json.Patch).to.equal(Patch);
  });
});
