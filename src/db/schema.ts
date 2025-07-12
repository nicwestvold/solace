import { sql } from "drizzle-orm";
import {
  bigint,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  vector,
} from "drizzle-orm/pg-core";

const advocates = pgTable(
  "advocates",
  {
    id: serial("id").primaryKey(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    city: text("city").notNull(),
    degree: text("degree").notNull(),
    specialties: jsonb("payload").default([]).notNull(),
    yearsOfExperience: integer("years_of_experience").notNull(),
    phoneNumber: bigint("phone_number", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
    specialtyEmbedding: vector("specialty_embedding", {
      dimensions: 256,
    }),
  },
  (table) => ({
    specialty_embedding_index: index(
      "advocates_specialty_embedding_index"
    ).using("hnsw", table.specialtyEmbedding.op("vector_cosine_ops")),
  })
);

export { advocates };
