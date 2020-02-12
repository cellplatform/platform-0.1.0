export type LoadedView = { default: (props: {}) => JSX.Element };

export type View = {
  name: string;
  load: () => Promise<LoadedView>;
};

/**
 * History/Log
 */
export type ILogItem = {
  id: string;
  date: number;
  title: string;
  detail: string;
};

/**
 * Agenda
 */
export type IAgendaItem = {
  detail: string;
};
