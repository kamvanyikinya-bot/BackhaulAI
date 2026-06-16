import { spawnSync } from 'child_process';

export class DbService {
  static query(sql: string): any {
    try {
      const result = spawnSync('team-db', [sql], { encoding: 'utf8' });
      if (result.error) {
        throw result.error;
      }
      if (result.status !== 0) {
        console.error('Database query error:', result.stderr);
        return { error: result.stderr };
      }
      return JSON.parse(result.stdout);
    } catch (error: any) {
      console.error('Database query error:', error.message);
      return { error: error.message };
    }
  }

  static sanitize(val: any): string {
    if (typeof val === 'string') {
      return `'${val.replace(/'/g, "''")}'`;
    }
    if (val === null || val === undefined) {
      return 'NULL';
    }
    return val.toString();
  }
}
