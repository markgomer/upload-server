import { uploadImageRoute } from "./routes/upload-image"
import { fastify } from "fastify"
import fastifyCors from "@fastify/cors"
import fastifyMultipart from "@fastify/multipart"
import fastifySwagger from "@fastify/swagger"
import {
  serializerCompiler,
  validatorCompiler,
  hasZodFastifySchemaValidationErrors,
  jsonSchemaTransform
} from "fastify-type-provider-zod"
import { env } from "@/env"
import fastifySwaggerUi from "@fastify/swagger-ui"

const server = fastify()

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

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

server.register(fastifyCors, { origin: '*' })
server.register(fastifyMultipart)
server.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Upload server",
      version: "1.0.0"
    }
  },
  transform: jsonSchemaTransform
})
server.register(fastifySwaggerUi, {
  routePrefix: "/docs"
})
server.register(uploadImageRoute)

console.log(env.DATABASE_URL)

server.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
  console.log("HTTP server runnning!")
})
