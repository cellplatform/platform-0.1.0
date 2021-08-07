/**
 * Events
 */
export type VercelEvent = VercelTeamReqEvent | VercelTeamResEvent;

/**
 * Compile the project into a bundle.
 */
export type VercelTeamReqEvent = {
  type: 'http.vercel/team:req';
  payload: VercelTeamReq;
};
export type VercelTeamReq = { tx?: string };

export type VercelTeamResEvent = {
  type: 'http.vercel/team:res';
  payload: VercelTeamRes;
};
export type VercelTeamRes = { tx: string; error?: string };
