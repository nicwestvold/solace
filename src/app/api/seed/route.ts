import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";
import { generateSpecialtyEmbedding } from "../../../lib/openai";
import { count } from "drizzle-orm";

// Utility function to clear existing data
async function clearExistingData() {
  await db.delete(advocates);
}

// Utility function to check if data exists
async function checkExistingData() {
  const [result] = await db.select({ count: count() }).from(advocates);
  return result.count;
}

export async function GET() {
  try {
    const existingCount = await checkExistingData();
    return Response.json({
      existingRecords: existingCount,
      totalToSeed: advocateData.length,
      readyToSeed: existingCount === 0,
    });
  } catch (error) {
    return Response.json(
      { error: "Failed to check database state" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await clearExistingData();
    return Response.json({
      message: "Successfully cleared all advocate data",
    });
  } catch (error) {
    console.error("Error clearing advocates:", error);
    return Response.json(
      {
        error: "Failed to clear advocates",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        {
          error: "OpenAI API key not found",
          details: "Please set OPENAI_API_KEY environment variable",
        },
        { status: 400 }
      );
    }

    // Check if data already exists
    const existingCount = await checkExistingData();
    if (existingCount > 0) {
      return Response.json(
        {
          error: "Database already contains data",
          details: `Found ${existingCount} existing records. Use DELETE to clear first.`,
        },
        { status: 409 }
      );
    }

    console.log("Generating embeddings for advocates...");

    // Generate embeddings for each advocate
    const advocatesWithEmbeddings = await Promise.all(
      advocateData.map(async (advocate, index) => {
        console.log(
          `Processing advocate ${index + 1}/${advocateData.length}: ${
            advocate.firstName
          } ${advocate.lastName}`
        );
        const specialtyEmbedding = await generateSpecialtyEmbedding(
          advocate.specialties
        );
        return {
          ...advocate,
          specialtyEmbedding,
        };
      })
    );

    console.log("Inserting advocates into database...");

    const records = await db
      .insert(advocates)
      .values(advocatesWithEmbeddings)
      .returning();

    return Response.json({
      advocates: records,
      message: `Successfully seeded ${records.length} advocates with embeddings`,
      totalProcessed: advocateData.length,
    });
  } catch (error) {
    console.error("Error seeding advocates:", error);
    return Response.json(
      {
        error: "Failed to seed advocates",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
