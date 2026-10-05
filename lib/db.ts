import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { resolve } from 'node:path'

const globalForPrisma = global as typeof globalThis & { prisma?: PrismaClient }

function createClient() {
  const configured = process.env.DATABASE_URL ?? 'file:./workshop.db'
  const url = configured.startsWith('file:./') ? `file:${resolve(configured.slice(5)).replaceAll('\\', '/')}` : configured
  const adapter = new PrismaBetterSqlite3({ url })
  return new PrismaClient({ adapter })
}

export const db = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
