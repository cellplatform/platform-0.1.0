import { t, React } from '../common';
import { DevHarness } from 'sys.data.json/lib/Dev.Harness';

const entry: t.ModuleDefaultEntry = (bus, ctx) => <DevHarness bus={bus} />;
export default entry;
