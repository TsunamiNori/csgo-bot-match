import Matches from "./matches";

const matches = new Matches(1);

// Start all functions after 5 seconds to be sure everything is up-to-date
setTimeout(() => {
	matches.checkMatches().then();
}, 5000);
