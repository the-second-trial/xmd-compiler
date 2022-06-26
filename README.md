# xmd-parser
Parser for converting an eXtended MarkDown into different formats.

## Developing
Remember that `package.json` inside the root must contain a `dependencies` which is the union of all `dependencies` in each single sub-project.

## Testing an example
To test an example:

1. Run `npm run build`.
2. Run `node .\lib\xmdparser.js --src .\examples\<example>.md --debug --template <template>`.

## Run using containers
Run:

```
docker run --name xmd --rm -it -v C:/mydata:/home/xmd/out xmd/v1:test --src /home/xmd/out/simple.md --debug --template tex_doc --pdfLatexPath /usr/local/texlive/2022/bin/x86_64-linux/pdflatex
```
