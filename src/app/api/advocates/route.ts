import db from "../../../db";
import { advocates } from "../../../db/schema";
import { and, or, ilike, count, SQL, sql } from "drizzle-orm";
import { generateSpecialtyEmbedding } from "../../../lib/openai";
// import { advocateData } from "../../../db/seed/advocates";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  // Build search filters
  const filters: SQL[] = [];

  if (search) {
    const searchPattern = `%${search}%`;

    // Always include name search
    const nameSearch = sql`${advocates.firstName} || ' ' || ${advocates.lastName} ILIKE ${searchPattern}`;

    // Always include city search
    const citySearch = ilike(advocates.city, searchPattern);

    // Add vector similarity search if OpenAI is available
    if (process.env.OPENAI_API_KEY) {
      try {
        // Generate embedding for the search query
        const searchEmbedding = await generateSpecialtyEmbedding([search]);

        // Combine name, city, and vector similarity search
        const data = await db
          .select()
          .from(advocates)
          .where(
            and(
              sql`${advocates.specialtyEmbedding} IS NOT NULL`,
              or(
                nameSearch,
                citySearch,
                sql`${advocates.specialtyEmbedding} <=> ${searchEmbedding} < 0.8` // Similarity threshold
              )
            )
          )
          .orderBy(sql`${advocates.specialtyEmbedding} <=> ${searchEmbedding}`)
          .limit(limit)
          .offset(offset);

        const [totalCountResult] = await db
          .select({ count: count() })
          .from(advocates)
          .where(
            and(
              sql`${advocates.specialtyEmbedding} IS NOT NULL`,
              or(
                nameSearch,
                citySearch,
                sql`${advocates.specialtyEmbedding} <=> ${searchEmbedding} < 0.8`
              )
            )
          );

        return Response.json({
          data,
          pagination: {
            page,
            limit,
            total: totalCountResult.count,
            totalPages: Math.ceil(totalCountResult.count / limit),
          },
        });
      } catch (error) {
        console.error("Vector search error:", error);
        // Fall back to text search if vector search fails
      }
    }

    // Text-based search (fallback when vector search fails or OpenAI not available)
    const searchConditions = [
      nameSearch,
      citySearch,
      ilike(advocates.degree, searchPattern),
      sql`${advocates.specialties}::text ILIKE ${searchPattern}`,
    ].filter((condition): condition is SQL<unknown> => condition !== undefined);

    if (searchConditions.length > 0) {
      // @ts-ignore - TypeScript may not infer the type correctly
      filters.push(or(...searchConditions));
    }
  }

  // Uncomment this line to use a local database
  // const data = advocateData;
  const whereClause = filters.length > 0 ? and(...filters) : undefined;

  const data = await db
    .select()
    .from(advocates)
    .where(whereClause)
    .limit(limit)
    .offset(offset);

  const [totalCountResult] = await db
    .select({ count: count() })
    .from(advocates)
    .where(whereClause);

  return Response.json({
    data,
    pagination: {
      page,
      limit,
      total: totalCountResult.count,
      totalPages: Math.ceil(totalCountResult.count / limit),
    },
  });
}
