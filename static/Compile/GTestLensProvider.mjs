
let setRequestUpdateFunc = null
let requestUpdateFunc = new Promise((resolve, reject) => {
    setRequestUpdateFunc = resolve
})
let nextLenses = {
    update: false,
    lenses: false
}

export async function updateGTestCodeLens(test_detail)
{
    console.log('updateGTestCodeLens')

    nextLenses = {
        update: true,
        lenses: function*(command_id) {
            console.log(test_detail)
            if (test_detail !== null)
            {
                for (const group of test_detail.testsuites)
                {
                    for (const test of group.testsuite)
                    {
                        const success = (test.failures === undefined)
                        yield {
                            range: {
                                startLineNumber: test.line,
                                startColumn: 1,
                                endLineNumber: test.line,
                                endColumn: 1,
                            },
                            command: {
                                id: command_id,
                                title: `${(success ? '✓' : '✗')}  ${group.name}.${test.name}`,
                            },
                        }
                    }
                }
            }
        },
    }

    const request = await requestUpdateFunc
    request()
}

export function registerGTestLensProvider(editor)
{
    var command_id = editor.addCommand(
        0,
        function () {},
        ""
    )

    monaco.languages.registerCodeLensProvider("cpp", {
        onDidChange: function(callback) {
            console.log('registerCodeLensProvider :: onDidChange')
            setRequestUpdateFunc(callback)
        },
        provideCodeLenses: async function (model, token) {
            console.log('provideCodeLenses')

            if (!nextLenses.update)
            {
                let stop_await = null
                const promise = new Promise((resolve, reject) => { stop_await = resolve })
                token.onCancellationRequested(() => stop_await(null))
                return await promise
            }

            nextLenses.update = false


            return {
                lenses: nextLenses.lenses(command_id),
                dispose: () => {},
            }
        },
        resolveCodeLens: function (model, codeLens, token) {
            console.log('resolveCodeLens')
            return codeLens
        },
    })
}