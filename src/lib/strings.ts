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
	deleteItemAriaPrefix: 'Delete ', // Prepended to item label for aria-label, e.g. "Delete Inception"
	posterFor: 'Poster for ', // Prepended to title for img alt, e.g. "Poster for Inception"
	noPoster: 'No poster',
	markAsWatched: 'Mark as watched',
	markAsWantToWatch: 'Mark as want to watch',

	/* -----------------------------------------------------------------------
	   Error messages (shown after form submit)
	   ----------------------------------------------------------------------- */
	titleRequired: 'Title is required',
	invalidMovie: 'Invalid movie',
	signinFailed: 'Signin failed',
	registrationFailed: 'Registration failed',
	unexpectedError: 'Unexpected error'
} as const;
