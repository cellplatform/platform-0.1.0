/**
 * Data (Model)
 */
export type ShellData = { name: string; registrations?: ShellDataModuleRegistration[] };
export type ShellDataModuleRegistration = { module: string; parent: string };
