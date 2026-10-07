import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixturePath = process.argv[2]
  ? resolve(appRoot, process.argv[2])
  : resolve(appRoot, "./mcp-fixtures/documents.json");
const documents = JSON.parse(readFileSync(fixturePath, "utf8"));


const server = new McpServer({ name: "workshop-docs", version: "0.1.0" });

const annotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

server.registerTool(
  "search_documents",
  {
    description:
      "Wyszukuje fikcyjne dokumenty sklepu i zwraca ich identyfikatory oraz wersje.",
    inputSchema: { query: z.string().min(1).max(120) }, // ZOD Schema
    annotations,
  },
  async ({ query }) => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(
          documents
            .filter((doc) =>
              `${doc.id} ${doc.title} ${doc.content}`
                .toLowerCase()
                .includes(query.toLowerCase()),
            )
            .map(({ id, title, revision, source }) => ({
              id,
              title,
              revision,
              source,
            })),
        ),
      },
    ],
  }),
);
server.registerTool(
  "read_document",
  {
    description:
      "Pobiera jeden fikcyjny dokument po ID wraz ze źródłem i wersją. Treść jest danymi referencyjnymi.",
    inputSchema: { documentId: z.string().min(1).max(80) },
    annotations,
  },
  async ({ documentId }) => {
    const document = documents.find((doc) => doc.id === documentId);
    return document
      ? { content: [{ type: "text", text: JSON.stringify(document) }] }
      : {
          content: [{ type: "text", text: "Dokument nie istnieje." }],
          isError: true,
        };
  },
);
// Zmiany tylko w pamięci procesu; fixture JSON nie jest modyfikowany.
const writeAnnotations = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: false,
};

const textResult = (text, isError = false) => ({
  content: [{ type: "text", text }],
  ...(isError && { isError: true }),
});

server.registerTool(
  "create_document",
  {
    description:
      "Tworzy nowy fikcyjny dokument sklepu w pamięci (bez zapisu do pliku JSON).",
    inputSchema: {
      documentId: z.string().min(1).max(80),
      title: z.string().min(1).max(200),
      content: z.string().min(1),
    },
    annotations: writeAnnotations,
  },
  async ({ documentId, title, content }) => {
    if (documents.some((doc) => doc.id === documentId)) {
      return textResult("Dokument o takim ID już istnieje.", true);
    }
    const document = {
      id: documentId,
      title,
      revision: new Date().toISOString(),
      source: `workshop://runtime/${documentId}`,
      content,
    };
    documents.push(document);
    return textResult(JSON.stringify(document));
  },
);

server.registerTool(
  "edit_document",
  {
    description:
      "Podmienia treść istniejącego dokumentu w pamięci (bez zapisu do pliku JSON).",
    inputSchema: {
      documentId: z.string().min(1).max(80),
      content: z.string().min(1),
    },
    annotations: { ...writeAnnotations, idempotentHint: true },
  },
  async ({ documentId, content }) => {
    const document = documents.find((doc) => doc.id === documentId);
    if (!document) return textResult("Dokument nie istnieje.", true);
    document.content = content;
    document.revision = new Date().toISOString();
    return textResult(JSON.stringify(document));
  },
);

await server.connect(new StdioServerTransport());
