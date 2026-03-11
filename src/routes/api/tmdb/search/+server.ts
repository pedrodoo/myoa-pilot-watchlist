import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { buildPosterUrl, searchMovies } from '$lib/server/tmdb';

export const GET: RequestHandler = async (event) => {
	if (!event.locals.user) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' }
		});
	}
	const query = event.url.searchParams.get('query')?.trim();
	if (!query) {
		return new Response(JSON.stringify({ error: 'Missing query' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}
	const pageParam = event.url.searchParams.get('page');
	const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
	try {
		const { results, page: currentPage, total_pages } = await searchMovies(query, page);
		const withPosterUrl = results.map((r) => ({
			id: r.id,
			title: r.title,
			poster_path: r.poster_path,
			posterUrl: buildPosterUrl(r.poster_path),
			release_date: r.release_date,
			vote_average: r.vote_average,
			vote_count: r.vote_count
		}));
		return json({ results: withPosterUrl, page: currentPage, total_pages });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'TMDB request failed';
		return new Response(JSON.stringify({ error: message }), {
			status: 502,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
