/**
 * Копирует server/defaultContent.json → server/data/content.json
 * (удобно перед архивом/выгрузкой или после клона репозитория).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const def = path.join(root, 'server', 'defaultContent.json')
const outDir = path.join(root, 'server', 'data')
const out = path.join(outDir, 'content.json')

if (!fs.existsSync(def)) {
  console.error('Нет файла:', def)
  process.exit(1)
}
fs.mkdirSync(outDir, { recursive: true })
fs.copyFileSync(def, out)
console.log('Скопировано:', def, '→', out)
