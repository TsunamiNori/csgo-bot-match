import Matches from "./matches";

const matches = new Matches(1);
const matches2 = new Matches(2);

// Start all functions after 5 seconds to be sure everything is up-to-date
setTimeout(() => {
	matches.checkMatches();
	matches2.checkMatches();
}, 5000);
