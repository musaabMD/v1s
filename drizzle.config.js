export default {
  schema: "./app/src/lib/schema.js",
  out: "./drizzle",
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  }
}; 
