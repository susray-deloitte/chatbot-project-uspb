// Simple chat UI logic

let chats = [];
let currentChatIndex = 0;

function renderChatList() {
  const chatList = document.getElementById('chat-list');
  chatList.innerHTML = '';
  chats.forEach((chat, idx) => {
    const li = document.createElement('li');
    li.className = 'chat-list-item';
    if (idx === currentChatIndex) li.classList.add('active');

    // Chat title
    const titleSpan = document.createElement('span');
    titleSpan.textContent = chat.title || `Chat ${idx + 1}`;
    titleSpan.onclick = () => {
      currentChatIndex = idx;
      renderChatList();
      renderChatHistory();
    };
    li.appendChild(titleSpan);

    // Three dots menu
    const menuWrapper = document.createElement('div');
    menuWrapper.className = 'menu-wrapper';

    const menuBtn = document.createElement('button');
    menuBtn.className = 'menu-btn';
    menuBtn.innerHTML = '&#8942;'; // vertical ellipsis

    // Dropdown menu
    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown-menu';

    // Rename option
    const renameBtn = document.createElement('button');
    renameBtn.textContent = 'Rename';
    renameBtn.className = 'rename-btn';
    renameBtn.onclick = (e) => {
      e.stopPropagation();
      dropdown.style.display = 'none';
      const newTitle = prompt('Enter new chat name:', chat.title || `Chat ${idx + 1}`);
      if (newTitle !== null && newTitle.trim() !== '') {
        chat.title = newTitle.trim();
        renderChatList();
      }
    };
    dropdown.appendChild(renameBtn);

    // Delete option
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      dropdown.style.display = 'none';
      if (confirm('Are you sure you want to delete this chat?')) {
        chats.splice(idx, 1);
        if (currentChatIndex >= chats.length) currentChatIndex = chats.length - 1;
        if (chats.length === 0) {
          chats.push({ title: '', messages: [] });
          currentChatIndex = 0;
        }
        renderChatList();
        renderChatHistory();
      }
    };
    dropdown.appendChild(deleteBtn);

    menuBtn.onclick = (e) => {
      e.stopPropagation();
      // Hide other open menus
      document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if (menu !== dropdown) menu.style.display = 'none';
      });
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    };

    // Hide menu when clicking outside
    document.addEventListener('click', function hideMenu(e) {
      dropdown.style.display = 'none';
      document.removeEventListener('click', hideMenu);
    });

    menuWrapper.appendChild(menuBtn);
    menuWrapper.appendChild(dropdown);
    li.appendChild(menuWrapper);

    chatList.appendChild(li);
  });
}

function renderChatHistory() {
  const chatHistory = document.getElementById('chat-history');
  chatHistory.innerHTML = '';
  const messages = chats[currentChatIndex]?.messages || [];
  messages.forEach(msg => {
    const div = document.createElement('div');
    div.className = 'message ' + msg.role;
    div.textContent = msg.text;
    chatHistory.appendChild(div);
  });
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function addMessage(role, text) {
  chats[currentChatIndex].messages.push({ role, text });
  renderChatHistory();
}

function clearChat() {
  chats[currentChatIndex].messages = [];
  renderChatHistory();
}

function newChat() {
  chats.push({ title: '', messages: [] });
  currentChatIndex = chats.length - 1;
  renderChatList();
  renderChatHistory();
}

document.addEventListener('DOMContentLoaded', function () {
  // Initialize with one chat if empty
  if (chats.length === 0) {
    chats.push({ title: '', messages: [] });
  }
  renderChatList();
  renderChatHistory();

  document.getElementById('chat-form').onsubmit = function(e) {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;
    addMessage('user', text);
    input.value = '';

    // Call Flask API
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: text })
    })
    .then(res => res.json())
    .then(data => {
      if (data.answer) {
        addMessage('bot', data.answer);
      } else {
        addMessage('bot', 'Sorry, there was an error.');
      }
    })
    .catch(() => {
      addMessage('bot', 'Sorry, there was an error connecting to the server.');
    });
  };

  document.getElementById('clear-chat-btn').onclick = clearChat;
  document.getElementById('new-chat-btn').onclick = newChat;

  // Theme toggle
  const themeBtn = document.getElementById('toggle-theme-btn');
  themeBtn.onclick = function () {
    document.body.classList.toggle('night-mode');
    if (document.body.classList.contains('night-mode')) {
      themeBtn.textContent = '☀️ Day Mode';
    } else {
      themeBtn.textContent = '🌙 Night Mode';
    }
  };
});