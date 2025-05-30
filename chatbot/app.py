from flask import Flask, request, jsonify, render_template, session, redirect, url_for
import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from werkzeug.security import generate_password_hash, check_password_hash
from database.models import Base, Conversation, Message, User

# Ensure the template directory is in the path for import
sys.path.append(os.path.join(os.path.dirname(__file__), "templates"))
from openai_wrapper_api import get_chatbot_response

app = Flask(__name__, template_folder="templates", static_folder="static")

# Set up SQLite database
engine = create_engine('sqlite:///chatbot.db')
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)

app.secret_key = "ajhgyt321%#$hj23"

@app.route("/")
def index():
    if "user_id" not in session:
        return redirect(url_for("login"))
    return render_template("index.html")

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    prompt = data.get("prompt", "")
    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400
    answer = get_chatbot_response(prompt)
    
    # Store in DB
    session_db = Session()
    conversation = Conversation(user_message=prompt, bot_response=answer)
    session_db.add(conversation)
    session_db.commit()
    session_db.close()
    
    return jsonify({"answer": answer})

@app.route("/api/conversations", methods=["GET"])
def get_conversations():
    if "user_id" not in session:
        return jsonify([])  # or return 401
    session_db = Session()
    conversations = session_db.query(Conversation).filter_by(user_id=session["user_id"]).order_by(Conversation.timestamp.desc()).all()
    result = [
        {"id": c.id, "title": c.title, "timestamp": c.timestamp.isoformat()}
        for c in conversations
    ]
    session_db.close()
    return jsonify(result)

@app.route("/api/conversation/<int:conv_id>", methods=["DELETE"])
def delete_conversation(conv_id):
    session_db = Session()
    conversation = session_db.query(Conversation).filter_by(id=conv_id).first()
    if conversation:
        session_db.delete(conversation)
        session_db.commit()
        session_db.close()
        return jsonify({"success": True})
    session_db.close()
    return jsonify({"success": False, "error": "Conversation not found"}), 404

@app.route("/api/conversation/<int:conv_id>/messages", methods=["GET"])
def get_conversation_messages(conv_id):
    session_db = Session()
    messages = (
        session_db.query(Message)
        .filter_by(conversation_id=conv_id)
        .order_by(Message.timestamp)
        .all()
    )
    result = [
        {"id": m.id, "role": m.role, "text": m.text, "timestamp": m.timestamp.isoformat()}
        for m in messages
    ]
    session_db.close()
    return jsonify(result)

@app.route("/api/conversation", methods=["POST"])
def create_conversation():
    if "user_id" not in session:
        return jsonify({"error": "Not logged in"}), 401
    session_db = Session()
    data = request.get_json()
    title = data.get("title", "New Chat")
    conversation = Conversation(title=title, user_id=session["user_id"])
    session_db.add(conversation)
    session_db.commit()
    conv_id = conversation.id
    session_db.close()
    return jsonify({"id": conv_id, "title": title})

@app.route("/api/conversation/<int:conv_id>/message", methods=["POST"])
def send_message(conv_id):
    session_db = Session()
    data = request.get_json()
    user_text = data.get("text", "")
    if not user_text:
        session_db.close()
        return jsonify({"error": "No message provided"}), 400

    # Store user message
    user_msg = Message(conversation_id=conv_id, role="user", text=user_text)
    session_db.add(user_msg)
    session_db.commit()

    # Get bot response
    bot_response = get_chatbot_response(user_text)
    bot_msg = Message(conversation_id=conv_id, role="bot", text=bot_response)
    session_db.add(bot_msg)
    session_db.commit()

    session_db.close()
    return jsonify({"bot_response": bot_response})

@app.route("/api/conversation/<int:conv_id>/rename", methods=["PUT"])
def rename_conversation(conv_id):
    if "user_id" not in session:
        return jsonify({"success": False}), 401
    session_db = Session()
    conversation = session_db.query(Conversation).filter_by(id=conv_id, user_id=session["user_id"]).first()
    new_title = data.get("title", "").strip()
    if conversation and new_title:
        conversation.title = new_title
        session_db.commit()
        session_db.close()
        return jsonify({"success": True})
    session_db.close()
    return jsonify({"success": False}), 400

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        data = request.form
        username = data.get("username")
        password = data.get("password")
        session_db = Session()
        user = session_db.query(User).filter_by(username=username).first()
        session_db.close()
        if user and check_password_hash(user.password, password):
            session["user_id"] = user.id
            return redirect(url_for("index"))
        return render_template("login.html", error="Invalid credentials")
    return render_template("login.html")

@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        data = request.form
        email = data.get("email")
        username = data.get("username")
        password = data.get("password")
        session_db = Session()
        if session_db.query(User).filter((User.username == username) | (User.email == email)).first():
            session_db.close()
            return render_template("signup.html", error="Username or email already exists")
        user = User(email=email, username=username, password=generate_password_hash(password))
        session_db.add(user)
        session_db.commit()
        session_db.close()
        return redirect(url_for("login"))
    return render_template("signup.html")

@app.route("/logout")
def logout():
    session.pop("user_id", None)
    return redirect(url_for("login"))

if __name__ == "__main__":
    app.run(debug=True)