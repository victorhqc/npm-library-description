# npm-library-description
Shows dependencies information in your `package.json`

![Npm library description](https://i.imgur.com/tGWCxXT.png)

## Installation

You can install via `apm`:
```sh
apm install npm-library-description
```

Or, just search for `npm-library-description` inside Atom's package panel.

## What does it do?
Fetches the dependencies information from your `package.json`. Very useful to get the package's information. Faster than looking for it in google.

## How does it work?
Parses the file and looks whatever is inside `dependencies` and `devDependencies`.

After that it does an HTTP Request per `dependency` to fetch its information.

## Usage
Just open a valid `package.json` and click in the `information` icon of a dependency.

![Npm library description usage](https://i.imgur.com/EeXF3PW.gif);
