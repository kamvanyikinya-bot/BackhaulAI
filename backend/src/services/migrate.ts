import fs from 'fs';
import path from 'path';
import { DbService } from './db.service';

export async function migrate() {
  const migrationsDir = path.join(__dirname, '../../migrations');
  if (!fs.existsSync(migrationsDir)) return;

  const files = fs.readdirSync(migrationsDir).sort();
  for (const file of files) {
    if (file.endsWith('.sql')) {
      console.log(`Running migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      const statements = sql.split(';').filter(s => s.trim() !== '');
      for (const statement of statements) {
        DbService.query(statement);
      }
    }
  }
}

if (require.main === module) {
  migrate().then(() => console.log('Migrations complete'));
}
