import Fastify from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
  jsonSchemaTransform,
} from "fastify-type-provider-zod";
import { initializeDatabase } from "./config/database.js";
import { investmentGoalsRoutes } from "./routes/routes.js";

async function bootstrap() {
  const app = Fastify({
    logger: true,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "API de Investimento",
        description: "API RESTful para gerenciar metas de investimento",
        version:aa "1.0.0",
      },
      servers: [
        {
          url: `http://localhost:${process.env.PORT || 3000}`,
          description: "Servidor de desenvolvimento",
        },
      ],
      tags: [
        {
          name: "Metas de Investimento",
          description: "Operações CRUD de metas de investimento",
        },
      ],
    },
    transform: jsonSchemaTransform,
  });

  await app.register(fastifySwaggerUI, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
    },
  });

  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);

    const err = error as Error & { statusCode?: number; validation?: boolean };

    if (err.validation) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: err.message,
      });
    }

    return reply.status(err.statusCode || 500).send({
      statusCode: err.statusCode || 500,
      error: err.name || "Internal Server Error",
      message: err.message || "Erro interno do servidor",
    });
  });

  await app.register(investmentGoalsRoutes);

  app.get("/health", async () => ({ status: "ok" }));

  await initializeDatabase();

  const port = Number(process.env.PORT) || 3000;
  await app.listen({ port, host: "0.0.0.0" });

  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`📚 Docs available at http://localhost:${port}/docs`);
}

bootstrap().catch(console.error);