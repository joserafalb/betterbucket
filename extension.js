// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");

const getWorkspaceConfiguration = () => {
  const uri = vscode.window.activeTextEditor.document.uri;
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);

  return vscode.workspace.getConfiguration("betterbucket", workspaceFolder);
};

const getRepoUrl = (
  startingLineNumber = null,
  endingLineNumber = null,
  overrideBranch = null,
) => {
  const configuration = getWorkspaceConfiguration();

  const localPathToRemove = configuration.get("localPathToRemove");
  const repoBaseCodeUrl = configuration.get("repoBaseCodeUrl");
  const repoBranch = overrideBranch || configuration.get("repoBranch");

  const isValidWorkspace =
    vscode.window.activeTextEditor.document.uri.path.startsWith(
      localPathToRemove,
    );

  if (!isValidWorkspace) {
    return vscode.window.showInformationMessage(
      "This workspace does not have a defined matching repository. Please set one in the extension settings.",
    );
  }

  const currentlyOpenTabAbsoluteFilePath =
    vscode.window.activeTextEditor.document.uri.path;

  const currentlyOpenTabFilePath = currentlyOpenTabAbsoluteFilePath.replace(
    localPathToRemove,
    "",
  );

  const filePath = currentlyOpenTabFilePath.startsWith("/")
    ? currentlyOpenTabFilePath.substring(1)
    : currentlyOpenTabFilePath;

  const baseUrl = repoBaseCodeUrl.endsWith("/")
    ? repoBaseCodeUrl
    : repoBaseCodeUrl + "/";

  const baseUrlMatch = baseUrl.match(/\/blob\/(\w+\/)$/);

  let normalizedBaseUrl = baseUrl;

  if (baseUrlMatch?.[1] && overrideBranch) {
    normalizedBaseUrl = baseUrl.replace(baseUrlMatch[1], `${overrideBranch}/`);
  } else if (!baseUrlMatch && repoBranch) {
    normalizedBaseUrl = baseUrl + `${repoBranch}/`;
  }

  const url = normalizedBaseUrl + filePath;

  let lineSuffix = "";

  if (Number.isInteger(startingLineNumber)) {
    if (url.includes("gitlab.com") || url.includes("github.com")) {
      lineSuffix = `#L${startingLineNumber}`;
    } else if (url.includes("bitbucket.org")) {
      lineSuffix = `lines-${startingLineNumber}`;
    } else {
      vscode.window.showInformationMessage(
        "Line number highlighting is not supported with your repository client at this time.",
      );
    }

    if (
      lineSuffix &&
      Number.isInteger(endingLineNumber) &&
      startingLineNumber !== endingLineNumber
    ) {
      if (url.includes("gitlab.com")) {
        lineSuffix += `-${endingLineNumber}`;
      } else if (url.includes("github.com")) {
        lineSuffix += `-L${endingLineNumber}`;
      } else if (url.includes("bitbucket.org")) {
        lineSuffix += `:${endingLineNumber}`;
      }
    }
  }

  return url + lineSuffix;
};

const openInBrowser = (
  startingLineNumber = null,
  endingLineNumber = null,
  overrideBranch = null,
) => {
  const url = getRepoUrl(startingLineNumber, endingLineNumber, overrideBranch);

  vscode.env.openExternal(vscode.Uri.parse(url));
};

const copyToClipboard = (
  startingLineNumber = null,
  endingLineNumber = null,
  overrideBranch = null,
) => {
  const url = getRepoUrl(startingLineNumber, endingLineNumber, overrideBranch);

  vscode.env.clipboard.writeText(url);
};

const awaitBranchOverridePrompt = async () => {
  const branch = await vscode.window.showInputBox({
    placeHolder: "develop",
    prompt: "Enter overriding branch name.",
  });

  return branch;
};

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  const disposableOpenInRepo = vscode.commands.registerCommand(
    "betterbucket.openInRepo",
    openInBrowser,
  );

  const disposableOpenInRepoWithLineNumber = vscode.commands.registerCommand(
    "betterbucket.openInRepoWithLineNumber",
    function () {
      const activeEditor = vscode.window.activeTextEditor;

      openInBrowser(
        activeEditor.selection.start.line + 1,
        activeEditor.selection.end.line + 1,
      );
    },
  );

  const disposableCopyToClipboard = vscode.commands.registerCommand(
    "betterbucket.copyToClipboard",
    copyToClipboard,
  );

  const disposableCopyToClipboardWithLineNumber =
    vscode.commands.registerCommand(
      "betterbucket.copyToClipboardWithLineNumber",
      function () {
        const activeEditor = vscode.window.activeTextEditor;

        copyToClipboard(
          activeEditor.selection.start.line + 1,
          activeEditor.selection.end.line + 1,
        );
      },
    );

  const disposableOpenInRepoWithBranchOverride =
    vscode.commands.registerCommand(
      "betterbucket.openInRepoWithBranchOverride",
      async function () {
        const branch = await awaitBranchOverridePrompt();

        openInBrowser(null, null, branch);
      },
    );

  const disposableOpenInRepoWithLineNumberAndBranchOverride =
    vscode.commands.registerCommand(
      "betterbucket.openInRepoWithLineNumberAndBranchOverride",
      async function () {
        const branch = await awaitBranchOverridePrompt();

        const activeEditor = vscode.window.activeTextEditor;

        openInBrowser(
          activeEditor.selection.start.line + 1,
          activeEditor.selection.end.line + 1,
          branch,
        );
      },
    );

  const disposableCopyFileNameToClipboard = vscode.commands.registerCommand(
    "betterbucket.copyFileNameToClipboard",
    async function () {
      vscode.env.clipboard.writeText(
        vscode.window.activeTextEditor.document.uri.path.split("/").pop(),
      );
    },
  );

  const disposableCopyFilePathToClipboard = vscode.commands.registerCommand(
    "betterbucket.copyFilePathToClipboard",
    async function () {
      const configuration = getWorkspaceConfiguration();

      const localPathToRemove = configuration.get("localPathToRemove");

      const filePath = vscode.window.activeTextEditor.document.uri.path
        .split(localPathToRemove)
        .pop();

      vscode.env.clipboard.writeText(filePath);

      const prefix = await vscode.window.showInputBox({
        placeHolder: "",
        prompt:
          "Enter a path prefix, or enter `!` for full system path (optional)",
      });

      if (prefix) {
        if (prefix === "!") {
          vscode.env.clipboard.writeText(
            vscode.window.activeTextEditor.document.uri.path,
          );
        } else {
          vscode.env.clipboard.writeText(prefix + filePath);
        }
      }
    },
  );

  context.subscriptions.push(disposableOpenInRepo);
  context.subscriptions.push(disposableOpenInRepoWithLineNumber);
  context.subscriptions.push(disposableCopyToClipboard);
  context.subscriptions.push(disposableCopyToClipboardWithLineNumber);

  context.subscriptions.push(disposableOpenInRepoWithBranchOverride);
  context.subscriptions.push(
    disposableOpenInRepoWithLineNumberAndBranchOverride,
  );

  context.subscriptions.push(disposableCopyFileNameToClipboard);
  context.subscriptions.push(disposableCopyFilePathToClipboard);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
