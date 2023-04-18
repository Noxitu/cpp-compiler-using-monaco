import { source_code as DEFAULT_CODE } from './files.js'
import ClangFormatEditProvider from './ClangFormat/ClangFormatEditProvider.mjs'
import compile_action from './Compile/CompileAction.mjs'
import {registerGTestLensProvider} from './Compile/GTestLensProvider.mjs'
import {configuration} from './config.mjs'

function get_default_code()
{
    const code = configuration?.files[configuration?.default]
    return code !== undefined ? code : DEFAULT_CODE
}

function init_editor()
{
    monaco.languages.registerDocumentFormattingEditProvider('cpp', new ClangFormatEditProvider())

    const editor = monaco.editor.create(document.getElementById('container'), {
        value: get_default_code(),
        language: 'cpp',
        scrollBeyondLastLine: false,
        theme: "vs",
        // theme: "vs-dark",
        automaticLayout: true,
    })

    editor.getModel().updateOptions({
        tabSize: 4,
    })

    function link_action(keys, action)
    {
        editor.addCommand(keys, () => editor.getAction(action).run())

    }

    editor.addAction({
        id: "compile-and-run",
        label: "Compile and Run",
        keybindings: [],
        contextMenuGroupId: "2_execution",
        run: compile_action,
    })

    if (configuration?.files !== undefined)
    {
        let index = 1
        for (const [key, value] of Object.entries(configuration.files))
        {
            editor.addAction({
                id: `load-code-${index}`,
                label: `Load code: ${key}`,
                keybindings: [],
                run: () => editor.setValue(value),
            })

            index += 1
        }
    }

    editor.getAction('compile-and-run').run()

    registerGTestLensProvider(editor)

    link_action(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyS, 'editor.action.formatDocument')
    link_action(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, 'compile-and-run')
    link_action(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP, 'editor.action.quickCommand')
    link_action(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyP, 'editor.action.quickCommand')

    editor.focus()

    window.editor = editor

    // monaco.languages.registerCodeActionProvider("cpp", {
    //     provideCodeActions: (
    //         model /**ITextModel*/,
    //         range /**Range*/,
    //         context /**CodeActionContext*/,
    //         token /**CancellationToken*/
    //     ) => {
    //         console.log('provideCodeActions')
    //         const actions = context.markers.filter(
    //             error => error.severity == 8
    //         ).map(error => {
    //             console.log('actions => ', error)
    //             return {
    //                 title: `Example quick fix`,
    //                 kind: "quickfix",
    //                 edit: {
    //                     edits: [
    //                         {
    //                             textEdit: [
    //                                 {
    //                                     range: error,
    //                                     text: "New Text"
    //                                 }
    //                             ]
    //                         }
    //                     ]
    //                 },
    //                 isPreferred: true
    //             };
    //         });
    //         return {
    //             actions: actions,
    //             dispose: () => {}
    //         }
    //     }
    // })

    create_share_action(editor)
}

function create_share_action(editor)
{
    console.log(configuration)
    if (configuration.share_webhook !== undefined)
    {
        let lastSent = 0

        async function share_my_code() {

            const now = new Date().getTime()

            if (now - lastSent < 15000)
            {
                alert('Wait 15s between sharing.')
                return
            }
            
            lastSent = now

            const model = editor.getModel()
            const source_code = model.getValue()

            try {
                const res = await fetch(configuration.share_webhook, {
                    method: 'POST',
                    body: source_code
                })

                if (!res.ok)
                {
                    throw Error('Server refused to accept code.')
                }

                alert('Code shared successfully.')
            }
            catch(error)
            {
                console.log(error)
                alert('Failed to share code.')
            }
        }

        editor.addAction({
            id: "share-my-code",
            label: "Share My Code",
            keybindings: [],
            contextMenuGroupId: "9_cutcopypaste",
            run: () => share_my_code(),
        })
    }

}

require.config({ paths: { vs: 'external/monaco-editor/min/vs' } })
require(['vs/editor/editor.main'], init_editor)
