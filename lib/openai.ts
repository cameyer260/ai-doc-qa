import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("OPENAI_API_KEY is not set");
}

export const openai = new OpenAI({
  apiKey,
});

// models we’ll use
export const EMBEDDING_MODEL = "text-embedding-3-small"; // cheap + solid
export const ANSWER_MODEL = "gpt-4o-mini";               // fast + affordable
