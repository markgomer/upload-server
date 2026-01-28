import { db } from "@/infra/db";
import { schema } from "@/infra/db/schemas";
import { makeLeft, makeRight, type Either } from "@/infra/shared/either";
import { Readable } from "node:stream"
import { z } from "zod";
import { InvalidFileFormat } from "./errors/invalid-file-format";

type UploadImageInput = z.input<typeof uploadImageInput>

const uploadImageInput = z.object({
  fileName: z.string(),
  contentType: z.string(),
  contentStream: z.instanceof(Readable)
})
const allowedMimeTypes = ["image/jpg", "image/jpeg", "image/png"]


export async function uploadImage(
  input: UploadImageInput
) : Promise<Either<InvalidFileFormat, { url: string }>> {
  const { fileName, contentType, contentStream } = uploadImageInput.parse(input)

  if(!allowedMimeTypes.includes(contentType)) {
    return makeLeft(new InvalidFileFormat)
  }

  // TODO: Carregar imagem para Cloudfare R2

  await db.insert(schema.uploads).values({
    name: fileName,
    remoteKey: fileName,
    remoteUrl: fileName
  })

  return makeRight({ url: '' })
}
