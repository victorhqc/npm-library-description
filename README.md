# npm-library-description
![Build Status](https://img.shields.io/circleci/project/github/victorhqc/npm-library-description/master.svg) ![License](https://img.shields.io/apm/l/npm-library-description.svg) ![Version](https://img.shields.io/apm/v/npm-library-description.svg) ![Downloads](https://img.shields.io/apm/dm/npm-library-description.svg)

Shows information about dependencies in your `package.json`

![Npm library description](https://i.imgur.com/qsHs5uT.png)

## Installation

You can install via `apm`:
```sh
apm install npm-library-description
```

Or, just search for `npm-library-description` inside Atom's package panel.

## What does it do?
Fetches the dependencies information from your `package.json`. Very useful to get the package's
information. Faster than looking for it in google.

## How does it work?
Parses the file and looks whatever is inside `dependencies` and `devDependencies`.

After that it does an HTTP Request per `dependency` to fetch its information.

## Usage
Just open a valid `package.json` and click in the `information` icon of a dependency.

![Npm library description usage](https://i.imgur.com/ashyBYZ.gif)

## Features

When it opens or updates an invalid file, it'll warn about bad parsing.

![Npm library description warning](https://i.imgur.com/UqAjTDH.gif)

Additionally you can choose the option to just use mouse over to show the `dependencies`

![Npm library config](https://i.imgur.com/usARZl3.png)

![Npm library mouse move](https://i.imgur.com/wBOLg9o.gif)
