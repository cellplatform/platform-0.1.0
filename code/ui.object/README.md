![Module](https://img.shields.io/badge/%40platform-ui.object-%23EA4E7E.svg)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM](https://img.shields.io/npm/v/@platform/ui.object.svg?colorB=blue&style=flat)](https://www.npmjs.com/package/@platform/ui.object)

# ui.object
Visual display of javascript object.

<p>&nbsp;<p>

## API

### `expandPaths`
 
The path string is similar to JSONPath. Examples:
```
$.foo.bar                     Expand just `bar`
['$', '$.foo', '$.foo.bar']   Expand all the way down to `bar`
['$', '$.1']                  Array index
['$', '$.*']                  Wildcard, equivalent to expandLevel={2}.
```

See [source ref](https://github.com/xyc/react-inspector#api).
