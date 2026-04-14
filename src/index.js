const core = require("@actions/core");
const supportedPlatforms = require("./platforms");
const { getIcon } = require("./utils");

async function run() {
	try {
		const platformInput = core.getInput("platform");
		const failOnRedInput = core.getInput("fail-on-red");

		if (!platformInput) {
			core.setFailed("No platform provided");
			return;
		}

		const platform = platformInput.toLowerCase();

		if (!supportedPlatforms[platform]) {
			core.setFailed(`${platform} platform not supported`);
			return;
		}

		const config = supportedPlatforms[platform];
		const endpoint = `${config.baseURL}${config.endpoint}`;

		const failOnRed =
			failOnRedInput === "true"
				? true
				: failOnRedInput === "false"
					? false
					: config.failOnRedDefault;

		core.info(`Checking ${platform} status: ${endpoint}`);

		const response = await fetch(endpoint, {
			headers: {
				Accept: "application/json",
				"User-Agent": "platform-status-action",
			},
		});

		if (!response.ok) {
			throw new Error(
				`Failed to fetch status page. HTTP ${response.status}`,
			);
		}

		const data = await response.json();
		const result = config.mapStatus(data);

		if (result.color) {
			core.setOutput("color", result.color);
			core.info(`${getIcon(result.color)} ${platform.toUpperCase()}`);
		}

		if (result.indicator) {
			core.setOutput("indicator", result.indicator);
			core.info(`Indicator: ${result.indicator}`);
		}

		if (result.description) {
			core.setOutput("description", result.description);
			core.info(`${getIcon(result.color)} ${platform.toUpperCase()}`);
		}

		await config.summary(core, result, endpoint);

		if (failOnRed && result.color === "red") {
			core.setFailed(`${platform} status is RED: ${result.description}`);
		}
	} catch (error) {
		core.setFailed(error instanceof Error ? error.message : String(error));
	}
}

run();
