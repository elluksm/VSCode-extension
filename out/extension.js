"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const cats = {
    'Coding Cat': 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
    'Compiling Cat': 'https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif',
    'Testing Cat': 'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif'
};
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "my_first_extension" is now active!');
    //Track currently webview panel
    let currentPanel = undefined;
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    context.subscriptions.push(vscode.commands.registerCommand('extension.hello', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello VS Code!');
        const columnToShowIn = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
        if (currentPanel) {
            // If we already have a panel, show it in the target column
            currentPanel.reveal(columnToShowIn);
        }
        else {
            // Otherwise create a new panel
            currentPanel = vscode.window.createWebviewPanel('catCoding', //Identifies the type of the webview (internally)
            'Cat Coding', //Title of the panel displayed to the user
            vscode.ViewColumn.One, //Editor column to show the new webview panel in
            {
                enableScripts: true,
                retainContextWhenHidden: true
            });
            // Handle messages from the webview
            currentPanel.webview.onDidReceiveMessage(message => {
                switch (message.command) {
                    case 'alert':
                        vscode.window.showErrorMessage(message.text);
                        return;
                }
            });
            let iteration = 0;
            const updateWebview = () => {
                const cat = iteration++ % 2 ? 'Compiling Cat' : 'Coding Cat';
                if (currentPanel) {
                    updateWebviewForCat(currentPanel, cat);
                }
            };
            //Set initial content
            updateWebview();
            const interval = setInterval(updateWebview, 2000);
            // Reset when the current panel is closed
            currentPanel.onDidDispose(() => {
                //when the panel is closed, cancel any future updates to the webview content
                clearInterval(interval);
                currentPanel = undefined;
            }, null, context.subscriptions);
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.doRefactor', () => {
        if (!currentPanel) {
            return;
        }
        //send a message to the webview
        currentPanel.webview.postMessage({ command: 'refactor' });
    }));
}
exports.activate = activate;
function updateWebviewForCat(panel, catName) {
    panel.title = catName;
    panel.webview.html = getWebviewContent(catName);
}
function getWebviewContent(cat) {
    return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link rel="stylesheet" href="styles.css">
		<title>Cat Coding</title>
	</head>
	<body>
		<img src="${cats[cat]}" width="300" />
		<h1 id="lines-of-code-counter"> 0 </h1>
		<p> ${cats[cat]} </p>

		<script>
			(function() {
				const vscode = acquireVsCodeApi();
				const counter = document.getElementById('lines-of-code-counter');

				//check if we have an old state to restore from
				const previousState = vscode.getState();
				let count = previousState ? previousState.count : 0;
				counter.textContent = count;

				setInterval(() => {
					counter.textContent = count++;

					//update the saved state
					vscode.setState({ count });

					//Alert the extension when our cat introduce a bug
					if (Math.random() < 0.001 * count) {
						vscode.postMessage({
							command: 'alert',
							text: '🐛  on line ' + count
						})
					}
				}, 100);

				//Handle the message inside the webview
				window.addEventListener('message', event => {
					//the JSON data our extension sent
					const message = event.data;
	
					switch (message.command) {
						case 'refactor':
							count = Math.ceil(count * 0.7);
							counter.textContent = count;
							break;
					}
				})
			}())
		</script>
	</body>
	</html>`;
}
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map