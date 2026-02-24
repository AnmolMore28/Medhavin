import ollama
import os
import subprocess
import shutil
import json

# =========================
# PROJECT ROOT
# =========================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.join(BASE_DIR, "workspace")
MEMORY_FILE = os.path.join(BASE_DIR, "memory.json")

os.makedirs(PROJECT_ROOT, exist_ok=True)

# =========================
# MEMORY
# =========================

def load_memory():
    if os.path.exists(MEMORY_FILE):
        with open(MEMORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def save_memory(history):
    history = history[-20:]  # keep last 20 exchanges
    with open(MEMORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)

# =========================
# FILE UTILITIES
# =========================

def find_file_by_name(filename):
    for root, dirs, files in os.walk(PROJECT_ROOT):
        if filename in files:
            return os.path.join(root, filename)
    return None

def find_folder_by_name(foldername):
    for root, dirs, files in os.walk(PROJECT_ROOT):
        if foldername in dirs:
            return os.path.join(root, foldername)
    return None

def read_file(path):
    full_path = os.path.join(PROJECT_ROOT, path)
    if not os.path.exists(full_path):
        return "File does not exist."
    with open(full_path, "r", encoding="utf-8") as f:
        return f.read()

def write_file(path, content):
    full_path = os.path.join(PROJECT_ROOT, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)
    return f"File '{path}' written successfully."

def delete_file_smart(filename):
    path = find_file_by_name(filename)
    if path:
        os.remove(path)
        return f"Deleted file: {path}"
    return "File not found."

def delete_folder(foldername):
    path = find_folder_by_name(foldername)
    if path:
        shutil.rmtree(path)
        return f"Deleted folder: {path}"
    return "Folder not found."

def create_directory(dirname):
    path = os.path.join(PROJECT_ROOT, dirname)
    os.makedirs(path, exist_ok=True)
    return f"Directory created: {path}"

def list_files():
    file_list = []
    for root, dirs, files in os.walk(PROJECT_ROOT):
        for name in files:
            relative = os.path.relpath(os.path.join(root, name), PROJECT_ROOT)
            file_list.append(relative)
    return "\n".join(file_list) if file_list else "No files yet."

def run_python(path):
    full_path = os.path.join(PROJECT_ROOT, path)
    if not os.path.exists(full_path):
        return "File does not exist."

    result = subprocess.run(
        ["python", full_path],
        capture_output=True,
        text=True
    )

    if result.returncode == 0:
        return f"Execution successful:\n{result.stdout}"
    else:
        return f"Execution failed:\n{result.stderr}"

# =========================
# LLM INTERACTION
# =========================

def ask_llama(prompt, context, history):

    system_prompt = f"""
You are Medhavin, an advanced AI coding copilot.

You can use these actions:

To write a file:
ACTION: write_file
PATH: filename.py
CONTENT:
<code>
END

To read a file:
ACTION: read_file
PATH: filename.py
END

To run a file:
ACTION: run_python
PATH: filename.py
END

To delete a file (by name only):
ACTION: delete_file
PATH: filename.py
END

To delete a folder:
ACTION: delete_folder
PATH: foldername
END

To create a directory:
ACTION: create_directory
PATH: foldername
END

If user mentions a file without path, search workspace.

Project files:
{context}
"""

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history)
    messages.append({"role": "user", "content": prompt})

    response = ollama.chat(
        model="llama3",
        messages=messages
    )

    return response["message"]["content"]

# =========================
# ACTION PARSER
# =========================

def parse_actions(response):

    response = response.replace("```", "")
    lines = response.splitlines()

    actions = []
    action = None
    path = None
    content_lines = []
    content_mode = False

    for line in lines:

        if line.startswith("ACTION:"):
            if action:
                actions.append((action, path, "\n".join(content_lines)))
                content_lines = []
            action = line.replace("ACTION:", "").strip()
            path = None
            content_mode = False

        elif line.startswith("PATH:"):
            path = line.replace("PATH:", "").strip()

        elif line.strip() == "CONTENT:":
            content_mode = True

        elif line.strip() == "END":
            if action:
                actions.append((action, path, "\n".join(content_lines)))
            action = None
            path = None
            content_lines = []
            content_mode = False

        elif content_mode:
            content_lines.append(line)

    return actions

# =========================
# MAIN EXECUTION
# =========================

def run_medhavin(prompt: str):

    history = load_memory()
    project_context = list_files()

    raw_output = ask_llama(prompt, project_context, history)

    history.append({"role": "user", "content": prompt})
    history.append({"role": "assistant", "content": raw_output})
    save_memory(history)

    actions = parse_actions(raw_output)

    if not actions:
        return {
            "status": "response",
            "message": raw_output
        }

    final_output = ""

    for action, path, content in actions:

        if action == "write_file":
            final_output = write_file(path, content)

        elif action == "read_file":
            final_output = read_file(path)

        elif action == "run_python":
            final_output = run_python(path)

        elif action == "delete_file":
            final_output = delete_file_smart(path)

        elif action == "delete_folder":
            final_output = delete_folder(path)

        elif action == "create_directory":
            final_output = create_directory(path)

    return {
        "status": "completed",
        "output": final_output
    }