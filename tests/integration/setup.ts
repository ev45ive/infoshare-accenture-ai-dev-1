// Wymusza bazę integracyjną, żeby testy nigdy nie dotknęły głównego workshop.db.
process.env.DATABASE_URL = 'file:./.workshop/integration.db'
