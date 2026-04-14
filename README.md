# Pantheon Status Check

This action fetchs a Status page summary, print the current service status in the workflow log, and append it to the GitHub Actions job summary.

## Inputs

- platform: "Supported platform"
- fail-on-red: "Fail the action when status is red"

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



## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)

