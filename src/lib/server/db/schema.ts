import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

export const movie = pgTable('movie', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	tmdbId: integer('tmdb_id'),
	posterPath: text('poster_path'),
	status: text('status').notNull().default('want_to_watch'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export * from './auth.schema';
