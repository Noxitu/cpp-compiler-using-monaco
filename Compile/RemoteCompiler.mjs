export default async function*(source_code) {
    const res = await fetch('http://localhost:8001/compile', {
        method: "POST",
        cache: "no-cache", 
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify({
            source_code: source_code
        })
    })

    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()

    var buffer = ''

    while (true) {
        const {value, done} = await reader.read()

        if (done)
        {
            if (buffer.length != 0)
            {
                alert(`Data left in buffer: ${JSON.stringify(buffer)}`)
            }

            break
        }

        buffer += value

        while (true)
        {
            const index = buffer.indexOf('\n')

            if (index == -1)
                break

            const line = buffer.substring(0, index)
            buffer = buffer.substring(index+1)

            yield JSON.parse(line)
        }
    }
}
