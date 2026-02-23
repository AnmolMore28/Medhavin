import ollama
import os
import subprocess

PROJECT_ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "workspace")
os.makedirs(PROJECT_ROOT, exist_ok=True)


def read_file(path):
    full_path = os.path.join(PROJECT_ROOT, path)
    if not os.path.exists(full_path):
        return "File does not exist."
    with open(full_path, "r", encoding="utf-8") as f:
        return f.read()


def write_file(path, content):
    full_path = os.path.join(PROJECT_ROOT, path)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)
    return f"File '{path}' written successfully."


def list_files():
    return "\n".join(os.listdir(PROJECT_ROOT))


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


def ask_llama(prompt, context="", error_context=""):
    system_prompt = f"""
You are Medhavin, an advanced AI coding copilot.

You can use these actions:

To write a file:
ACTION: write_file
PATH: filename.py
CONTENT:
<code>
END

After writing a file, always run it to verify output.
To run a file:
ACTION: run_python
PATH: filename.py
END

If execution fails, fix the code and rewrite the file.

Project files:
{context}

Execution errors:
{error_context}
"""

    response = ollama.chat(
        model="llama3",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]
    )

    return response["message"]["content"]


def parse_actions(response):
    response = response.replace("**", "")
    response = response.replace("```", "")

    actions = []
    lines = response.splitlines()

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


if __name__ == "__main__":
    print("Project root:", PROJECT_ROOT)

    while True:
        user_input = input("Medhavin > ")

        if user_input.lower() in ["exit", "quit"]:
            break

        error_context = ""
        project_context = list_files()

        # First LLM call
        raw_output = ask_llama(user_input, project_context)

        actions = parse_actions(raw_output)

        if not actions:
            print({"status": "response", "message": raw_output})
            continue

        final_output = ""

        for action, path, content in actions:
            if action == "write_file":
                final_output = write_file(path, content)

            elif action == "read_file":
                final_output = read_file(path)

            elif action == "run_python":
                result = run_python(path)
                final_output = result

        print({
            "status": "completed",
            "output": final_output
        })
        
def run_medhavin(prompt: str):
    error_context = ""
    project_context = list_files()

    raw_output = ask_llama(prompt, project_context)

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
            result = run_python(path)
            final_output = result

    return {
        "status": "completed",
        "output": final_output
    }