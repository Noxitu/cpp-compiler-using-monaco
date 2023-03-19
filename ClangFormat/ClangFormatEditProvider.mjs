import run_wasm_formatter from './WasmFormatter.mjs'

export default class
{
    constructor() 
    {
        this._format = run_wasm_formatter
    }

	async provideDocumentFormattingEdits(model, _options, _token) 
    {
        const input_code = model.getValue()
        const output_code = 'Hello world'

        return [{
            text: await this._format(model.getValue()),
            range: model.getFullModelRange()
        }]
    }
}