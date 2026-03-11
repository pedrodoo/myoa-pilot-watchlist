import { fail, redirect } from '@sveltejs/kit';
import { and, desc, eq } from 'drizzle-orm';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { movie } from '$lib/server/db/schema';
import { strings } from '$lib/strings';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}
	const movies = await db
		.select()
		.from(movie)
		.where(eq(movie.userId, event.locals.user.id))
		.orderBy(desc(movie.createdAt));
	return { user: event.locals.user, movies };
};

export const actions: Actions = {
	addMovie: async (event) => {
		if (!event.locals.user) {
			return redirect(302, '/login');
		}
		const formData = await event.request.formData();
		const title = formData.get('title')?.toString()?.trim();
		if (!title) {
			return fail(400, { message: strings.titleRequired });
		}
		const tmdbIdRaw = formData.get('tmdbId');
		const tmdbId =
			tmdbIdRaw !== null && tmdbIdRaw !== ''
				? parseInt(String(tmdbIdRaw), 10)
				: null;
		const posterPath = formData.get('poster_path')?.toString()?.trim() ?? null;
		await db.insert(movie).values({
			userId: event.locals.user.id,
			title,
			tmdbId: Number.isNaN(tmdbId) ? null : tmdbId,
			posterPath: posterPath || null
		});
		return redirect(302, '/');
	},
	deleteMovie: async (event) => {
		if (!event.locals.user) {
			return redirect(302, '/login');
		}
		const formData = await event.request.formData();
		const id = formData.get('id');
		const parsed = typeof id === 'string' ? parseInt(id, 10) : NaN;
		if (Number.isNaN(parsed) || parsed < 1) {
			return fail(400, { message: strings.invalidMovie });
		}
		await db
			.delete(movie)
			.where(and(eq(movie.id, parsed), eq(movie.userId, event.locals.user!.id)));
		return redirect(302, '/');
	},
	toggleMovieStatus: async (event) => {
		if (!event.locals.user) {
			return redirect(302, '/login');
		}
		const formData = await event.request.formData();
		const id = formData.get('id');
		const parsed = typeof id === 'string' ? parseInt(id, 10) : NaN;
		if (Number.isNaN(parsed) || parsed < 1) {
			return fail(400, { message: strings.invalidMovie });
		}
		const [row] = await db
			.select({ status: movie.status })
			.from(movie)
			.where(and(eq(movie.id, parsed), eq(movie.userId, event.locals.user!.id)))
			.limit(1);
		if (!row) {
			return fail(404, { message: strings.invalidMovie });
		}
		const nextStatus = row.status === 'want_to_watch' ? 'watched' : 'want_to_watch';
		await db
			.update(movie)
			.set({ status: nextStatus })
			.where(and(eq(movie.id, parsed), eq(movie.userId, event.locals.user!.id)));
		return redirect(302, '/');
	},
	signOut: async (event) => {
		await auth.api.signOut({
			headers: event.request.headers
		});
		return redirect(302, '/login');
	}
};
