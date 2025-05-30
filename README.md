# Mini Bot Chatbot Project

A multi-user, web-based chatbot application built with Flask, SQLAlchemy, and vanilla JavaScript. Each user has their own secure account and private chat history. The app features a modern UI, night mode, chat management, and a profile dropdown.

---

## Features

- **User Authentication**
  - Sign up with email, username, and password.
  - Secure login/logout.
  - Each user sees only their own chats.

- **Chat Management**
  - Each chat is a separate conversation.
  - Create new chats.
  - Rename chats (persisted in the database).
  - Delete chats (removes from database).
  - View older conversations.
  - Each new user gets a default chat on first login.

- **Chat UI**
  - Sidebar with chat list.
  - Main area for chat messages.
  - Send messages and receive bot responses.
  - Clear chat (clears UI only, not database; persists until "View Older Conversation" is clicked).
  - Responsive and modern design.

- **Profile & Theme**
  - Profile button with username and icon in the header.
  - Profile dropdown with logout option.
  - Night mode toggle (persists during session).

- **Default Welcome Message**
  - When no chat is selected or a chat is empty, a blurred instructional message appears in the center.

---

## Getting Started

### 1. Clone the Repository

```sh
git clone https://github.com/yourusername/chatbot-project-uspb.git
cd chatbot-project-uspb/chatbot
```

### 2. Install Dependencies

```sh
pip install -r requirements.txt
```

### 3. Set Up the Database

- The app uses SQLite by default.
- On first run, the database and tables will be created automatically.
- To migrate existing data, see the "Data Migration" section below.

### 4. Run the App

```sh
python chatbot/app.py
```

Visit [http://localhost:5000](http://localhost:5000) in your browser.

---

## Usage

### Sign Up & Login

- Visit the app and sign up with your email, username, and password.
- After signing up, log in to access your private chat area.

### Chat Features

- **Create New Chat:** Click "New Chat" to start a new conversation.
- **Rename Chat:** Use the ⋮ menu next to a chat to rename it.
- **Delete Chat:** Use the ⋮ menu or "🗑️ Delete Conversation" to remove a chat.
- **Clear Chat:** Click "Clear Chat" to temporarily clear the chat window (messages reappear when you reload or view older conversations).
- **View Older Conversation:** Reloads your chat list from the database.
- **Night Mode:** Toggle night mode for a dark UI.
- **Profile & Logout:** Click your profile button in the header for a dropdown with logout.

---

## Project Structure

```
chatbot/
├── app.py
├── database/
│   └── models.py
├── static/
│   ├── js/
│   │   └── style.js
│   └── style.css
├── templates/
│   ├── index.html
│   ├── login.html
│   └── signup.html
└── requirements.txt
```

---

## Security Notes

- Passwords are hashed using Werkzeug.
- All chat data is private to each user.
- Session management is handled via Flask sessions.

---

## Customization

- You can change the OpenAI API wrapper endpoint in `openai_wrapper_api.py`.
- UI styles can be customized in `static/style.css`.

---

## License

MIT License

---

## Credits

Developed by Sushant 
Inspired by OpenAI and Flask community best practices.