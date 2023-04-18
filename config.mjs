
const default_config = {
    files: {
        'Empty': '\nint main()\n{\n    return 0;\n}\n', 
    },
    default: 'Empty',
}

console.log(btoa(JSON.stringify(default_config)))

function load_config() 
{
    try
    {
        const buffer = atob(document.location.hash.substring(1))

        if (buffer == '')
            return default_config

        return JSON.parse(buffer)
    }
    catch(_)
    {
        return default_config
    }
}

export const configuration = load_config()
console.log(configuration)
