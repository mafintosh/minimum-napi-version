# minimum-napi-version

Command line tool to figure out what the minimum version of N-API is needed
for your binary

```
npm install -g minimum-napi-version
cd some-n-api-module
node-gyp rebuild
minimum-napi-version # prints the minimum Node.js version that has the N-API functions you use
```

If you are providing a prebuild you might want to compile against the minimum Node.js version
to cover as many Node.js versions as possible.

Only tested on OSX atm, Linux and Windows support welcome as a PR.

## License

MIT
