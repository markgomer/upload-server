import z from "zod";
import { Readable } from "node:stream"
import { basename, extname } from "node:path";
import { randomUUID } from "node:crypto";

import { Upload } from "@aws-sdk/lib-storage";
import { env } from "@/env";
import { r2 } from "./client";

const params = z.object({
  folder: z.enum(["images", "downloads"]),
  fileName: z.string(),
  contentType: z.string(),
  contentStream: z.instanceof(Readable)
})

type Params = z.input<typeof params>

export async function uploadFileToStorage(input: Params) {
  const { folder, fileName, contentType, contentStream } = params.parse(input)

  const fileExtension = extname(fileName)
  const fileNameWithoutExtension = basename(fileName)
  const sanitizedFileName = fileNameWithoutExtension.replace(/[^a-zA-Z0-9]/g, '')
  const sanitizedFileNameWithExtension = sanitizedFileName.concat(fileExtension)
  const uniqueFileName = `${folder}-${randomUUID()}-${sanitizedFileNameWithExtension}`

  const upload = new Upload({
    client: r2,
    params: {
      Key: uniqueFileName,
      Bucket: env.CLOUDFARE_BUCKET,
      Body: contentStream,
      ContentType: contentType
    }
  })
  await upload.done()
  return {
    key: fileName,
    url: new URL(uniqueFileName, env.CLOUDFARE_PUBLIC_URL).toString()
  }
}
