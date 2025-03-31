# BetterBucket

=======================

## Overview

This plugin will open a new tab in your browser to your connected repo at the currently open file.

## Features

It has 7 actions:

- Open the bitbucket file in the browser: (`cmd+alt+shift+b`)
- Open the bitbucket file in the browser on the current line that the cursor is at: (`cmd+alt+shift+n`)
- Copy the bitbucket file link to your clipboard: (`cmd+alt+shift+c`)
- Copy the bitbucket file link with the current line anchor appended to your clipboard: (`cmd+alt+shift+v`)
- Open the bitbucket file in the browser with repo branch override: (Use Command Palette)
- Open the bitbucket file in the browser on the current text cursor line with repo branch override: (Use Command Palette)
- Copy the currently open file name to the clipboard: (`alt+c`)
- Copy the currently open file path to the clipboard: (`alt+shift+c`)
  - This will bring up an optional prompt to add a prefix to the file path. Hit `escape` to close the optional prompt.

## Extension Settings

You should add the three settings to each workspace project at the `settings.json` wile within your workspace `.vscode` directory. You should not define these configurations globally as they are project specific.

This extension includes the following settings:

- `betterbucket.localPathToRemove`: Local workspace/project path to replace with the base repository code browsing URL. Example: `/Users/user.name/projects/my-proejct/`
- `betterbucket.repoBaseCodeUrl`: The base repository code browsing URL. Example: `https://gitlab.com/org/project/reponame/-/blob/develop/`
- `betterbucket.repoBranch` (optional): Set your repo branch explicily. This will only be used if the branch is no included in your `repoBaseCodeUrl` config. This defaults to `develop`.
