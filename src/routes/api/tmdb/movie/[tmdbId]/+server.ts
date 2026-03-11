import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { buildPosterUrl, getMovieDetails } from '$lib/server/tmdb';

export const GET: RequestHandler = async (event) => {
	if (!event.locals.user) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' }
		});
	}
	const tmdbIdParam = event.params.tmdbId;
	const tmdbId = parseInt(tmdbIdParam ?? '', 10);
	if (Number.isNaN(tmdbId) || tmdbId < 1) {
		return new Response(JSON.stringify({ error: 'Invalid movie ID' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}
	const details = await getMovieDetails(tmdbId);
	if (!details) {
		return new Response(JSON.stringify({ error: 'Movie not found' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' }
		});
	}
	return json({
		...details,
		posterUrl: buildPosterUrl(details.poster_path, 'w780')
	});
};
