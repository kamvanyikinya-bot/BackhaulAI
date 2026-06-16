import { DbService } from './db.service';

export interface ReputationData {
  user_id: string;
  score: number;
  level: string;
  badges: string[];
  stats: {
    trips_completed: number;
    avg_rating: number;
    on_time_delivery_pct: number;
    response_rate: number;
    positive_reviews: number;
    negative_reviews: number;
  };
  updated_at?: string;
}

export class ReputationService {
  static async getReputation(userId: string): Promise<ReputationData> {
    const sql = `SELECT * FROM reputation_scores WHERE user_id = ${DbService.sanitize(userId)}`;
    const result = await DbService.query(sql);
    
    if (!result || result.length === 0) {
      return {
        user_id: userId,
        score: 0,
        level: 'newbie',
        badges: [],
        stats: {
          trips_completed: 0,
          avg_rating: 0,
          on_time_delivery_pct: 0,
          response_rate: 0,
          positive_reviews: 0,
          negative_reviews: 0
        }
      };
    }
    
    const rep = result[0];
    return {
      ...rep,
      badges: JSON.parse(rep.badges || '[]'),
      stats: JSON.parse(rep.stats || '{}')
    };
  }

  static async update(userId: string, stats: any) {
    const { score, level } = this.calculateScore(stats);
    const badges = this.calculateBadges(stats);
    
    const sql = `
      INSERT INTO reputation_scores (user_id, score, level, badges, stats)
      VALUES (
        ${DbService.sanitize(userId)},
        ${score},
        ${DbService.sanitize(level)},
        ${DbService.sanitize(JSON.stringify(badges))},
        ${DbService.sanitize(JSON.stringify(stats))}
      )
      ON CONFLICT(user_id) DO UPDATE SET
        score = excluded.score,
        level = excluded.level,
        badges = excluded.badges,
        stats = excluded.stats,
        updated_at = CURRENT_TIMESTAMP
    `;
    
    await DbService.query(sql);
    
    // Also update users table reputation_score (which is a REAL)
    await DbService.query(`UPDATE users SET reputation_score = ${score} WHERE id = ${DbService.sanitize(userId)}`);
    
    return { user_id: userId, score, level, badges };
  }

  private static calculateScore(stats: any) {
    // Scoring formula: 30pts trips + 35pts rating + 25pts on-time + 10pts response rate
    const tripPoints = Math.min(30, (stats.trips_completed || 0) / 10 * 3);
    const ratingPoints = (stats.avg_rating || 0) / 5 * 35;
    const onTimePoints = (stats.on_time_delivery_pct || 0) / 100 * 25;
    const responsePoints = (stats.response_rate || 0) / 100 * 10;
    
    const score = Number((tripPoints + ratingPoints + onTimePoints + responsePoints).toFixed(1));
    
    let level = 'newbie';
    if (score >= 90) level = 'platinum';
    else if (score >= 75) level = 'gold';
    else if (score >= 50) level = 'silver';
    else if (score >= 25) level = 'bronze';
    
    return { score, level };
  }

  private static calculateBadges(stats: any) {
    const badges: string[] = [];
    if ((stats.trips_completed || 0) >= 100) badges.push('century-rider');
    if ((stats.trips_completed || 0) >= 10 && (stats.avg_rating || 0) >= 4.8) badges.push('top-rated');
    if ((stats.on_time_delivery_pct || 0) >= 95) badges.push('always-on-time');
    if ((stats.response_rate || 0) >= 98) badges.push('quick-responder');
    return badges;
  }
}
