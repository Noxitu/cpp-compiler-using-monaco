import { source_code as CODE } from './files.js'
import ClangFormatEditProvider from './ClangFormat/ClangFormatEditProvider.mjs'
import compile_action from './Compile/CompileAction.mjs'
import {registerGTestLensProvider} from './Compile/GTestLensProvider.mjs'

function init_editor()
{
    monaco.languages.registerDocumentFormattingEditProvider('cpp', new ClangFormatEditProvider())

    const editor = monaco.editor.create(document.getElementById('container'), {
        value: CODE,
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
}


require.config({ paths: { vs: 'external/monaco-editor/min/vs' } })
require(['vs/editor/editor.main'], init_editor)
