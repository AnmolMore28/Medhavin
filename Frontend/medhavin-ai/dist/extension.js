/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/extension.ts"
/*!**************************!*\
  !*** ./src/extension.ts ***!
  \**************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(__webpack_require__(/*! vscode */ "vscode"));
function activate(context) {
    // This ID "medhavinSidebar" MUST match the ID in package.json
    const provider = new MedhavinViewProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("medhavinSidebar", provider));
}
class MedhavinViewProvider {
    extensionUri;
    constructor(extensionUri) {
        this.extensionUri = extensionUri;
    }
    resolveWebviewView(webviewView) {
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
    getHtml(webview) {
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
function deactivate() { }


/***/ },

/***/ "vscode"
/*!*************************!*\
  !*** external "vscode" ***!
  \*************************/
(module) {

module.exports = require("vscode");

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Check if module exists (development only)
/******/ 		if (__webpack_modules__[moduleId] === undefined) {
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/extension.ts");
/******/ 	var __webpack_export_target__ = exports;
/******/ 	for(var __webpack_i__ in __webpack_exports__) __webpack_export_target__[__webpack_i__] = __webpack_exports__[__webpack_i__];
/******/ 	if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map