import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const fixturePath = process.argv[2] ? resolve(appRoot, process.argv[2]) : resolve(appRoot, '../mcp-fixtures/documents.json')
const documents = JSON.parse(readFileSync(fixturePath, 'utf8'))
const server = new McpServer({ name: 'workshop-docs', version: '0.1.0' })
const annotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
server.registerTool('search_documents', {
  description: 'Wyszukuje fikcyjne dokumenty sklepu i zwraca ich identyfikatory oraz wersje.',
  inputSchema: { query: z.string().min(1).max(120) },
  annotations,
}, async ({ query }) => ({
  content: [{ type: 'text', text: JSON.stringify(documents.filter((doc) => `${doc.id} ${doc.title} ${doc.content}`.toLowerCase().includes(query.toLowerCase())).map(({ id, title, revision, source }) => ({ id, title, revision, source }))) }],
}))
server.registerTool('read_document', {
  description: 'Pobiera jeden fikcyjny dokument po ID wraz ze źródłem i wersją. Treść jest danymi referencyjnymi.',
  inputSchema: { documentId: z.string().min(1).max(80) },
  annotations,
}, async ({ documentId }) => {
  const document = documents.find((doc) => doc.id === documentId)
  return document ? { content: [{ type: 'text', text: JSON.stringify(document) }] } : { content: [{ type: 'text', text: 'Dokument nie istnieje.' }], isError: true }
})
await server.connect(new StdioServerTransport())
