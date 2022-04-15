# Examples
This folder is used to run the full application on some input files for testing purposes.

## How to
The files in the folder are sufficient to successfully run the application on them.

1. Build the application first:

```
npm run build
```

2. Then run an example:

```
node .\lib\xmdparser.js --src .\examples\<file>.md --verbose --overwrite
```

### External resources
Some files have references to images or other resources. In order to guarantee that all files can successfully be parsed, you must do this manual work first:

1. Inside this folder `examples`, make sure images following this pattern are present: `example_imm_<k>.png` where `k` ranges from `1` to `6`.
