export type RecordButtonClickEvent = { current: RecordButtonState; action?: RecordButtonAction };
export type RecordButtonClickEventHandler = (e: RecordButtonClickEvent) => void;

export type RecordButtonState = 'default' | 'recording' | 'paused';
export type RecordButtonAction = 'resume' | 'finish';
