# Notes

## ESBuild

Need to do a patch package or PR with them to allow non-aws runtimes to be built.

They do a key lookup on the provider which needs to be AWS, otherwise they don' think it's a node function and don't build it.

https://github.com/floydspace/serverless-esbuild/blob/master/src/index.ts#L132
