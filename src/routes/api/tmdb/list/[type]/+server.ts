import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	buildPosterUrl,
	getNowPlayingMovies,
	getPopularMovies,
	getTopRatedMovies,
	getUpcomingMovies
} from '$lib/server/tmdb';

const VALID_TYPES = ['top_rated', 'now_playing', 'popular', 'upcoming'] as const;
type ListType = (typeof VALID_TYPES)[number];

const HANDLERS: Record<ListType, (page: number) => ReturnType<typeof getTopRatedMovies>> = {
	top_rated: getTopRatedMovies,
	now_playing: getNowPlayingMovies,
	popular: getPopularMovies,
	upcoming: getUpcomingMovies
};

export const GET: RequestHandler = async (event) => {
	if (!event.locals.user) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' }
		});
	}
	const type = event.params.type;
	if (!type || !VALID_TYPES.includes(type as ListType)) {
		return new Response(JSON.stringify({ error: 'Invalid list type' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}
	const pageParam = event.url.searchParams.get('page');
	const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
	try {
		const handler = HANDLERS[type as ListType];
		const { results, page: currentPage, total_pages } = await handler(page);
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
