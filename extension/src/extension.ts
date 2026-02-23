import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    const provider = new MedhavinViewProvider(context.extensionUri);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider("medhavinSidebar", provider)
    );
}

class MedhavinViewProvider implements vscode.WebviewViewProvider {

    constructor(private readonly extensionUri: vscode.Uri) {}

    resolveWebviewView(webviewView: vscode.WebviewView) {

        webviewView.webview.options = {
            enableScripts: true
        };

        webviewView.webview.html = this.getHtml();
    }

    private getHtml(): string {

        return `
<!DOCTYPE html>
<html>
<head>
<style>
body {
    background-color: #0f172a;
    color: white;
    font-family: Arial, sans-serif;
    padding: 15px;
}

.header {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 15px;
}

textarea {
    width: 100%;
    height: 80px;
    border-radius: 6px;
    border: none;
    padding: 8px;
    margin-bottom: 10px;
}

button {
    width: 100%;
    padding: 10px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-weight: bold;
    margin-bottom: 10px;
}

.ask-btn {
    background: #38bdf8;
}

.record-btn {
    background: #8b5cf6;
}

.output {
    margin-top: 15px;
    background: #1e293b;
    padding: 12px;
    border-radius: 10px;
    min-height: 100px;
    white-space: pre-wrap;
}
</style>
</head>

<body>

<div class="header">Medhavin AI</div>

<textarea id="prompt" placeholder="Type your request..."></textarea>

<button class="ask-btn" onclick="sendText()">Send</button>

<button class="record-btn" onclick="recordVoice()">🎤 Record (5s)</button>

<div class="output" id="output">Waiting...</div>

<script>

async function sendText() {

    const prompt = document.getElementById("prompt").value;
    const output = document.getElementById("output");

    if (!prompt) {
        output.innerText = "Enter a prompt first.";
        return;
    }

    output.innerText = "Processing...";

    try {
        const response = await fetch("http://127.0.0.1:8000/ask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt: prompt })
        });

        const data = await response.json();
        output.innerText = JSON.stringify(data, null, 2);

    } catch (err) {
        output.innerText = "Backend error: " + err;
    }
}


async function recordVoice() {

    const output = document.getElementById("output");
    output.innerText = "Recording 5 seconds... Speak now.";

    try {
        const response = await fetch("http://127.0.0.1:8000/record", {
            method: "POST"
        });

        const data = await response.json();

        output.innerText =
            "Transcript:\\n" + data.transcript +
            "\\n\\nAgent Result:\\n" +
            JSON.stringify(data.agent, null, 2);

    } catch (err) {
        output.innerText = "Backend error: " + err;
    }
}

</script>

</body>
</html>
`;
    }
}

export function deactivate() {}