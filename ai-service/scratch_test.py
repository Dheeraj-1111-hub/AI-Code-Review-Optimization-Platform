import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

async def main():
    client = AsyncIOMotorClient("mongodb+srv://ysaidheeraj1111_db_user:tfzZj3FwvBJ3o0Bh@cluster0.fgrqzxc.mongodb.net/")
    db = client.get_database("test")
    
    workspace_id = "6a1546a035dea94e1fc85a01"
    
    snapshot = await db.analyticssnapshots.find_one(
        {"$or": [
            {"workspaceId": ObjectId(workspace_id)},
            {"workspaceId": {"$exists": False}}
        ]},
        sort=[("generatedAt", -1)]
    )
    print("Snapshot:", snapshot)

asyncio.run(main())
