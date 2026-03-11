import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { buildPosterUrl, getTopRatedMovies } from '$lib/server/tmdb';
import { strings } from '$lib/strings';
import { APIError } from 'better-auth/api';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}
	let topRatedMovies: { id: number; title: string; posterUrl: string | null; release_date: string | null }[] = [];
	let topRatedPage = 1;
	let topRatedTotalPages = 1;
	try {
		const { results, page, total_pages } = await getTopRatedMovies(1);
		topRatedMovies = results.map((r) => ({
			id: r.id,
			title: r.title,
			posterUrl: buildPosterUrl(r.poster_path),
			release_date: r.release_date
		}));
		topRatedPage = page;
		topRatedTotalPages = total_pages;
	} catch {
		// Page still works without TMDB data
	}
	return { topRatedMovies, topRatedPage, topRatedTotalPages };
};

export const actions: Actions = {
	signInEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		try {
			await auth.api.signInEmail({
				body: {
					email,
					password,
					callbackURL: '/'
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || strings.signinFailed });
			}
			return fail(500, { message: strings.unexpectedError });
		}

		return redirect(302, '/');
	},
	signUpEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const name = formData.get('name')?.toString() ?? '';

		try {
			await auth.api.signUpEmail({
				body: {
					email,
					password,
					name,
					callbackURL: '/'
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || strings.registrationFailed });
			}
			return fail(500, { message: strings.unexpectedError });
		}

		return redirect(302, '/');
	}
};
