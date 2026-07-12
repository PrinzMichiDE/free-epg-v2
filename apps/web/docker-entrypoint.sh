#!/bin/sh
set -e
if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  node -e "
    import('drizzle-orm/postgres-js/migrator').then(async ({ migrate }) => {
      const { drizzle } = await import('drizzle-orm/postgres-js');
      const postgres = (await import('postgres')).default;
      const client = postgres(process.env.DATABASE_URL, { max: 1 });
      const db = drizzle(client);
      await migrate(db, { migrationsFolder: './packages/db/drizzle' });
      await client.end();
      console.log('Migrations done');
    }).catch(e => { console.error(e); process.exit(1); });
  " 2>/dev/null || echo "Migration skipped (packages not available in standalone)"
fi
exec "$@"
