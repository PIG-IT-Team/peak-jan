import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

test('compile-only resources need no llama worker or native backends', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'jan-resources-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  mkdirSync(join(root, 'scripts'))
  mkdirSync(join(root, 'src-tauri/icons'), { recursive: true })
  copyFileSync(
    new URL('./stub-tauri-resources.mjs', import.meta.url),
    join(root, 'scripts/stub-tauri-resources.mjs')
  )
  writeFileSync(join(root, 'src-tauri/icons/icon.png'), 'test icon')

  const run = () =>
    execFileSync(process.execPath, [join(root, 'scripts/stub-tauri-resources.mjs')])
  run()

  const binDir = join(root, 'src-tauri/resources/bin')
  const binaries = readdirSync(binDir)
  assert.ok(binaries.some((name) => name.startsWith('bun-')))
  assert.ok(binaries.some((name) => name.startsWith('uv-')))
  assert.ok(!binaries.some((name) => /llama|ggml|cuda/i.test(name)))
  assert.ok(existsSync(join(root, 'web-app/dist/index.html')))

  const helper = join(binDir, binaries.find((name) => name.startsWith('uv-')))
  writeFileSync(helper, 'existing helper')
  run()
  assert.equal(readFileSync(helper, 'utf8'), 'existing helper')
})
