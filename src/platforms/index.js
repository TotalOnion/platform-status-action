const pantheon = require("./pantheon");
const cloudflare = require("./cloudflare");

module.exports = {
	[pantheon.name]: pantheon,
	[cloudflare.name]: cloudflare,
};
