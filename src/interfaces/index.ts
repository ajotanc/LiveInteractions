import { ZodIssueOptionalMessage } from "zod";

export type SummonerLeagueInterface = {
  queueType?: string;
  wins?: number;
  veteran?: boolean;
  losses?: number;
  rank?: string;
  tier?: string;
  leaguePoints?: number;
};

export type UserWins = {
  [key: string]: string;
};

export type QueryObject = {
  [key: string]: string;
};

export type Weapons = {
  name: string;
  type: string;
};

export type CustomZodIssue = ZodIssueOptionalMessage & {
  received: string | undefined;
};
