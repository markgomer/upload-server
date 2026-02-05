import { fastify } from "fastify"
import fastifyCors from "@fastify/cors"
import fastifyMultipart from "@fastify/multipart"
import fastifySwagger from "@fastify/swagger"
import fastifySwaggerUi from "@fastify/swagger-ui"
import {
  serializerCompiler,
  validatorCompiler,
  hasZodFastifySchemaValidationErrors,
} from "fastify-type-provider-zod"

import { transformSwaggerSchema } from "@/infra/http/transform-swagger-schema"
import { uploadImageRoute } from "@/infra/http/routes/upload-image"
import { getUploadsRoute } from "@/infra/http/routes/get-uploads"
import { exportUploadsRoute } from "@/infra/http/routes/export-uploads"
import { env } from "@/env"

const server = fastify()

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)
server.register(fastifyCors, { origin: '*' })
server.register(fastifyMultipart)
server.setErrorHandler((error, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      message: "Validation Error",
      issues: error.validation,
    })
  }
  // envia error para alguma ferramenta de usabilidade,
  // por exemplo: (Sentry/Datadog/Grafana/CTel)
  console.error(error)
  return reply.status(500).send({ message: "Internal server error." })
})
server.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Upload server",
      version: "1.0.0"
    }
  },
  transform: transformSwaggerSchema
})

// NOTE: launch the /docs route localhost:3333/docs
server.register(fastifySwaggerUi, {
  routePrefix: "/docs"
})
server.register(uploadImageRoute)
server.register(getUploadsRoute)
server.register(exportUploadsRoute)

console.log(env.DATABASE_URL)

server.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
  console.log("HTTP server runnning!")
})
