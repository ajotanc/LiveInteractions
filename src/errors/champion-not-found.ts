export class ChampionNotFound extends Error {
  constructor() {
    super("Campeão escolhido não encontrado");
  }
}
