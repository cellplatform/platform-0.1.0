![Module](https://img.shields.io/badge/%40platform-cell.schema-%23EA4E7E.svg)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM](https://img.shields.io/npm/v/@platform/cell.schema.svg?colorB=blue&style=flat)](https://www.npmjs.com/package/@platform/cell.schema)
![banner](https://user-images.githubusercontent.com/185555/68096906-c7ece580-ff18-11e9-8b4f-bfa6c7ca21f1.png)

URI and database schemas for the `CellOS`.

## Setup

    yarn add @platform/cell.schema

<p>&nbsp;</p>

## URI Scheme

See [@platform/cell.coord](../cell.schema) for URI helpers.

```
ns:<id>             Namespace:  A set of cells/row/columns that exist in the same logical-space (aka "table" or "sheet").
cell:<ns>!<A1>      Cell:       A single cell (the core primitive data-structure of CellOS).
row:<ns>!<1>        Row:        Meta-data for a single "row" within a namespace.
col:<ns>!<A>        Column:     Meta-data for a single "column" within a namespace.
file:<ns>:<id>      File:       A binary file.
```

<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>

![diagram](https://user-images.githubusercontent.com/185555/69760850-7c052780-11ca-11ea-8f8e-ecc54949598b.png)

## Resource Mapping (DB)

See [@platform/cell.db](../cell.db) for database model implementation.

![diagram](https://user-images.githubusercontent.com/185555/69760949-cbe3ee80-11ca-11ea-852b-dcaa028b67df.png)

<p>&nbsp;</p>
<p>&nbsp;</p>
