import { env } from '$env/dynamic/private';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';
const POSTER_BASE_LARGE = 'https://image.tmdb.org/t/p/w780';

export interface TmdbMovieResult {
	id: number;
	title: string;
	poster_path: string | null;
	release_date: string | null;
	vote_average?: number;
	vote_count?: number;
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

export interface TmdbGenre {
	id: number;
	name: string;
}

export interface TmdbMovieDetails {
	id: number;
	title: string;
	overview: string | null;
	poster_path: string | null;
	release_date: string | null;
	runtime: number | null;
	tagline: string | null;
	vote_average: number;
	vote_count: number;
	genres: TmdbGenre[];
}

/**
 * Build full poster URL from TMDB poster_path. Use when caching at add time.
 * @param size - 'w500' (default, list) or 'w780' (larger, e.g. detail modal)
 */
export function buildPosterUrl(
	posterPath: string | null,
	size: 'w500' | 'w780' = 'w500'
): string | null {
	if (!posterPath) return null;
	const base = size === 'w780' ? POSTER_BASE_LARGE : POSTER_BASE;
	return base + posterPath;
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

/**
 * Get now-playing movies from TMDB. Requires TMDB_API_KEY in env.
 * Returns results, page, and total_pages for pagination.
 */
export async function getNowPlayingMovies(
	page = 1
): Promise<{ results: TmdbMovieResult[]; page: number; total_pages: number }> {
	const key = env.TMDB_API_KEY;
	if (!key?.trim()) {
		throw new Error('TMDB_API_KEY is not set');
	}
	const url = new URL(TMDB_BASE + '/movie/now_playing');
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

/**
 * Get popular movies from TMDB. Requires TMDB_API_KEY in env.
 * Returns results, page, and total_pages for pagination.
 */
export async function getPopularMovies(
	page = 1
): Promise<{ results: TmdbMovieResult[]; page: number; total_pages: number }> {
	const key = env.TMDB_API_KEY;
	if (!key?.trim()) {
		throw new Error('TMDB_API_KEY is not set');
	}
	const url = new URL(TMDB_BASE + '/movie/popular');
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

/**
 * Get upcoming movies from TMDB. Requires TMDB_API_KEY in env.
 * Returns results, page, and total_pages for pagination.
 */
export async function getUpcomingMovies(
	page = 1
): Promise<{ results: TmdbMovieResult[]; page: number; total_pages: number }> {
	const key = env.TMDB_API_KEY;
	if (!key?.trim()) {
		throw new Error('TMDB_API_KEY is not set');
	}
	const url = new URL(TMDB_BASE + '/movie/upcoming');
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

/**
 * Get full movie details from TMDB by movie ID. Returns null if key missing or request fails.
 */
export async function getMovieDetails(tmdbId: number): Promise<TmdbMovieDetails | null> {
	const key = env.TMDB_API_KEY;
	if (!key?.trim()) {
		return null;
	}
	const url = new URL(`${TMDB_BASE}/movie/${tmdbId}`);
	const res = await fetch(url.toString(), {
		headers: {
			Authorization: `Bearer ${key}`
		}
	});
	if (!res.ok) {
		return null;
	}
	const data = (await res.json()) as TmdbMovieDetails;
	return {
		id: data.id,
		title: data.title ?? '',
		overview: data.overview ?? null,
		poster_path: data.poster_path ?? null,
		release_date: data.release_date ?? null,
		runtime: data.runtime ?? null,
		tagline: data.tagline ?? null,
		vote_average: data.vote_average ?? 0,
		vote_count: data.vote_count ?? 0,
		genres: data.genres ?? []
	};
}
