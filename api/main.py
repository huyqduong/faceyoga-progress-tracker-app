from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import json
import os
import base64
from datetime import datetime
import uuid
from dataclasses import dataclass, asdict

app = FastAPI(title="Face Yoga API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (in production, use a proper database)
users = {}
exercises = {}
progress = {}
routines = {}

# Data models
@dataclass
class User:
    id: str
    email: str
    name: str
    streak: int = 0
    exercises_done: int = 0
    practice_time: float = 0
    created_at: str = datetime.now().isoformat()

@dataclass
class Exercise:
    id: str
    title: str
    duration: str
    target_area: str
    description: str
    image_url: str
    instructions: List[str]

@dataclass
class Progress:
    id: str
    user_id: str
    image_url: str
    notes: str
    date: str = datetime.now().isoformat()

@dataclass
class Routine:
    id: str
    user_id: str
    exercises: List[str]
    completed: bool = False
    date: str = datetime.now().isoformat()

# User endpoints
@app.post("/users/", response_model=dict)
async def create_user(email: str, name: str):
    user_id = str(uuid.uuid4())
    user = User(id=user_id, email=email, name=name)
    users[user_id] = asdict(user)
    return users[user_id]

@app.get("/users/{user_id}")
async def get_user(user_id: str):
    if user_id not in users:
        raise HTTPException(status_code=404, detail="User not found")
    return users[user_id]

# Exercise endpoints
@app.post("/exercises/")
async def create_exercise(
    title: str,
    duration: str,
    target_area: str,
    description: str,
    image_url: str,
    instructions: List[str]
):
    exercise_id = str(uuid.uuid4())
    exercise = Exercise(
        id=exercise_id,
        title=title,
        duration=duration,
        target_area=target_area,
        description=description,
        image_url=image_url,
        instructions=instructions
    )
    exercises[exercise_id] = asdict(exercise)
    return exercises[exercise_id]

@app.get("/exercises/")
async def get_exercises():
    return list(exercises.values())

@app.get("/exercises/{exercise_id}")
async def get_exercise(exercise_id: str):
    if exercise_id not in exercises:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return exercises[exercise_id]

# Progress endpoints
@app.post("/progress/")
async def create_progress(user_id: str, image_url: str, notes: str):
    if user_id not in users:
        raise HTTPException(status_code=404, detail="User not found")
    
    progress_id = str(uuid.uuid4())
    progress_entry = Progress(
        id=progress_id,
        user_id=user_id,
        image_url=image_url,
        notes=notes
    )
    progress[progress_id] = asdict(progress_entry)
    return progress[progress_id]

@app.get("/progress/{user_id}")
async def get_user_progress(user_id: str):
    if user_id not in users:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_progress = [p for p in progress.values() if p["user_id"] == user_id]
    return user_progress

# Routine endpoints
@app.post("/routines/")
async def create_routine(user_id: str, exercise_ids: List[str]):
    if user_id not in users:
        raise HTTPException(status_code=404, detail="User not found")
    
    for exercise_id in exercise_ids:
        if exercise_id not in exercises:
            raise HTTPException(status_code=404, detail=f"Exercise {exercise_id} not found")
    
    routine_id = str(uuid.uuid4())
    routine = Routine(
        id=routine_id,
        user_id=user_id,
        exercises=exercise_ids
    )
    routines[routine_id] = asdict(routine)
    return routines[routine_id]

@app.get("/routines/{user_id}")
async def get_user_routines(user_id: str):
    if user_id not in users:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_routines = [r for r in routines.values() if r["user_id"] == user_id]
    return user_routines

@app.put("/routines/{routine_id}/complete")
async def complete_routine(routine_id: str):
    if routine_id not in routines:
        raise HTTPException(status_code=404, detail="Routine not found")
    
    routines[routine_id]["completed"] = True
    user_id = routines[routine_id]["user_id"]
    
    # Update user stats
    users[user_id]["exercises_done"] += len(routines[routine_id]["exercises"])
    users[user_id]["streak"] += 1
    
    return routines[routine_id]

# AI Coaching endpoint
@app.post("/ai/chat")
async def chat_with_ai(user_id: str, message: str):
    if user_id not in users:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Simulate AI response (in production, integrate with OpenAI)
    responses = {
        "exercise": "To perform this exercise, start by relaxing your facial muscles...",
        "progress": "Based on your progress, I recommend focusing on...",
        "routine": "Here's a personalized routine for your goals..."
    }
    
    # Simple keyword matching
    for key, response in responses.items():
        if key in message.lower():
            return {"response": response}
    
    return {"response": "How can I help you with your face yoga practice today?"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)