import asyncio
import json

import fastapi
import fastapi.middleware.cors

from compile import CompileWorkflow


app = fastapi.FastAPI()


app.add_middleware(
    fastapi.middleware.cors.CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.post("/compile")
def compile(info: dict):
    print(info)

    workflow = CompileWorkflow()
    return fastapi.responses.StreamingResponse((
        json.dumps(entry).replace('\n', '') + '\n' 
        for entry in workflow.run(info['source_code'])
    ))
