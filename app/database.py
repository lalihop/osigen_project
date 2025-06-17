from motor.motor_asyncio import AsyncIOMotorClient
import os

# MongoDB 연결 URI 설정 (예: localhost 기준)
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URI)
db = client.osigen
admin_collection = db.admin
task_collection = db.analyze_tasks
ai_collection = db.ai_tasks