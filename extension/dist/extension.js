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
        webviewView.webview.html = this.getHtml();
    }
    getHtml() {
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