import os
from pymongo import MongoClient

MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb://mongodb:27017"
)

client = MongoClient(MONGO_URI)

db = client["taskflow"]

tasks_collection = db["tasks"]
users_collection = db["users"]