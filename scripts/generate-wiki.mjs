// Copyright © 2026 Jalapeno Labs

// Generates GitHub Wiki markdown from the library source:
// - one page per component with a props table (via react-docgen-typescript)
// - a Hooks page and a Utilities page listing every export with its summary
// - a Home page and a _Sidebar for navigation
//
// Output goes to ./wiki, which the wiki.yml workflow pushes to the repo's
// `*.wiki.git`. The interactive Storybook stays the source of live examples;
// this is the static, GitHub-native reference.

import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { withCustomConfig } from 'react-docgen-typescript'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const SRC = join(ROOT, 'src')
const OUT = join(ROOT, 'wiki')
const STORYBOOK_URL = 'https://jalapenolabs.github.io/uikit'

function listSourceFiles(dir, extension) {
  if (!existsSync(dir)) {
    return []
  }

  return readdirSync(dir, { recursive: true })
    .map((entry) => join(dir, entry.toString()))
    .filter((path) => path.endsWith(extension))
    .filter((path) => !path.includes('.stories.') && !path.includes('.test.'))
}

function escapeCell(text) {
  return String(text ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ')
    .trim()
}

function firstJsdocSentence(block) {
  const lines = block
    .split('\n')
    .map((line) => line.replace(/^\s*\*\s?/, '').trim())

  const collected = []
  for (const line of lines) {
    if (line.startsWith('@')) {
      break
    }
    if (line) {
      collected.push(line)
    }
    else if (collected.length) {
      break
    }
  }

  return collected.join(' ').trim()
}

function storybookDocsLink(storyTitle) {
  // "Components/Button" -> components-button--docs
  const id = storyTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return `${STORYBOOK_URL}/?path=/docs/${id}--docs`
}

// ///////////////////////////// //
//          Components           //
// ///////////////////////////// //

function buildComponentPages() {
  const componentFiles = listSourceFiles(join(SRC, 'components'), '.tsx')

  const parser = withCustomConfig(join(ROOT, 'tsconfig.json'), {
    savePropValueAsString: true,
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
    // Drop props inherited from third-party types (e.g. every native DOM
    // attribute from @types/react) so the table shows only our own API.
    propFilter: (prop) => {
      if (prop.parent) {
        return !prop.parent.fileName.includes('node_modules')
      }
      return true
    },
  })

  const components = parser.parse(componentFiles)
  const pages = []

  for (const component of components) {
    const storyTitle = `Components/${component.displayName}`
    const lines = []

    lines.push(`# ${component.displayName}`)
    lines.push('')
    if (component.description) {
      lines.push(component.description)
      lines.push('')
    }
    lines.push('## Import')
    lines.push('')
    lines.push('```tsx')
    lines.push(`import { ${component.displayName} } from '@jalapenolabs/uikit'`)
    lines.push('```')
    lines.push('')

    const propNames = Object.keys(component.props ?? {})
    if (propNames.length) {
      lines.push('## Props')
      lines.push('')
      lines.push('| Prop | Type | Default | Required | Description |')
      lines.push('| --- | --- | --- | --- | --- |')
      for (const propName of propNames.sort()) {
        const prop = component.props[propName]

        // react-docgen-typescript reports literal unions as "enum"; expand them
        // back to "a" | "b" | "c" so the table shows the real type.
        let typeName = prop.type?.name
        if (typeName === 'enum' && Array.isArray(prop.type?.value)) {
          const values = prop.type.value.map((entry) => entry.value).filter(Boolean)
          if (values.length) {
            typeName = values.join(' | ')
          }
        }
        const type = escapeCell(typeName)
        const defaultValue = prop.defaultValue?.value
        const defaultCell = defaultValue == null
          ? '-'
          : `\`${escapeCell(defaultValue)}\``
        lines.push([
          `\`${propName}\``,
          `\`${type}\``,
          defaultCell,
          prop.required ? 'yes' : 'no',
          escapeCell(prop.description),
        ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'))
      }
      lines.push('')
    }

    lines.push(`See the [interactive examples in Storybook](${storybookDocsLink(storyTitle)}).`)
    lines.push('')

    pages.push({
      name: component.displayName,
      content: lines.join('\n'),
    })
  }

  return pages.sort((first, second) => first.name.localeCompare(second.name))
}

// ///////////////////////////// //
//       Hooks and utils         //
// ///////////////////////////// //

function collectExports(dir) {
  const files = listSourceFiles(dir, '.ts')
  const entries = []

  for (const file of files) {
    const content = readFileSync(file, 'utf8')

    const summaries = new Map()
    // The comment body must not contain `*/`, so the match is a single JSDoc
    // block immediately preceding `export function` (not spanning earlier ones).
    const documentedPattern = /\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*export function (\w+)/g
    let documentedMatch
    while ((documentedMatch = documentedPattern.exec(content)) !== null) {
      summaries.set(documentedMatch[2], firstJsdocSentence(documentedMatch[1]))
    }

    const namePattern = /export function (\w+)/g
    let nameMatch
    while ((nameMatch = namePattern.exec(content)) !== null) {
      entries.push({
        name: nameMatch[1],
        summary: summaries.get(nameMatch[1]) ?? '',
      })
    }
  }

  return entries.sort((first, second) => first.name.localeCompare(second.name))
}

function buildListPage(title, intro, entries) {
  const lines = [ `# ${title}`, '', intro, '' ]
  for (const entry of entries) {
    const summary = entry.summary
      ? ` - ${entry.summary}`
      : ''
    lines.push(`- \`${entry.name}\`${summary}`)
  }
  lines.push('')
  return lines.join('\n')
}

// ///////////////////////////// //
//        Home and sidebar       //
// ///////////////////////////// //

function buildHome(componentNames, hookEntries, utilEntries) {
  const lines = []
  lines.push('# @jalapenolabs/uikit')
  lines.push('')
  lines.push("Jalapeno Labs' reusable React component library and design system.")
  lines.push('')
  lines.push(`This reference is generated from the source on every release. For live, interactive examples, see the [Storybook docs](${STORYBOOK_URL}).`)
  lines.push('')
  lines.push('## Install')
  lines.push('')
  lines.push('```bash')
  lines.push('yarn add @jalapenolabs/uikit react react-dom')
  lines.push('```')
  lines.push('')
  lines.push('## Components')
  lines.push('')
  for (const name of componentNames) {
    lines.push(`- [${name}](${name})`)
  }
  lines.push('')
  lines.push('## Hooks')
  lines.push('')
  for (const entry of hookEntries) {
    lines.push(`- \`${entry.name}\`${entry.summary ? ` - ${entry.summary}` : ''}`)
  }
  lines.push('')
  lines.push('## Utilities')
  lines.push('')
  for (const entry of utilEntries) {
    lines.push(`- \`${entry.name}\`${entry.summary ? ` - ${entry.summary}` : ''}`)
  }
  lines.push('')
  return lines.join('\n')
}

function buildSidebar(componentNames) {
  const lines = [ '### @jalapenolabs/uikit', '', '- [Home](Home)' ]
  lines.push('- [Hooks](Hooks)')
  lines.push('- [Utilities](Utilities)')
  lines.push('')
  lines.push('**Components**')
  lines.push('')
  for (const name of componentNames) {
    lines.push(`- [${name}](${name})`)
  }
  lines.push('')
  return lines.join('\n')
}

// ///////////////////////////// //
//             Run               //
// ///////////////////////////// //

console.log('Generating wiki pages...')

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

const componentPages = buildComponentPages()
const hookEntries = collectExports(join(SRC, 'hooks'))
const utilEntries = collectExports(join(SRC, 'utils'))

for (const page of componentPages) {
  writeFileSync(join(OUT, `${page.name}.md`), page.content)
}

const componentNames = componentPages.map((page) => page.name)

writeFileSync(
  join(OUT, 'Hooks.md'),
  buildListPage('Hooks', 'Reusable React hooks exported by the library.', hookEntries),
)
writeFileSync(
  join(OUT, 'Utilities.md'),
  buildListPage('Utilities', 'Framework-agnostic helper functions exported by the library.', utilEntries),
)
writeFileSync(join(OUT, 'Home.md'), buildHome(componentNames, hookEntries, utilEntries))
writeFileSync(join(OUT, '_Sidebar.md'), buildSidebar(componentNames))

console.log(`Wrote ${componentPages.length} component pages, plus Hooks, Utilities, Home, and _Sidebar to ${OUT}`)
