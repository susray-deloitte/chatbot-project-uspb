from flask import Flask, request, jsonify, render_template
import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database.models import Base, Conversation, Message

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
    result = [
        {"id": c.id, "title": c.title, "timestamp": c.timestamp.isoformat()}
        for c in conversations
    ]
    session.close()
    return jsonify(result)

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

@app.route("/api/conversation/<int:conv_id>/messages", methods=["GET"])
def get_conversation_messages(conv_id):
    session = Session()
    messages = (
        session.query(Message)
        .filter_by(conversation_id=conv_id)
        .order_by(Message.timestamp)
        .all()
    )
    result = [
        {"id": m.id, "role": m.role, "text": m.text, "timestamp": m.timestamp.isoformat()}
        for m in messages
    ]
    session.close()
    return jsonify(result)

@app.route("/api/conversation", methods=["POST"])
def create_conversation():
    session = Session()
    data = request.get_json()
    title = data.get("title", "New Chat")
    conversation = Conversation(title=title)
    session.add(conversation)
    session.commit()
    conv_id = conversation.id
    session.close()
    return jsonify({"id": conv_id, "title": title})

@app.route("/api/conversation/<int:conv_id>/message", methods=["POST"])
def send_message(conv_id):
    session = Session()
    data = request.get_json()
    user_text = data.get("text", "")
    if not user_text:
        session.close()
        return jsonify({"error": "No message provided"}), 400

    # Store user message
    user_msg = Message(conversation_id=conv_id, role="user", text=user_text)
    session.add(user_msg)
    session.commit()

    # Get bot response
    bot_response = get_chatbot_response(user_text)
    bot_msg = Message(conversation_id=conv_id, role="bot", text=bot_response)
    session.add(bot_msg)
    session.commit()

    session.close()
    return jsonify({"bot_response": bot_response})

@app.route("/api/conversation/<int:conv_id>/rename", methods=["PUT"])
def rename_conversation(conv_id):
    session = Session()
    data = request.get_json()
    new_title = data.get("title", "").strip()
    conversation = session.query(Conversation).filter_by(id=conv_id).first()
    if conversation and new_title:
        conversation.title = new_title
        session.commit()
        session.close()
        return jsonify({"success": True})
    session.close()
    return jsonify({"success": False}), 400

if __name__ == "__main__":
    app.run(debug=True)