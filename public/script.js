const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const clearBtn = document.getElementById('clear-btn');
const loadingIndicator = document.getElementById('loading');

function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    msgDiv.textContent = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return; // Обмеження свободи введення

    addMessage(message, 'user');
    userInput.value = '';
    loadingIndicator.style.display = 'block';

    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Сервер тимчасово недоступний");
        addMessage(data.response, 'bot');
    } catch (error) {
        addMessage(`Виникла помилка: ${error.message}`, 'bot error');
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

clearBtn.addEventListener('click', () => {
    chatBox.innerHTML = '';
    addMessage('Контекст очищено. Готовий до нової збірки!', 'bot');
});

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });