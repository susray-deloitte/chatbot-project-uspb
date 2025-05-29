from flask import Flask, request, jsonify, render_template
import sys
import os

# Ensure the template directory is in the path for import
sys.path.append(os.path.join(os.path.dirname(__file__), "templates"))
from openai_wrapper_api import get_chatbot_response

app = Flask(__name__, template_folder="templates", static_folder="static")

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
    return jsonify({"answer": answer})

if __name__ == "__main__":
    app.run(debug=True)