import { Pool } from "pg";

export const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/investment_goals",
});

export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS investment_goals (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        meses TEXT[] NOT NULL,
        valor DECIMAL(15, 2) NOT NULL,
        valor_por_mes DECIMAL(15, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Database initialized successfully");
  } finally {
    client.release();
  }
}