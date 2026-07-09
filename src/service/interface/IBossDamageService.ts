export interface IBossDamageService {
  damage(request: {
    playerId: string;
    bossId: string;
    damageAmount: number;
  }): Promise<void>;
}
