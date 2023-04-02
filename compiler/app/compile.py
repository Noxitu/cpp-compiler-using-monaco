import base64
from pathlib import Path
import subprocess
import tempfile
import time

import rich.console
import rich.json

console = rich.console.Console()


TEMP_ROOT = Path('/home/compiler/temp/')
TEMP_PREFIX = TEMP_ROOT / 'compilation-'

SOURCE_NAME = 'source.cpp'
APP_NAME = 'a.out'

ARG_CACHE = {}


def load_image(path: str):
    path: Path = Path(path)
    buffer = path.read_bytes()
    buffer = base64.b64encode(buffer).decode('ascii')

    mime = {
        '.png': 'image/png'
    }.get(path.suffix.lower(), 'image')

    buffer = f'data:{mime};base64,{buffer}'
    console.log(buffer)
    return buffer


def parse_instrumented(result):
    parsed = {}

    def parse(key):
        output = result[key]
        output, *lines = output.split('::instrumented_cout::')

        for line in lines:
            line, content = line.split('::', 1)
            output += content
            parsed.setdefault(int(line), []).append(f'[{key}] ' + content)

        result[key] = output

    parse('stderr')
    parse('stdout')
    result['instrumented_cout'] = [
        dict(line=key, messages=value)
        for key, value in parsed.items()
    ]

class CompileWorkflow:
    def __init__(self):
        self._zero_time = time.perf_counter()
        self._compiled = False

    def _step(self, name, **data):
        return dict(
            name=name,
            time=time.perf_counter() - self._zero_time,
            **data
        )
    
    def _ms(self):
        return int(1000 * (time.perf_counter() - self._zero_time))
    
    def _run(self, command, cwd):
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            cwd=cwd,
        )

        return dict(
            returncode=result.returncode,
            stdout=result.stdout,
            stderr=result.stderr,
        )

    def _prepare(self, source_code, cwd):
        console.log(f'Create File   (@ {self._ms()} ms)')
        (cwd / SOURCE_NAME).write_text(source_code)

        console.log(f'Prepare Args   (@ {self._ms()} ms)')
        arg_cache_key = Path('/home/compiler/app2/conanfile.txt').read_text()

        arg_cache_value = ARG_CACHE.get(arg_cache_key)
        arg_path = cwd / 'conanbuildinfo.args'

        if arg_cache_value is not None:
            arg_path.write_text(arg_cache_value)

        else:
            console.log(f'Conan Install   (@ {self._ms()} ms)')
            self._run([
                '/home/compiler/venv/bin/conan', 
                'install', 
                '/home/compiler/app2',
                '--build=missing',
            ], cwd=cwd)

            console.log(f'Store Args   (@ {self._ms()} ms)')
            ARG_CACHE[arg_cache_key] = arg_path.read_text()

    def _compile(self, cwd):
        console.log(f'Compile   (@ {self._ms()} ms)')

        result = self._run([
            'g++',
            SOURCE_NAME,
            '-O3',
            '-DNDEBUG',
            '-Wall', '-Wextra', '-Wpedantic',
            '@/home/compiler/app2/instrument_cout.args',
            '@conanbuildinfo.args',
            # '-fcolor-diagnostics',  # clang
            # '-fdiagnostics-color=always',  # gcc
            '-fdiagnostics-format=json',
            '-o', APP_NAME
        ], cwd=cwd)

        self._compiled = (result['returncode'] == 0)

        # console.log(result['stderr'])

        return self._step(
            'compile',
            **result
        )

    def _execute(self, cwd):
        console.log(f'Execute   (@ {self._ms()} ms)')
        result = self._run([
            cwd / APP_NAME, 
            '--gtest_output=json',
        ], cwd=cwd)

        parse_instrumented(result)

        console.log(f'Read Test Detail   (@ {self._ms()} ms)')
        try:
            test_detail = (cwd / 'test_detail.json').read_text()

        except FileNotFoundError:
            test_detail = None

        console.log(f'Done   (@ {self._ms()} ms)')

        return self._step(
            'execute', 
            test_detail=test_detail,
            **result
        )

    def _images(self, cwd: Path):
        imwrite_path = cwd / 'instrumented_imwrite.txt'
        if imwrite_path.exists():
            console.log('Imwrite   (@ {self._ms()} ms)')

            images = imwrite_path.read_text().split('\n')
            images = [
                dict(line=int(line), name=name, base64src=load_image(path))
                for line, name, path in zip(*(images[i::3] for i in range(3)))
            ]

            yield self._step(
                'imwrite', 
                images=images
            )

        return []

    def run(self, source_code):
        TEMP_ROOT.mkdir(parents=True, exist_ok=True)
    
        with tempfile.TemporaryDirectory(prefix=str(TEMP_PREFIX)) as cwd:
            cwd = Path(cwd)

            self._prepare(source_code, cwd)

            yield self._compile(cwd)

            if self._compiled:
                yield self._execute(cwd)
                yield from self._images(cwd)

            console.log(f'Done   (@ {self._ms()} ms)')


if __name__ == '__main__':
    CODE = """
    #include <iostream>
    
    int main() { std::cout << "line\\n"; }
    """

    for entry in CompileWorkflow().run(CODE):
        console.log(entry['stdout'])
        console.log(entry['stderr'])
        console.log(entry.get('instrumented_cout'))