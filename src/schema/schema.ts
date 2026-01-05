import { z } from "zod";

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
] as const;

export const investmentGoalBodySchema = z.object({
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(255, "Nome deve ter no máximo 255 caracteres"),
  meses: z
    .array(z.enum(MESES, { message: "Mês inválido" }))
    .min(1, "Pelo menos um mês deve ser informado")
    .refine(
      (meses) => new Set(meses).size === meses.length,
      "Meses não podem ser duplicados"
    ),
  valor: z
    .number()
    .positive("Valor deve ser maior que zero")
    .multipleOf(0.01, "Valor deve ter no máximo 2 casas decimais"),
});

export const investmentGoalUpdateSchema = investmentGoalBodySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "Pelo menos um campo deve ser informado para atualização"
);

export const investmentGoalParamsSchema = z.object({
  id: z.coerce.number().int().positive("ID deve ser um número positivo"),
});

export const investmentGoalQuerySchema = z.object({
  nome: z.string().optional(),
  mes: z.enum(MESES).optional(),
});

export const investmentGoalResponseSchema = z.object({
  id: z.number(),
  nome: z.string(),
  meses: z.array(z.string()),
  valor: z.number(),
  valor_por_mes: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const investmentGoalListResponseSchema = z.object({
  data: z.array(investmentGoalResponseSchema),
  total: z.number(),
});

export const errorResponseSchema = z.object({
  statusCode: z.number(),
  error: z.string(),
  message: z.string(),
});

export type InvestmentGoalBody = z.infer<typeof investmentGoalBodySchema>;
export type InvestmentGoalUpdate = z.infer<typeof investmentGoalUpdateSchema>;
export type InvestmentGoalParams = z.infer<typeof investmentGoalParamsSchema>;
export type InvestmentGoalQuery = z.infer<typeof investmentGoalQuerySchema>;
export type InvestmentGoalResponse = z.infer<typeof investmentGoalResponseSchema>;