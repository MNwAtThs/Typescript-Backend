/**
 * Loads environment variables from .env file
 */

import glob from 'glob'
import fs from 'fs'
import path from 'path'

const parse = (path: path.ParsedPath) => {
    let content = fs.readFileSync(path.dir + '/' + path.base, {
        encoding: 'utf-8',
    })
    let splitContent = content
        .split('\n')
        .map((l) => l.split('=').map((l) => l.trim()))
    process.env = Object.assign(
        process.env,
        ...splitContent.map((x) => ({ [x[0]]: x[1] }))
    )
}

const files = glob.sync(process.env.PWD + '**/.env*', {})
let paths = files.map((file) => path.parse(file))
let localPaths = paths.filter((p) => p.ext === '.local')
let localPathsDictionary = Object.assign(
    {},
    ...localPaths.map((x) => ({ [x.name.replace('.env.', '')]: x }))
)

let mainPathIndex = paths.findIndex((file) => {
    return file.base === '.env'
})

if (mainPathIndex >= 0) {
    parse(paths[mainPathIndex])
}

const currentEnv = process.env.NODE_ENV
if (currentEnv && localPathsDictionary[currentEnv]) {
    parse(localPathsDictionary[currentEnv])
}
