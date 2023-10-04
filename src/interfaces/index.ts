export interface SummonerLeagueInterface {
  queueType?: string;
  wins?: number;
  veteran?: boolean;
  losses?: number;
  rank?: string;
  tier?: string;
  leaguePoints?: number;
}

export interface UserWins {
  [key: string]: string;
}

export interface QueryObject {
  [key: string]: string;
}
