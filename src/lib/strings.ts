/**
 * All user-facing text strings. Edit these to change copy across the app.
 */

export const strings = {
	/* -----------------------------------------------------------------------
	   App
	   ----------------------------------------------------------------------- */
	appTitle: 'Watchlist-O',
	appTagline: "Track your movies and TV shows. Popcorn not included.",

	/* -----------------------------------------------------------------------
	   Theme
	   ----------------------------------------------------------------------- */
	switchToDarkMode: 'Switch to dark mode',
	switchToLightMode: 'Switch to light mode',

	/* -----------------------------------------------------------------------
	   Auth
	   ----------------------------------------------------------------------- */
	signOut: 'Sign out',
	loginOrSignUp: 'Login or sign up',
	login: 'Login',
	register: 'Register',
	email: 'Email',
	password: 'Password',
	nameForRegistration: 'Your screenname',
	topRatedMovies: 'Top rated movies',
	nowPlayingMovies: 'Now playing',

	/* -----------------------------------------------------------------------
	   Watchlist / movies
	   ----------------------------------------------------------------------- */
	title: 'Movie title',
	addMovie: 'Add movie',
	addItem: 'Add item',
	searchMovie: 'Search for a movie',
	search: 'Search',
	searchResults: 'Search results',
	noResults: 'No results',
	yourList: 'Your list',
	listView: 'List view',
	gridView: 'Grid view',

	/* Filter & sort */
	filterStatus: 'Status',
	filterStatusAll: 'All',
	filterStatusWantToWatch: 'Want to watch',
	filterStatusWatched: 'Watched',
	sortBy: 'Sort by',
	sortNewestFirst: 'Newest first',
	sortOldestFirst: 'Oldest first',
	sortTitleAZ: 'Title A–Z',
	sortTitleZA: 'Title Z–A',
	sortRatingHighLow: 'Rating high–low',
	sortRatingLowHigh: 'Rating low–high',
	sortWantToWatchFirst: 'Want to watch first',
	sortWatchedFirst: 'Watched first',
	deleteItemAriaPrefix: 'Delete ', // Prepended to item label for aria-label, e.g. "Delete Inception"
	posterFor: 'Poster for ', // Prepended to title for img alt, e.g. "Poster for Inception"
	noPoster: 'No poster',
	markAsWatched: 'Mark as watched',
	markAsWantToWatch: 'Mark as want to watch',
	ratingAria: 'Rating: {0} out of 5 stars',
	setRatingAria: 'Set rating (1 to 5 stars)',
	movieDetailsNotAvailable: 'Details not available',
	closeMovieDetail: 'Close movie details',
	loadingMovieDetails: 'Loading…',
	movieDetailError: 'Could not load movie details.',
	genre: 'Genre',
	runtime: 'Runtime',
	releaseDate: 'Release date',
	tagline: 'Tagline',
	tmdbRating: 'TMDB rating',

	/* -----------------------------------------------------------------------
	   Error messages (shown after form submit)
	   ----------------------------------------------------------------------- */
	titleRequired: 'Title is required',
	invalidMovie: 'Invalid movie',
	signinFailed: 'Signin failed',
	registrationFailed: 'Registration failed',
	unexpectedError: 'Unexpected error'
} as const;
