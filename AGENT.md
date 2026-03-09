# Agent guidelines

- **Local development uses the live database.** Be careful with destructive changes.
- **Database schema changes:** Always use `db:generate` then `db:migrate`. **Do not use** `db:push`.
