![Module](https://img.shields.io/badge/%40platform-cell.electron-%23EA4E7E.svg)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM](https://img.shields.io/npm/v/@platform/cell.electron.svg?colorB=blue&style=flat)](https://www.npmjs.com/package/@platform/cell.electron)
![banner](https://user-images.githubusercontent.com/185555/74685429-69334980-5233-11ea-9dfb-c51cbb577d69.png)

Electron shell for the root Cell development environment.
All product specific development environments can be "designed" and the "compiled" from here.

<p>&nbsp;<p>

## Setup

    yarn add @platform/cell.electron

<p>&nbsp;<p>

## Development

To run the app:

    yarn start

Or to run with in live system UI development mode:

    yarn dev

Modules that are under development can be assigned a development `port` which when running in
`dev` mode the app will favor when loading the `BrowserWindow`. For instance, the bundled `cell.ui.sys`
module runs against:

    http://localhost:1234

Ensure that is running in a seperate console window to develop with.

<p>&nbsp;<p>

## Packaging Toolchain

[Package](https://www.electronforge.io/cli#package) the application as an executable (while testing), or [Make](https://www.electronforge.io/cli#make) the executable into a distributable format ([asar](https://www.electronjs.org/docs/tutorial/application-packaging)):

    yarn package    # Package application into an executable (testing), OR
    yarn make       # Package application and compile into distributable format.

<p>&nbsp;<p>

## .env

The packager requires several environment variables to sign and notalize the build.
Ensure you have a `.env` file in the root containing the following:

```bash
OSX_SIGN_IDENTITY = "Developer ID Application: <name> (<id>)"
APPLE_ID = "<id>"
APPLE_ID_PASSWORD = "<password>"
```

### `OSX_SIGN_IDENTITY`

To obtain the `OSX_SIGN_IDENTITY` create a **"Developer ID Application"** type of certificate within the
Apple [developer membership portal](https://developer.apple.com), download and install it within the MacOS "Keychain Access" application, then copy the `name/id` into the `.env` file.

### `APPLE_ID`

When setting the `APPLE_ID` make sure to use an "app specific" login for the application, otherwise the [notorization service](https://developer.apple.com/developer-id/) will fail (with a quite unhelpful error message).

App specific passwords for your `APPLE_ID` can be created at [appleid.apple.com](https://appleid.apple.com)

<p>&nbsp;<p>
<p>&nbsp;<p>
