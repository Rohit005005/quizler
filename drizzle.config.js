import { defineConfig } from "drizzle-kit";
 
export default defineConfig({
  schema: "./configs/schema.js",
  out: "./drizzle",
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgresql://neondb_owner:c0eTxhjKUbM1@ep-cold-block-a5uzyh31.us-east-2.aws.neon.tech/quizler?sslmode=require',
  }
});