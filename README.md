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

When it opens an invalid file, it'll warn about bad parsing.

![Npm library description warning](https://i.imgur.com/pTJZ2s3.gif)

Updates the `dependencies` information on save. If the dependencies were already
fetched, there will be no additional HTTP Requests.

![Npm library update](https://i.imgur.com/KT2eCuc.gif)

Colors used will change according to current theme

![Npm library white theme](https://i.imgur.com/WloQhYh.png)

Additionally you can choose the option to just use mouse over to show the `dependencies`
