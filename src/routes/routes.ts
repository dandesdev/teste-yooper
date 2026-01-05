import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { InvestmentGoalRepository } from "../repositories/repositories.js";
import {
  investmentGoalBodySchema,
  investmentGoalUpdateSchema,
  investmentGoalParamsSchema,
  investmentGoalQuerySchema,
  investmentGoalResponseSchema,
  investmentGoalListResponseSchema,
  errorResponseSchema,
} from "../schema/schema.js";
import z from "zod";

const repository = new InvestmentGoalRepository();

export async function investmentGoalsRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.post(
    "/teste-yooper",
    {
      schema: {
        summary: "Criar meta de investimento",
        description:
          "Cria uma nova meta de investimento. O valor é dividido igualmente entre os meses.",
        tags: ["Metas de Investimento"],
        body: investmentGoalBodySchema,
        response: {
          201: investmentGoalResponseSchema,
          400: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const goal = await repository.create(request.body);
      return reply.status(201).send(goal);
    }
  );

  server.get(
    "/teste-yooper",
    {
      schema: {
        summary: "Listar metas de investimento",
        description: "Lista todas as metas com filtros opcionais por nome e mês",
        tags: ["Metas de Investimento"],
        querystring: investmentGoalQuerySchema,
        response: {
          200: investmentGoalListResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await repository.findAll(request.query);
      return reply.send(result);
    }
  );

  server.get(
    "/teste-yooper/:id",
    {
      schema: {
        summary: "Buscar meta por ID",
        description: "Retorna uma meta de investimento específica",
        tags: ["Metas de Investimento"],
        params: investmentGoalParamsSchema,
        response: {
          200: investmentGoalResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const goal = await repository.findById(request.params.id);

      if (!goal) {
        return reply.status(404).send({
          statusCode: 404,
          error: "Not Found",
          message: `Meta de investimento com ID ${request.params.id} não encontrada`,
        });
      }

      return reply.send(goal);
    }
  );

  server.put(
    "/teste-yooper/:id",
    {
      schema: {
        summary: "Atualizar meta de investimento",
        description:
          "Atualiza uma meta existente. O valor é recalculado entre os meses.",
        tags: ["Metas de Investimento"],
        params: investmentGoalParamsSchema,
        body: investmentGoalUpdateSchema,
        response: {
          200: investmentGoalResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const goal = await repository.update(request.params.id, request.body);

      if (!goal) {
        return reply.status(404).send({
          statusCode: 404,
          error: "Not Found",
          message: `Meta de investimento com ID ${request.params.id} não encontrada`,
        });
      }

      return reply.send(goal);
    }
  );

  server.delete(
    "/investment-goals/:id",
    {
      schema: {
        summary: "Remover meta de investimento",
        description: "Remove uma meta",
        tags: ["Metas de Investimento"],
        params: investmentGoalParamsSchema,
        response: {
          204: z.null().describe("Meta removida com sucesso"),
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const deleted = await repository.delete(request.params.id);

      if (!deleted) {
        return reply.status(404).send({
          statusCode: 404,
          error: "Not Found",
          message: `Meta com ID ${request.params.id} não encontrada`,
        });
      }

      return reply.status(204).send();
    }
  );
}