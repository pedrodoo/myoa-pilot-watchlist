import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { buildPosterUrl, getTopRatedMovies } from '$lib/server/tmdb';

export const GET: RequestHandler = async (event) => {
	const pageParam = event.url.searchParams.get('page');
	const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
	try {
		const { results, page: currentPage, total_pages } = await getTopRatedMovies(page);
		const movies = results.map((r) => ({
			id: r.id,
			title: r.title,
			posterUrl: buildPosterUrl(r.poster_path),
			release_date: r.release_date
		}));
		return json({ results: movies, page: currentPage, total_pages });
	} catch {
		return new Response(JSON.stringify({ error: 'Failed to load top rated movies' }), {
			status: 502,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
