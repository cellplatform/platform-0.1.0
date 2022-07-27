import { t, React, CommonEntry } from '../common';
import { DevSampleApp } from 'sys.net/lib/ui/DEV.Sample';

const entry: t.ModuleDefaultEntry = async (pump, ctx) => {
  // const bus = (await CommonEntry.init(pump, ctx)).bus;
  return <DevSampleApp />;
};

export default entry;
