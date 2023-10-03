export class ChampionNotFound extends Error {
  constructor() {
    super("Champion chosen not found!");
  }
}
