import compile from './RemoteCompiler.mjs'
import {updateGTestCodeLens} from './GTestLensProvider.mjs'

let oldDecorations = null

function addCoutAnnotations(editor, step) {
    function* generate() {
        for (const entry of step.instrumented_cout) {
            const NONE = 3
            const NeverGrowsWhenTypingAtEdges = 1

            const markdown_message = '### Instrumented cout ###\n' + entry.messages.map(m => {
                return '    ' + m.split('\n').join('\n             ').trim()
            }).join('\n')
            // }).join('\n---\n')

            yield {
                options: {
                    after: {
                        content: '    ' + entry.messages[0].split('\n')[0], 
                        inlineClassName: 'annotationCout',
                        cursorStops: NONE
                    }, 
                    isWholeLine: true,
                    stickiness: NeverGrowsWhenTypingAtEdges,
                    // hoverMessage: {value: entry.messages.join('\n---\n').replaceAll('\n', '\n\n')},
                    // hoverMessage: {value: '# Hello \n    hi\n    hi\n\n lol'},
                    hoverMessage: {value: markdown_message},
                },
                range: new monaco.Range(entry.line, 1, entry.line, 1e100),
            }
        }
    }
    
    oldDecorations?.clear()
    oldDecorations = editor.createDecorationsCollection([...generate()])
}

let oldDecorations2 = null

function addCompileAnnotations(editor, log) {
    function* generate() {
        for (const entry of log) {
            const NONE = 3
            const NeverGrowsWhenTypingAtEdges = 1

            let {caret} = entry.locations[0]

            const severity = {
                'error': 'error',
                'fatal error': 'error',
                'warning': 'warning',
            }[entry.kind]

            yield {
                options: {
                    after: {
                        content: '    ' + entry.message, 
                        inlineClassName: `annotationCompile annotationCompile_${severity}`,
                        cursorStops: NONE
                    }, 
                    className: `annotationLineCompile annotationCompile_${severity}`,
                    isWholeLine: true,
                    stickiness: NeverGrowsWhenTypingAtEdges,
                },
                range: new monaco.Range(caret.line, 1, caret.line, 1e100),
            }
        }
    }
    
    oldDecorations2?.clear()
    oldDecorations2 = editor.createDecorationsCollection([...generate()])
}


let oldDecorations3 = null

function addImwriteAnnotations(editor, images) {
    function* generate() {
        for (const {name, line, base64src} of images) {
            const NONE = 3
            const NeverGrowsWhenTypingAtEdges = 1

            const hoverMessage = `<img alt="${name}" src="${base64src}">`

            yield {
                options: {
                    after: {
                        content: `    [imwrite] "${name}"`, 
                        inlineClassName: `annotationImwrite`,
                        cursorStops: NONE
                    }, 
                    isWholeLine: true,
                    stickiness: NeverGrowsWhenTypingAtEdges,
                    hoverMessage: {
                        value: hoverMessage,
                        supportHtml: true,
                    }
                },
                range: new monaco.Range(line, 1, line, 1e100),
            }
        }
    }
    
    oldDecorations3?.clear()
    oldDecorations3 = editor.createDecorationsCollection([...generate()])
}

const HANDLERS = {
    'imwrite': function(editor, step) {
        console.log(step)
        addImwriteAnnotations(editor, step.images)
    },
    'compile': function(editor, step) {
        const log = JSON.parse(step.stderr.split('\n')[0])

        const markers = []
        
        for (const entry of log)
        {
            console.log(entry)
        
            const severity = {
                'error': monaco.MarkerSeverity.Error,
                'fatal error': monaco.MarkerSeverity.Error,
                'warning': monaco.MarkerSeverity.Warning,
            }[entry.kind]

            if (severity === undefined)
            {
                console.log('Failed to handle compilation log entry:', entry)
                continue
            }

            let {start, caret} = entry.locations[0]

            if (start === undefined)
                start = caret

            markers.push({
                message: entry.message,
                severity: severity,
                startLineNumber: start.line,
                startColumn: start.column,
                endLineNumber: caret.line,
                endColumn: caret.column,
            })
        }
        
        addCompileAnnotations(editor, log)
        monaco.editor.setModelMarkers(editor.getModel(), 'CompileAction::compile', markers)
    },
    'execute': function(editor, step) {
        const markers = []
        const data = JSON.parse(step.test_detail)
        updateGTestCodeLens(data)
        
        if (step.test_detail !== null)
        {
            for (const group of data.testsuites)
            {
                for (const test of group.testsuite)
                {
                    if (test.failures === undefined)
                        continue

                    for (const {failure} of test.failures)
                    {
                        const m = failure.match(/^source.cpp:(\d+)\n/)
                        const skip = m[0].length
                        const line = Number.parseInt(m[1])

                        markers.push({
                            message: failure.substring(skip),
                            severity: monaco.MarkerSeverity.Error,
                            startLineNumber: line,
                            startColumn: 1,
                            endLineNumber: line,
                            endColumn: 1e10,
                        })
                    }
                }
            }
        }
        monaco.editor.setModelMarkers(editor.getModel(), 'CompileAction::execute', markers)
        
        addCoutAnnotations(editor, step)
    }
}

export default async function(editor)
{
    console.log('CompileAction')
    oldDecorations?.clear()
    oldDecorations2?.clear()
    oldDecorations3?.clear()

    const model = editor.getModel()
    const source_code = model.getValue()

    for await (const step of compile(source_code))
    {
        const handler = HANDLERS[step.name]
        
        if (handler !== undefined)
            handler(editor, step)
    }

    // console.log(model.getValue())
}
