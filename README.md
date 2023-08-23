# action-vpat-to-html

*GitHub Action that converts a VPAT report from markdown to styled HTML*

## Example workflow

```yaml
on:
  push:
    branches:
      - main
    paths:
      - 'vpats/*'

jobs:
  main:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout my product repo
        uses: actions/checkout@v3

      - name: Convert most recent VPAT to HTML
        uses: dequelabs/action-vpat-to-html@main
        id: vpat-to-html
        with:
          product-name: My Product
          vpat-location: vpats

      - name: Write HTML to file
        run: echo -e ${{ steps.vpat-to-html.outputs.stringified-html }} > vpat.html
```

## Inputs

| Name | Description | Default |
| --- | --- | --- |
`product-name` | A human-readable product name. This is used to generate a title for the resulting HTML document. |
`vpat-location` | The directory from which the most recent VPAT can be sourced. VPATs must be in markdown format. | `vpats`

## Outputs

| Name | Description |
| --- | --- |
| `stringified-html` | The generated HTML as a string. This value contains escape characters (e.g., `\n`). |

## Developer notes

* The compiled `dist/` directory is committed to the `main` branch by running `npm run build` locally and committing the changes. The pre-commit hook should do this for you.
* The `Test` workflow is triggered by every `push` event. Navigate to the workflow run page and open the `result` artifact to view the generated HTML.
