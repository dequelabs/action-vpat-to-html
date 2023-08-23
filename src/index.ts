import * as core from '@actions/core'
import * as fs from 'fs'
import { marked } from 'marked'
import { mangle } from 'marked-mangle'
import { gfmHeadingId } from 'marked-gfm-heading-id'
import dedent from 'dedent'
import styles from './styles'

main().catch((err: Error) => {
  core.setFailed(err.message)
})

/**
 * Convert most recent VPAT to HTML.
 */

async function main() {
  try {
    const vpatLocation = getRequiredInput('vpat-location')
    const mostRecentVpat = getMostRecentVpat(vpatLocation)
    const vpatMarkdown = fs.readFileSync(mostRecentVpat, 'utf-8')
    const htmlContent = generateHTMLWithStylesheet(vpatMarkdown, styles)
    core.setOutput('stringified-html', JSON.stringify(htmlContent))
  } catch (err) {
    throw err
  }
}

/**
 * Get the value of a required input.
 * 
 * @param name Name of input to get.
 * @returns Value of input.
 */

function getRequiredInput(name: string): string {
  const value = core.getInput(name, { required: true })
  if (value === '') {
    throw new Error(`Input ${name} is required`)
  }
  return value
}

/**
 * Get the most recent VPAT from a given directory.
 * The most recent VPAT is determined by the file's creation date.
 * 
 * @param location Directory containing VPATs in markdown format.
 * @returns Relative path to the most recent VPAT file.
 */

function getMostRecentVpat(location: string): string {
  if (fs.lstatSync(location).isDirectory() === false) {
    throw new Error('VPAT location is not a directory')
  }

  const files = fs.readdirSync(location)

  if (files.length <= 0) {
    throw new Error('VPAT location contains no files')
  }

  const sorted = files.sort((a, b) => {
    const aCreated = fs.statSync(`${location}/${a}`).birthtimeMs
    const bCreated = fs.statSync(`${location}/${b}`).birthtimeMs
    return aCreated - bCreated
  })

  return `${location}/${sorted[sorted.length - 1]}`
}

/**
 * Generate HTML content with a stylesheet.
 * 
 * @param markdownContent Markdown content to convert to HTML.
 * @param stylesheetContent Contents of the stylesheet.
 * @returns HTML content with stylesheet.
 */

function generateHTMLWithStylesheet(
  markdownContent: string,
  stylesheetContent: string
) {
  const productName = getRequiredInput('product-name')

  marked.use(mangle())
  marked.use(gfmHeadingId())
  const htmlContent = marked.parse(markdownContent)
  const htmlWithStylesheet = dedent`
    <html lang="en">
      <head>
        <title>VPAT for ${productName}</title>
        <style>
          ${stylesheetContent}
        </style>
      </head>
      <body class="markdown-body">
        ${htmlContent}
      </body>
    </html>
  `
  return htmlWithStylesheet
}
