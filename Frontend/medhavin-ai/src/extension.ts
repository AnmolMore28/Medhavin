import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    // This ID "medhavinSidebar" MUST match the ID in package.json
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

    webviewView.webview.html = this.getHtml(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((message) => {
        if (message.command === "activate") {
           vscode.window.showInformationMessage("Voice Activated: " + message.text);
        }
    });
}
   private getHtml(webview: vscode.Webview): string {

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
    position: relative;
}

.header {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 15px;
}

select {
    width: 100%;
    padding: 8px;
    margin-bottom: 15px;
    border-radius: 6px;
    border: none;
}

.mic {
    background: linear-gradient(90deg, #8b5cf6, #38bdf8);
    padding: 15px;
    text-align: center;
    border-radius: 12px;
    cursor: pointer;
    font-weight: bold;
    transition: 0.3s;
}

.mic-active {
    animation: micPulse 1.5s infinite;
}

@keyframes micPulse {
    0% { box-shadow: 0 0 5px #38bdf8; }
    50% { box-shadow: 0 0 25px #38bdf8; }
    100% { box-shadow: 0 0 5px #38bdf8; }
}

.output {
    margin-top: 15px;
    background: #1e293b;
    padding: 12px;
    border-radius: 10px;
    min-height: 80px;
}

/* Google style moving gradient bar */
#listeningBar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 4px;
    width: 100%;
    background: linear-gradient(
        90deg,
        red,
        orange,
        yellow,
        green,
        cyan,
        blue,
        violet,
        red
    );
    background-size: 300% 100%;
    animation: moveGradient 2s linear infinite;
    display: none;
}

@keyframes moveGradient {
    0% { background-position: 0% 0; }
    100% { background-position: 100% 0; }
}

</style>
</head>

<body>

<div class="header">🤖 Medhavin AI</div>

<select id="mode">
    <option value="generate">Generate</option>
    <option value="explain">Explain</option>
    <option value="debug">Debug</option>
</select>

<div class="mic" id="mic">🎤 Listen</div>

<div class="output" id="output">Waiting...</div>

<div id="listeningBar"></div>

<script>

const mic = document.getElementById("mic");
const output = document.getElementById("output");
const listeningBar = document.getElementById("listeningBar");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition;
let isRecording = false;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
}

mic.onclick = () => {

    if (!recognition) {
        output.innerHTML = "❌ Speech not supported";
        return;
    }

    if (!isRecording) {

        try {
            recognition.start();
            isRecording = true;

            mic.classList.add("mic-active");
            listeningBar.style.display = "block";
            mic.innerHTML = "🔴 Listening...";
            output.innerHTML = "🎧 Speak now...";

        } catch (e) {
            console.log("Already started");
        }
    }
};

if (recognition) {

    recognition.onresult = (event) => {

        const transcript = event.results[0][0].transcript;

        output.innerHTML = "📝 " + transcript;

        resetUI();
    };

    recognition.onerror = (event) => {
        output.innerHTML = "❌ Error: " + event.error;
        resetUI();
    };

    recognition.onend = () => {
        resetUI();
    };
}

function resetUI() {
    mic.classList.remove("mic-active");
    listeningBar.style.display = "none";
    mic.innerHTML = "🎤 Listen";
    isRecording = false;
}

</script>

</body>
</html>
`;
   }
}
export function deactivate() {}