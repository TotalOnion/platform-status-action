# platform-status-action

> A GitHub Action that fetches the current status from an [Atlassian Statuspage](https://www.atlassian.com/software/statuspage)-compatible status page (e.g. `status.pantheon.io`), reports the colour indicator and description to the workflow log, and writes a rich summary to the job summary panel.

## Features

- 🟢 Fetches live status from any Atlassian Statuspage API (`/api/v2/status.json`)
- 🎨 Maps the raw indicator to a human-friendly colour (`green`, `yellow`, `orange`, `red`, `blue`)
- 📋 Writes a formatted Markdown table to the GitHub Actions job summary
- ❌ Optionally fails the workflow when a specified indicator is detected (e.g. `major` or `critical`)
- 📤 Exposes `indicator`, `color`, and `status_description` as step outputs for downstream steps

## Usage

```yaml
- name: Check Platform Status
  uses: TotalOnion/platform-status-action@v1
  with:
    status_page_url: 'https://status.pantheon.io'
    # Optional: fail the workflow for these indicator levels
    fail_on: 'major,critical'
```

### Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `status_page_url` | ✅ | — | Base URL of the Atlassian Statuspage (e.g. `https://status.pantheon.io`) |
| `fail_on` | ❌ | `''` | Comma-separated list of indicator values that should fail the workflow (e.g. `major,critical`) |

### Outputs

| Output | Description |
|--------|-------------|
| `indicator` | Raw indicator from the API: `none`, `minor`, `major`, `critical`, or `maintenance` |
| `color` | Human-friendly colour: `green`, `yellow`, `orange`, `red`, or `blue` |
| `status_description` | Human-readable description returned by the status page |

### Indicator → Colour mapping

| Indicator | Colour | Emoji |
|-----------|--------|-------|
| `none` | green | 🟢 |
| `minor` | yellow | 🟡 |
| `major` | orange | 🟠 |
| `critical` | red | 🔴 |
| `maintenance` | blue | 🔵 |

## Example workflow

```yaml
name: CI with Status Check

on: [push]

jobs:
  check-status:
    runs-on: ubuntu-latest
    steps:
      - name: Check Pantheon Status
        id: platform_status
        uses: TotalOnion/platform-status-action@v1
        with:
          status_page_url: 'https://status.pantheon.io'
          fail_on: 'critical'

      - name: Use status outputs
        run: |
          echo "Indicator : ${{ steps.platform_status.outputs.indicator }}"
          echo "Color     : ${{ steps.platform_status.outputs.color }}"
          echo "Description: ${{ steps.platform_status.outputs.status_description }}"
```

## Development

```bash
# Install dependencies
npm install

# Build (compile TypeScript and bundle with ncc)
npm run build

# Run tests
npm test

# Build + test in one shot
npm run all
```

## License

MIT
