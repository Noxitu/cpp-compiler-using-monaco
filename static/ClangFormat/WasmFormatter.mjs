import {dot_clang_format} from '../files.js'
import clangFormat from '../external/clang-wasm/clang-format.mjs'

export default async function(source_code) {
    const start_time = performance.now()

    const io = {
        stdin: source_code,
        stdin_pos: 0,
        stdout: [],
        stderr: [],
    }

    const result = await clangFormat({
        // arguments: ['--version'],
        // arguments: ['--dump-config'],
        arguments: ['--style=file:/.clang-format', '-Werror'],
        // arguments: ['--help'],
        noExitRuntime: false,
        stdin: function() { return io.stdin_pos < io.stdin.length ? io.stdin.charCodeAt(io.stdin_pos++) : null },
        print: function(line) { io.stdout.push(line) },
        printErr: function(line) { io.stderr.push(line) },
        // setStatus: function(status) { console.log(`Status: ${status}`) },
        preRun: function(module) {
            const data = new TextEncoder().encode(dot_clang_format)
            const stream = module.FS.open('/.clang-format', 'w')
            module.FS.write(stream, data, 0, data.length, 0)
            module.FS.close(stream)
        },
        // onExit: function(code) { console.log(`Exit code: ${code}`)},
    })

    window.result = result
    // console.log(result)
    // console.log('stdout')
    // console.log(io.stdout.join('\n'))
    // console.log('stderr')
    // console.log(io.stderr.join('\n'))
    const end_time = performance.now()

    // console.log(`Done in ${Math.round(10*(end_time - start_time))/10} ms.`)

    return io.stdout.join('\n')
}

