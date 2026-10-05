import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

test('MCP: handshake, lista narzędzi, wyszukanie, odczyt oraz brak dokumentu', async () => {
  const client = new Client({ name: 'workshop-preflight', version: '0.1.0' })
  const transport = new StdioClientTransport({ command: process.execPath, args: [resolve('tools/workshop-mcp.mjs')], cwd: process.cwd() })
  try {
    await client.connect(transport)
    const { tools } = await client.listTools()
    assert.deepEqual(tools.map((tool) => tool.name).sort(), ['read_document', 'search_documents'])
    assert.ok(tools.every((tool) => tool.annotations?.readOnlyHint))
    const search = await client.callTool({ name: 'search_documents', arguments: { query: 'Kontakt' } })
    const entries = JSON.parse(search.content[0].text)
    assert.equal(entries[0].id, 'STORE-OPS-001')
    const read = await client.callTool({ name: 'read_document', arguments: { documentId: entries[0].id } })
    const document = JSON.parse(read.content[0].text)
    assert.equal(document.revision, '2026-10-04.1')
    assert.match(document.content, /help@shopeasy\.example\.test/)
    assert.equal(document.source, 'workshop://store-ops/STORE-OPS-001')
    const missing = await client.callTool({ name: 'read_document', arguments: { documentId: 'MISSING' } })
    assert.equal(missing.isError, true)
  } finally { await client.close() }
})
