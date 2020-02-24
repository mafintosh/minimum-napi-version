#!/usr/bin/env node

const binding = require('node-gyp-build').path(process.argv[2] || process.cwd())
const { spawn } = require('child_process')
const https = require('https')

napiDeps(binding, function (err, deps) {
  if (err) throw err

  docs(function (err, docs) {
    if (err) throw err

    let max = [8, 0, 0]
    visit(docs)
    console.log('v' + max.join('.'))

    function visit (doc) {
      if (doc.miscs) visitMiscs(doc)
      if (doc.modules) visitModules(doc)
    }

    function visitMiscs (doc) {
      for (const m of doc.miscs) {
        visit(m)
      }
    }

    function visitModules (doc) {
      for (const m of doc.modules) {
        visit(m)

        if (deps.includes(m.name)) {
          const [major, minor, patch] = parseVersion(m.meta.added[0])
          if (major > max[0] || (major === max[0] && minor > max[1]) || (major === max[0] && minor === max[1] && patch > max[2])) {
            max = [major, minor, patch]
          }
        }
      }
    }
  })
})

function parseVersion (m) {
  return m.replace('v', '').split('.').map(n => Number(n))
}

function napiDeps (binary, cb) {
  const { stdout } = spawn('nm', ['-a', binding])
  const napi = []

  buffer(stdout, function (err, str) {
    if (err) return cb(err)
    str.trim().split('\n').filter(function (line) {
      if (/^\s*(U _)?napi_/.test(line)) {
        line = line.trim().replace(/^U _/, '')
        napi.push(line)
      }
    })
    cb(null, napi)
  })
}

function buffer (stream, cb) {
  let buf = ''
  let called = false

  stream.setEncoding('utf-8')
  stream.on('data', data => buf += data)
  stream.on('end', done)
  stream.on('error', done)

  function done (err) {
    if (called) return
    called = true
    cb(err, buf)
  }
}

function docs (cb) {
  https.get('https://nodejs.org/dist/latest/docs/api/n-api.json').on('response', function (response) {
    buffer(response, function (err, buf) {
      if (err) return cb(err)
      const docs = JSON.parse(buf)
      cb(null, docs)
    })
  })

}
