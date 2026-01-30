import { db } from "@/infra/db";
import { schema } from "@/infra/db/schemas";
import { fakerPT_BR as faker } from "@faker-js/faker"
import type { InferInsertModel } from "drizzle-orm";

export async function makeUpload(
  overrides?: Partial<InferInsertModel<typeof schema.uploads>>
) {
  const fakeFileName = faker.system.fileName()
  const result = await db.insert(schema.uploads).values({
    name: fakeFileName,
    remoteKey: fakeFileName,
    remoteUrl: `https://example.com/images/${fakeFileName}`,
    ...overrides
  }).returning()
  return result[0]
}
