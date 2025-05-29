from flask import Flask, request, jsonify, render_template
import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database.models import Base, Conversation

# Ensure the template directory is in the path for import
sys.path.append(os.path.join(os.path.dirname(__file__), "templates"))
from openai_wrapper_api import get_chatbot_response

app = Flask(__name__, template_folder="templates", static_folder="static")

# Set up SQLite database
engine = create_engine('sqlite:///chatbot.db')
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    prompt = data.get("prompt", "")
    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400
    answer = get_chatbot_response(prompt)
    
    # Store in DB
    session = Session()
    conversation = Conversation(user_message=prompt, bot_response=answer)
    session.add(conversation)
    session.commit()
    session.close()
    
    return jsonify({"answer": answer})

@app.route("/api/conversations", methods=["GET"])
def get_conversations():
    session = Session()
    conversations = session.query(Conversation).order_by(Conversation.timestamp.desc()).all()
    session.close()
    return jsonify([
        {
            "id": c.id,
            "user_message": c.user_message,
            "bot_response": c.bot_response,
            "timestamp": c.timestamp.isoformat()
        } for c in conversations
    ])

@app.route("/api/conversation/<int:conv_id>", methods=["DELETE"])
def delete_conversation(conv_id):
    session = Session()
    conversation = session.query(Conversation).filter_by(id=conv_id).first()
    if conversation:
        session.delete(conversation)
        session.commit()
        session.close()
        return jsonify({"success": True})
    session.close()
    return jsonify({"success": False, "error": "Conversation not found"}), 404

if __name__ == "__main__":
    app.run(debug=True)