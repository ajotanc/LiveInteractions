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

export type ColumnOthers = {
  group: string;
  urlGroup: string | false;
  description: string;
  father: string | false;
  urlFather: string | false;
  required: boolean;
  condition?: string;
};

export type ParametersOthers = {
  id?: string;
  name?: string;
  description?: string;
  events: {
    summary: Array<ColumnOthers>;
    records: Array<ColumnOthers>;
  };
};

export type Parameters = {
  version: string;
  comments: string;
  url: string;
  menu: Array<{
    group: string;
    options: Array<{
      text: string;
      value: string;
    }>;
  }>;
  records: Array<ParametersOthers>;
};
