import { env } from '$env/dynamic/private';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';

export interface TmdbMovieResult {
	id: number;
	title: string;
	poster_path: string | null;
	release_date: string | null;
}

export interface TmdbSearchResponse {
	results: TmdbMovieResult[];
	page?: number;
	total_pages?: number;
}

export interface TmdbTopRatedResponse {
	results: TmdbMovieResult[];
	page: number;
	total_pages: number;
}

/**
 * Build full poster URL from TMDB poster_path. Use when caching at add time.
 */
export function buildPosterUrl(posterPath: string | null): string | null {
	if (!posterPath) return null;
	return POSTER_BASE + posterPath;
}

/**
 * Search TMDB by movie title. Requires TMDB_API_KEY in env.
 * Returns results, page, and total_pages for pagination.
 */
export async function searchMovies(
	query: string,
	page = 1
): Promise<{ results: TmdbMovieResult[]; page: number; total_pages: number }> {
	const key = env.TMDB_API_KEY;
	if (!key?.trim()) {
		throw new Error('TMDB_API_KEY is not set');
	}
	const url = new URL(TMDB_BASE + '/search/movie');
	url.searchParams.set('query', query.trim());
	url.searchParams.set('page', String(page));
	const res = await fetch(url.toString(), {
		headers: {
			Authorization: `Bearer ${key}`
		}
	});
	if (!res.ok) {
		throw new Error(`TMDB API error: ${res.status}`);
	}
	const data = (await res.json()) as TmdbSearchResponse;
	return {
		results: data.results ?? [],
		page: data.page ?? page,
		total_pages: data.total_pages ?? 1
	};
}

/**
 * Get top-rated movies from TMDB. Requires TMDB_API_KEY in env.
 * Returns results, page, and total_pages for pagination.
 */
export async function getTopRatedMovies(
	page = 1
): Promise<{ results: TmdbMovieResult[]; page: number; total_pages: number }> {
	const key = env.TMDB_API_KEY;
	if (!key?.trim()) {
		throw new Error('TMDB_API_KEY is not set');
	}
	const url = new URL(TMDB_BASE + '/movie/top_rated');
	url.searchParams.set('page', String(page));
	const res = await fetch(url.toString(), {
		headers: {
			Authorization: `Bearer ${key}`
		}
	});
	if (!res.ok) {
		throw new Error(`TMDB API error: ${res.status}`);
	}
	const data = (await res.json()) as TmdbTopRatedResponse;
	return {
		results: data.results ?? [],
		page: data.page ?? page,
		total_pages: data.total_pages ?? 1
	};
}
