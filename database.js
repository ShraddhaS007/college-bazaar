import Pool  from "pg";

const pool = new Pool.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
      rejectUnauthorized: false, // Required for Render's managed PostgreSQL
  },
});

// Example query
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
      console.error('Error connecting to the database', err);
  } else {
      console.log('Database connected:', res.rows);
  }
  pool.end();
});

export default pool;