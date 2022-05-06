import * as t from '../../common/types';

/**
 * Fired when the [DevEnv] is ready and active.
 */
export type DevEnvReadyHandler = (e: DevEnvReadyArgs) => void;
export type DevEnvReadyArgs = { editor: t.CodeEditorInstanceEvents };
