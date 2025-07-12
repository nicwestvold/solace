import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateSpecialtyEmbedding(
  specialties: string[]
): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is required");
  }

  const specialtyText = specialties.join(", ");

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: specialtyText,
    encoding_format: "float",
  });

  // The embedding model returns 1536 dimensions, but we need 256
  // We'll take the first 256 dimensions and normalize
  const embedding = response.data[0].embedding.slice(0, 256);

  // Normalize the embedding to unit length
  const magnitude = Math.sqrt(
    embedding.reduce((sum, val) => sum + val * val, 0)
  );
  return embedding.map((val) => val / magnitude);
}
