// Simple chat UI logic

let chats = [];
let currentChatIndex = 0;

function renderChatList() {
  const chatList = document.getElementById('chat-list');
  chatList.innerHTML = '';
  conversations.forEach(conv => {
    const li = document.createElement('li');
    li.className = 'chat-list-item';
    if (conv.id === currentConvId) li.classList.add('active');

    // Chat title
    const titleSpan = document.createElement('span');
    titleSpan.textContent = conv.title || `Chat ${conv.id}`;
    titleSpan.onclick = () => selectConversation(conv.id);
    li.appendChild(titleSpan);

    // Three dots menu
    const menuWrapper = document.createElement('div');
    menuWrapper.className = 'menu-wrapper';

    const menuBtn = document.createElement('button');
    menuBtn.className = 'menu-btn';
    menuBtn.innerHTML = '&#8942;'; // vertical ellipsis

    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown-menu';

    // Rename option
    const renameBtn = document.createElement('button');
    renameBtn.textContent = 'Rename';
    renameBtn.className = 'rename-btn';
    renameBtn.onclick = (e) => {
      e.stopPropagation();
      dropdown.style.display = 'none';
      const newTitle = prompt('Enter new chat name:', conv.title || `Chat ${conv.id}`);
      if (newTitle !== null && newTitle.trim() !== '') {
        // Update in DB
        fetch(`/api/conversation/${conv.id}/rename`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: newTitle.trim() })
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              conv.title = newTitle.trim();
              renderChatList();
            } else {
              alert('Failed to rename chat.');
            }
          });
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
        fetch(`/api/conversation/${conv.id}`, { method: 'DELETE' })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              // Remove from conversations array
              const idx = conversations.findIndex(c => c.id === conv.id);
              if (idx !== -1) conversations.splice(idx, 1);
              // Select next available conversation
              if (conversations.length > 0) {
                selectConversation(conversations[0].id);
              } else {
                document.getElementById('chat-history').innerHTML = '';
                currentConvId = null;
                renderChatList();
              }
            } else {
              alert('Failed to delete chat.');
            }
          });
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
  let conversations = [];
  let currentConvId = null;
  const clearedConversations = new Set();

  // Load all conversations for sidebar
  function loadConversations() {
    fetch('/api/conversations')
      .then(res => res.json())
      .then(data => {
        conversations = data;
        renderChatList();
        if (conversations.length > 0) {
          selectConversation(conversations[0].id);
        }
      });
  }

  // Render sidebar chat list
  function renderChatList() {
    const chatList = document.getElementById('chat-list');
    chatList.innerHTML = '';
    conversations.forEach(conv => {
      const li = document.createElement('li');
      li.className = 'chat-list-item';
      if (conv.id === currentConvId) li.classList.add('active');

      // Chat title
      const titleSpan = document.createElement('span');
      titleSpan.textContent = conv.title || `Chat ${conv.id}`;
      titleSpan.onclick = () => selectConversation(conv.id);
      li.appendChild(titleSpan);

      // Three dots menu
      const menuWrapper = document.createElement('div');
      menuWrapper.className = 'menu-wrapper';

      const menuBtn = document.createElement('button');
      menuBtn.className = 'menu-btn';
      menuBtn.innerHTML = '&#8942;'; // vertical ellipsis

      const dropdown = document.createElement('div');
      dropdown.className = 'dropdown-menu';

      // Rename option
      const renameBtn = document.createElement('button');
      renameBtn.textContent = 'Rename';
      renameBtn.className = 'rename-btn';
      renameBtn.onclick = (e) => {
        e.stopPropagation();
        dropdown.style.display = 'none';
        const newTitle = prompt('Enter new chat name:', conv.title || `Chat ${conv.id}`);
        if (newTitle !== null && newTitle.trim() !== '') {
          // Update in DB
          fetch(`/api/conversation/${conv.id}/rename`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newTitle.trim() })
          })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                conv.title = newTitle.trim();
                renderChatList();
              } else {
                alert('Failed to rename chat.');
              }
            });
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
          fetch(`/api/conversation/${conv.id}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                // Remove from conversations array
                const idx = conversations.findIndex(c => c.id === conv.id);
                if (idx !== -1) conversations.splice(idx, 1);
                // Select next available conversation
                if (conversations.length > 0) {
                  selectConversation(conversations[0].id);
                } else {
                  document.getElementById('chat-history').innerHTML = '';
                  currentConvId = null;
                  renderChatList();
                }
              } else {
                alert('Failed to delete chat.');
              }
            });
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

      menuWrapper.appendChild(menuBtn);
      menuWrapper.appendChild(dropdown);
      li.appendChild(menuWrapper);

      chatList.appendChild(li);
    });
  }

  // Load and render messages for a conversation
  function selectConversation(convId) {
    currentConvId = convId;
    renderChatList();
    if (clearedConversations.has(convId)) {
      renderChatHistory([]); // Show empty if cleared
      return;
    }
    fetch(`/api/conversation/${convId}/messages`)
      .then(res => res.json())
      .then(messages => renderChatHistory(messages));
  }

  // Render chat history
  function renderChatHistory(messages = []) {
    const chatHistory = document.getElementById('chat-history');
    chatHistory.innerHTML = '';
    messages.forEach(msg => {
      const div = document.createElement('div');
      div.className = 'message ' + msg.role;
      div.textContent = msg.text;
      chatHistory.appendChild(div);
    });
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  // Send message
  document.getElementById('chat-form').onsubmit = function(e) {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text || !currentConvId) return;
    input.value = '';
    // Add user message immediately
    renderChatHistory([
      ...Array.from(document.querySelectorAll('.chat-history .message')).map(div => ({
        role: div.classList.contains('user') ? 'user' : 'bot',
        text: div.textContent
      })),
      { role: 'user', text }
    ]);
    fetch(`/api/conversation/${currentConvId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    })
      .then(res => res.json())
      .then(data => {
        // Reload messages to include bot response
        selectConversation(currentConvId);
      });
  };

  // New chat
  document.getElementById('new-chat-btn').onclick = function () {
    fetch('/api/conversation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Chat' })
    })
      .then(res => res.json())
      .then(conv => {
        conversations.unshift(conv);
        renderChatList();
        selectConversation(conv.id);
      });
  };

  // View older conversations
  document.getElementById('view-older-btn').onclick = function () {
    clearedConversations.clear();
    loadConversations();
  };

  // Clear chat (just clears UI, not DB)
  document.getElementById('clear-chat-btn').onclick = function () {
    if (!currentConvId) return;
    clearedConversations.add(currentConvId);
    renderChatHistory([]);
  };

  // Delete conversation button
  document.getElementById('delete-conv-btn').onclick = function () {
    if (!currentConvId) return;
    if (!confirm('Are you sure you want to delete this conversation?')) return;
    fetch(`/api/conversation/${currentConvId}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Remove from conversations array
          const idx = conversations.findIndex(c => c.id === currentConvId);
          if (idx !== -1) conversations.splice(idx, 1);
          // Select next available conversation
          if (conversations.length > 0) {
            selectConversation(conversations[0].id);
          } else {
            document.getElementById('chat-history').innerHTML = '';
            currentConvId = null;
            renderChatList();
          }
        } else {
          alert('Failed to delete conversation.');
        }
      });
  };

  // Toggle theme
  const themeBtn = document.getElementById('toggle-theme-btn');
  themeBtn.onclick = function () {
    document.body.classList.toggle('night-mode');
    if (document.body.classList.contains('night-mode')) {
      themeBtn.textContent = '☀️ Day Mode';
    } else {
      themeBtn.textContent = '🌙 Night Mode';
    }
  };

  // Logout button
  document.getElementById('logout-btn').onclick = function () {
    window.location.href = '/logout';
  };

  // Initial load
  loadConversations();
});