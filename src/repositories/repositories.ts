import { pool } from "../config/database.js";
import type {
  InvestmentGoalBody,
  InvestmentGoalUpdate,
  InvestmentGoalQuery,
  InvestmentGoalResponse,
} from "../schema/schema.js";

export class InvestmentGoalRepository {
  async create(data: InvestmentGoalBody): Promise<InvestmentGoalResponse> {
    const valorPorMes = data.valor / data.meses.length;

    const result = await pool.query(
      `INSERT INTO investment_goals (nome, meses, valor, valor_por_mes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.nome, data.meses, data.valor, valorPorMes]
    );

    return this.mapToResponse(result.rows[0]);
  }

  async findAll(
    filters: InvestmentGoalQuery
  ): Promise<{ data: InvestmentGoalResponse[]; total: number }> {
    let query = "SELECT * FROM investment_goals WHERE 1=1";
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (filters.nome) {
      query += ` AND nome ILIKE $${paramIndex}`;
      params.push(`%${filters.nome}%`);
      paramIndex++;
    }

    if (filters.mes) {
      query += ` AND $${paramIndex} = ANY(meses)`;
      params.push(filters.mes);
      paramIndex++;
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);

    return {
      data: result.rows.map(this.mapToResponse),
      total: result.rows.length,
    };
  }

  async findById(id: number): Promise<InvestmentGoalResponse | null> {
    const result = await pool.query(
      "SELECT * FROM investment_goals WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapToResponse(result.rows[0]);
  }

  async update(
    id: number,
    data: InvestmentGoalUpdate
  ): Promise<InvestmentGoalResponse | null> {
    // Primeiro, busca o registro atual
    const current = await this.findById(id);
    if (!current) return null;

    // Mescla os dados
    const merged = {
      nome: data.nome ?? current.nome,
      meses: data.meses ?? current.meses,
      valor: data.valor ?? current.valor,
    };

    const valorPorMes = merged.valor / merged.meses.length;

    const result = await pool.query(
      `UPDATE investment_goals 
       SET nome = $1, meses = $2, valor = $3, valor_por_mes = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [merged.nome, merged.meses, merged.valor, valorPorMes, id]
    );

    return this.mapToResponse(result.rows[0]);
  }

  async delete(id: number): Promise<boolean> {
    const result = await pool.query(
      "DELETE FROM investment_goals WHERE id = $1",
      [id]
    );

    return (result.rowCount ?? 0) > 0;
  }

  private mapToResponse(row: any): InvestmentGoalResponse {
    return {
      id: row.id,
      nome: row.nome,
      meses: row.meses,
      valor: parseFloat(row.valor),
      valor_por_mes: parseFloat(row.valor_por_mes),
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
    };
  }
}