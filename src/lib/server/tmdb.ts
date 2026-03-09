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
 */
export async function searchMovies(query: string): Promise<TmdbMovieResult[]> {
	const key = env.TMDB_API_KEY;
	if (!key?.trim()) {
		throw new Error('TMDB_API_KEY is not set');
	}
	const url = new URL(TMDB_BASE + '/search/movie');
	url.searchParams.set('query', query.trim());
	const res = await fetch(url.toString(), {
		headers: {
			Authorization: `Bearer ${key}`
		}
	});
	if (!res.ok) {
		throw new Error(`TMDB API error: ${res.status}`);
	}
	const data = (await res.json()) as TmdbSearchResponse;
	return data.results ?? [];
}
