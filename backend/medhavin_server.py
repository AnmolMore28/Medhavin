from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from backend.medhavin_agent import run_medhavin
import os
import sounddevice as sd
import numpy as np
from scipy.io.wavfile import write
import whisper
import uuid
# -------------------------
# Configuration
# -------------------------

BASE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "workspace")
os.makedirs(BASE_DIR, exist_ok=True)

app = FastAPI()
whisper_model = whisper.load_model("base")
SAMPLE_RATE = 16000
RECORD_SECONDS = 5
# -------------------------
# Enable CORS
# -------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Request Schema
# -------------------------

class PromptRequest(BaseModel):
    prompt: str

# -------------------------
# Main Endpoint
# -------------------------

@app.post("/ask")
def ask(request: PromptRequest):
    try:
        result = run_medhavin(request.prompt)

        return {
            "status": "success",
            "data": result
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

# -------------------------
# Health Check (optional)
# -------------------------
@app.post("/record")
def record_and_process():
    try:
        print("Recording...")

        recording = sd.rec(
            int(RECORD_SECONDS * SAMPLE_RATE),
            samplerate=SAMPLE_RATE,
            channels=1,
            dtype="int16"
        )
        sd.wait()

        filename = f"temp_{uuid.uuid4().hex}.wav"
        filepath = os.path.join(BASE_DIR, filename)

        write(filepath, SAMPLE_RATE, recording)

        print("Transcribing...")
        result = whisper_model.transcribe(filepath)

        transcript = result["text"]

        os.remove(filepath)

        print("Transcript:", transcript)

        agent_result = run_medhavin(transcript)

        return {
            "status": "success",
            "transcript": transcript,
            "agent": agent_result
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
@app.get("/")
def root():
    return {"status": "Medhavin backend running"}