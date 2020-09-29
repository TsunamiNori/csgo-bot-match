import Matches from "./matches";

const matches = new Matches();

// Start all functions after 5 seconds to be sure everything is up-to-date
setTimeout(() => {
	matches.checkMatches();
}, 5000);
