function getIcon(color) {
	switch (color) {
		case "green":
			return "🟢";
		case "orange":
			return "🟠";
		case "red":
			return "🔴";
		default:
			return "⚪";
	}
}

module.exports = { getIcon };
