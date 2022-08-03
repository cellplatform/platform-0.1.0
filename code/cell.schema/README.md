![Module](https://img.shields.io/badge/%40platform-cell.schema-%23EA4E7E.svg)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM](https://img.shields.io/npm/v/@platform/cell.schema.svg?colorB=blue&style=flat)](https://www.npmjs.com/package/@platform/cell.schema)
![banner](https://user-images.githubusercontent.com/185555/68096906-c7ece580-ff18-11e9-8b4f-bfa6c7ca21f1.png)

URI and database schemas for the `CellOS`.

## Setup

    yarn add @platform/cell.schema

<p>&nbsp;</p>

## URI Scheme

See `Schema.uri` for URI helpers.

```
KIND            URI                     DESCRIPTION
---------------------------------------------------------------------------------------------------------------------------------
Namespace       ns:<id>                 A set of cells/row/columns that exist in the same logical-space (aka "table" or "sheet").
Cell            cell:<ns>!<A1>          A single cell (the core primitive data-structure of CellOS).
Row             row:<ns>!<1>            Meta-data for a single "row" within a namespace.
Column          col:<ns>!<A>            Meta-data for a single "column" within a namespace.
File            file:<ns>.<id>          A binary file.
```

<p>&nbsp;</p>
<p>&nbsp;</p>

![diagram](https://user-images.githubusercontent.com/185555/69764149-3c433d80-11d4-11ea-8f43-add586e2c04a.png)

<p>&nbsp;</p>
<p>&nbsp;</p>
