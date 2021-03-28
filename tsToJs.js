const { HelperManager } = require('sucrase/dist/HelperManager')
const identifyShadowedGlobals = require('sucrase/dist/identifyShadowedGlobals')
  .default
const NameManager = require('sucrase/dist/NameManager').default
const { parse } = require('sucrase/dist/parser')
const TokenProcessor = require('sucrase/dist/TokenProcessor').default
const RootTransformer = require('sucrase/dist/transformers/RootTransformer')
  .default
const getTSImportedNames = require('sucrase/dist/util/getTSImportedNames')
  .default

const fs = require('fs')

function transformTSOnly(code) {
  const { tokens, scopes } = parse(
    code,
    true /* isJSXEnabled */,
    true /* isTypeScriptEnabled */,
    false /* isFlowEnabled */
  )
  const nameManager = new NameManager(code, tokens)
  const helperManager = new HelperManager(nameManager)
  const tokenProcessor = new TokenProcessor(
    code,
    tokens,
    false /* isFlowEnabled */,
    helperManager
  )

  identifyShadowedGlobals(
    tokenProcessor,
    scopes,
    getTSImportedNames(tokenProcessor)
  )
  const sucraseContext = {
    tokenProcessor,
    scopes,
    nameManager,
    importProcessor: null,
    helperManager,
  }

  const transformer = new RootTransformer(
    sucraseContext,
    ['typescript'],
    false,
    {
      transforms: ['typescript'],
    }
  )
  return transformer.transform()
}

fs.readdirSync('./out').forEach(file => {
  if (file.endsWith('tsx') || file.endsWith('ts')) {
    const content = fs.readFileSync(`./out/${file}`, 'utf8')

    const transformedContent = transformTSOnly(content)

    fs.writeFileSync(
      `./out/${file.replace('.tsx', '.js').replace('.ts', '.js')}`,
      transformedContent
    )
  }
})
