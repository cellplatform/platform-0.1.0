![Module](https://img.shields.io/badge/%40platform-cell.electron-%23EA4E7E.svg)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM](https://img.shields.io/npm/v/@platform/cell.electron.svg?colorB=blue&style=flat)](https://www.npmjs.com/package/@platform/cell.electron)
![banner](https://user-images.githubusercontent.com/185555/74685429-69334980-5233-11ea-9dfb-c51cbb577d69.png)

Electron shell for CellOS.

<p>&nbsp;<p>

## Setup

    yarn add @platform/cell.electron

<p>&nbsp;<p>

## Development

To run the app:

    yarn start

Or to run with in live system UI development mode:

    yarn dev

and in a seperate terminal, run the UI [parcel](https://parceljs.org) server:

    yarn ui

<p>&nbsp;<p>

## Packaging

[Package](https://www.electronforge.io/cli#package) the application as an executable (while testing), or [Make](https://www.electronforge.io/cli#make) the executable into a distributable format:

    yarn bundle     # Bundle UI assets.
    yarn package    # Package application into an executable (testing), or
    yarn make       # Package application and compile into distributable format.

<p>&nbsp;<p>
<p>&nbsp;<p>
