from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from bson import ObjectId

from database import tasks_collection, users_collection
from models import UserCreate, UserLogin

from auth import (
    hash_password,
    verify_password,
    create_access_token,
    verify_token
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TaskCreate(BaseModel):
    title: str
    assigned_to: str | None = None


def get_current_user(
    payload=Depends(verify_token)
):
    return payload


@app.post("/register")
def register(user: UserCreate):

    users_collection.insert_one(
        {
            "username": user.username,
            "password": hash_password(user.password)
        }
    )

    return {
        "message": "User created"
    }


@app.post("/login")
def login(user: UserLogin):

    print("Username entered:", user.username)
    print("Password entered:", user.password)

    db_user = users_collection.find_one(
        {"username": user.username}
    )

    print("DB User:", db_user)

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    print(
        "Password Match:",
        verify_password(
            user.password,
            db_user["password"]
        )
    )

    if not verify_password(
        user.password,
        db_user["password"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Wrong password"
        )

    token = create_access_token(
        {"sub": user.username}
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }

@app.get("/me")
def me(
    current_user=Depends(get_current_user)
):
    return current_user


@app.get("/tasks")
def get_tasks(
    current_user=Depends(get_current_user)
):

    tasks = []

    cursor = tasks_collection.find(
        {
            "$or": [
                {
                    "owner": current_user["sub"]
                },
                {
                    "assigned_to": current_user["sub"]
                }
            ]
        }
    )

    for task in cursor:
        tasks.append(
            {
                "id": str(task["_id"]),
                "title": task["title"],
                "completed": task["completed"],
                "assigned_to": task.get("assigned_to")
            }
        )

    return tasks


@app.post("/tasks")
def create_task(
    task: TaskCreate,
    current_user=Depends(get_current_user)
):

    new_task = {
        "title": task.title,
        "completed": False,
        "owner": current_user["sub"],
        "assigned_to": task.assigned_to
        if task.assigned_to
        else current_user["sub"]
    }

    tasks_collection.insert_one(new_task)

    return {
        "message": "Task created"
    }


@app.put("/tasks/{task_id}")
def complete_task(
    task_id: str,
    current_user=Depends(get_current_user)
):

    result = tasks_collection.update_one(
        {
            "_id": ObjectId(task_id),
            "owner": current_user["sub"]
        },
        {
            "$set": {
                "completed": True
            }
        }
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    return {
        "message": "Task completed"
    }


@app.delete("/tasks/{task_id}")
def delete_task(
    task_id: str,
    current_user=Depends(get_current_user)
):

    result = tasks_collection.delete_one(
        {
            "_id": ObjectId(task_id),
            "owner": current_user["sub"]
        }
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    return {
        "message": "Task deleted"
    }
@app.get("/users")
def get_users(
    current_user=Depends(get_current_user)
):
    users = []

    for user in users_collection.find(
        {},
        {"_id": 0, "username": 1}
    ):
        users.append(user["username"])

    return users