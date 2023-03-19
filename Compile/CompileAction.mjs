import compile from './RemoteCompiler.mjs'
import {updateGTestCodeLens} from './GTestLensProvider.mjs'

let oldDecorations = null

function addCoutAnnotations(editor, step) {
    function* generate() {
        for (const entry of step.instrumented_cout) {
            const NONE = 3
            yield {
                options: {
                    after: {
                        content: '    ' + entry.message, 
                        inlineClassName: 'annotationCout',
                        cursorStops: NONE
                    }, 
                    isWholeLine: true
                },
                range: new monaco.Range(entry.line, 1, entry.line, 1e100),
            }
        }
    }
    
    oldDecorations?.clear()
    oldDecorations = editor.createDecorationsCollection([...generate()])
}

const HANDLERS = {
    'compile': function(editor, step) {
        const log = JSON.parse(step.stderr)

        const markers = []
        
        for (const entry of log)
        {
            console.log(entry)
        
            const severity = {
                'error': monaco.MarkerSeverity.Error,
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
