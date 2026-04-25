from firebase_config import db

docs = db.collection("users").stream()

for doc in docs:
    print(doc.id, doc.to_dict())