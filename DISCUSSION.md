# Discussion

## Decisions made

- updated the postgres docker-compose file to use a version of postgres that had pgvector support
- added `specialtyEmbedding` to the database
  - I wanted to be able to do a vector search on the specialty field.
  - an OPENAI API key is required to generate embeddings for the specialties
- updated the UI around the search, relied on shadcn/ui components

## Thoughts

- The vector search isn't where I want it to be. Perhaps I need to change the size of the embeddings, or the model used to generate them.
- I don't like how the table goes from the loading (skeleton state) to the full table. Looks like flickering.
