import { t, React } from '../common';
import { DevHarness } from 'sys.fs/lib/Dev.Harness';

const entry: t.ModuleDefaultEntry = (bus, ctx) => <DevHarness bus={bus} />;
export default entry;
