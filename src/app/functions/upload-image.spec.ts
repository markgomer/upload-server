import { randomUUID } from "node:crypto"
import { Readable } from "node:stream"
import { eq } from "drizzle-orm";
import { it, expect, describe, beforeAll, mock } from "bun:test";

import { db } from "@/infra/db";
import { schema } from "@/infra/db/schemas";
import { InvalidFileFormat } from '@/app/functions/errors/invalid-file-format'
import { uploadImage } from "@/app/functions/upload-image"
import { isLeft, isRight, unwrapEither } from "@/infra/shared/either"

describe("upload-image", () => {
  beforeAll(() => {
    mock.module("@/infra/storage/upload-file-to-storage", () => {
      return {
        uploadFileToStorage: mock(() => ({
          key: `${randomUUID()}.jpg`,
          url: "https://storage.com/image.jpg"
        }))
      }
    })
  })

  it("should be able to upload an image", async () => {
    const fileName = `${randomUUID()}.jpg`
    // NOTE: sut = "system under test"
    const sut = await uploadImage({
      fileName: fileName,
      contentType: "image/jpg",
      contentStream: Readable.from([])
    })
    expect(isRight(sut)).toBe(true)

    const result = await db
      .select()
      .from(schema.uploads)
      .where(eq(schema.uploads.name, fileName))
    expect(result).toHaveLength(1)
  })

  it("Should not be able to upload an invalid file format", async () => {
    const fileName = `${randomUUID()}.pdf`
    const sut = await uploadImage({
      fileName,
      contentType: "document/pdf",
      contentStream: Readable.from([])
    })
    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(InvalidFileFormat)
  })
})
