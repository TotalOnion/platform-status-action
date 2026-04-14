const { getIcon } = require("../utils");

module.exports = {
	name: "cloudflare",
	baseURL: "https://www.cloudflarestatus.com",
	endpoint: "/api/v2/summary.json",
	failOnRedDefault: false,

	mapStatus(data) {
		const indicator = data?.status?.indicator ?? "unknown";
		const description = data?.status?.description ?? "Unknown";

		let color = "orange";
		if (indicator === "none") {
			color = "green";
		} else if (["major", "critical"].includes(indicator)) {
			color = "red";
		} else if (["minor", "maintenance"].includes(indicator)) {
			color = "orange";
		}

		return { indicator, description, color };
	},

	async summary(core, result, endpoint) {
		const icon = getIcon(result.color);

		await core.summary
			.addHeading("Cloudflare Status")
			.addTable([
				[
					{ data: "Indicator", header: true },
					{ data: "Color", header: true },
					{ data: "Status", header: true },
				],
				[
					result.indicator,
					`${icon} ${result.color}`,
					result.description,
				],
			])
			.write();
	},
};
