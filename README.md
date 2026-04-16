# Platform Status Check

This action retrieves a status page summary, outputs the current service status to the workflow logs, and appends it to the GitHub Actions job summary for quick and clear visibility.

<img width="1878" height="560" alt="image" src="https://github.com/user-attachments/assets/2e67dce7-4b9c-448b-8ff3-7bc944ff9947" />

<img width="1350" height="328" alt="image" src="https://github.com/user-attachments/assets/45de26ff-f941-4bbf-b724-2d316174e388" />

## Action interface

**Inputs**
- `platform` *(required)* — Supported platform (e.g. `pantheon`)
- `fail-on-red` *(optional)* — Indicator that fail the workflow (e.g. `true`)

## Supported platforms

- cloudflare
- pantheon

## Usage

```yml
name: "Platform status"

on:
  schedule:
    - cron: "0 0 * * *"
  workflow_dispatch:

defaults:
  run:
    shell: bash

jobs:
  Do:
    runs-on: ubuntu-latest

    steps:
      - name: Check Pantheon status
        id: pantheon_status
        uses: TotalOnion/platform-status-action@main
        with:
          platform: cloudflare
          fail-on-red: true

      - name: Print outputs
        run: |
          echo "Color: ${{ steps.pantheon_status.outputs.color }}"
          echo "Indicator: ${{ steps.pantheon_status.outputs.indicator }}"
          echo "Description: ${{ steps.pantheon_status.outputs.description }}"

```

## Author

Maintained by [Claude B.](https://github.com/clobee) / [Total Onion](https://github.com/TotalOnion)

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)

