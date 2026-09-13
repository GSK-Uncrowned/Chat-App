import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabaseClient = createClient('https://mflwqmpfqdwscyxkdpfi.supabase.co', "sb_publishable_JVvk1dxs_aY3JydW6N_JfQ_tKcf1_RG");

const output = document.querySelector('.outputSection');
const container = document.querySelector('.cntcPeople');

let activeContact = null;
let activeContactData = null;

let localUserId = localStorage.getItem('local_user_id');
if (!localUserId) {
    localUserId = crypto.randomUUID();
    localStorage.setItem('local_user_id', localUserId);
}

function scrollOutputToBottom() {
    output.scrollTop = output.scrollHeight;
}

function appendOutgoingMessage(text) {
    const div = document.createElement('div');
    div.className = 'outgoing';
    const p = document.createElement('p');
    p.textContent = text;
    div.appendChild(p);
    output.appendChild(div);
    scrollOutputToBottom();
}

function appendIncomingMessage(text) {
    const div = document.createElement('div');
    div.className = 'incoming';
    const p = document.createElement('p');
    p.textContent = text;
    div.appendChild(p);
    output.appendChild(div);
    scrollOutputToBottom();
}

async function loadContacts() {
    container.innerHTML = '';
    const { data: contacts, error } = await supabaseClient
        .from('contacts')
        .select('*')
        .eq('user_id', localUserId); // Only fetch this user's created contacts

    if (error) {
        console.error('Error loading contacts:', error.message);
        return;
    }

    contacts.forEach((contact) => {
        const div = document.createElement('div');
        div.className = 'cntcPerson';
        div.dataset.contactId = contact.id;
        div.dataset.name = contact.name;
        div.dataset.personality = contact.personality || '';

        div.innerHTML = `
            <img src="assets/profile.svg" height="48px" width="48px" class="cntcPersonImg">
            <div class="cntcPersonInfo">
                <h3>${contact.name}</h3>
                <p>${contact.personality ? contact.personality.substring(0, 30) + '...' : 'Custom Character'}</p>
            </div>
        `;
        container.appendChild(div);
    });
}

async function loadMessages(contactId) {
    output.innerHTML = '';
    const { data: messages, error } = await supabaseClient
        .from('chats')
        .select('*')
        .order('created_at', { ascending: true })
        .eq('contact_id', contactId)
        .eq('user_id', localUserId);

    if (error) {
        alert('Error loading messages: ' + error.message);
        return;
    }

    messages.forEach((msg) => {
        if (msg.is_bot) {
            appendIncomingMessage(msg.text);
        } else {
            appendOutgoingMessage(msg.text);
        }
    });

    scrollOutputToBottom();
}

async function fetchAIReply(userMessage) {
    if (!activeContactData) return;

    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'incoming';
    loadingDiv.innerHTML = '<p><i>Typing...</i></p>';
    output.appendChild(loadingDiv);
    scrollOutputToBottom();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'openrouter/free',
                messages: [
                    {
                        role: 'system',
                        content: `You are roleplaying as ${activeContactData.name}.\nPersonality: ${activeContactData.personality || 'Engaging character'}. Never output internal safety tags or metadata.`
                    },
                    { role: 'user', content: userMessage }
                ]
            })
        });

        const data = await response.json();
        if (output.contains(loadingDiv)) output.removeChild(loadingDiv);

        const aiReply = data.choices?.[0]?.message?.content || "No response received.";

        appendIncomingMessage(aiReply);

        await supabaseClient.from('chats').insert([{
            text: aiReply,
            contact_id: activeContact,
            is_bot: true,
            user_id: localUserId
        }]);

    } catch (err) {
        if (output.contains(loadingDiv)) output.removeChild(loadingDiv);
        console.error('AI Error:', err);
    }
}

async function sendMessage() {
    if (!activeContact) {
        alert('Please select a character first.');
        return;
    }
    const input = document.querySelector('.inputSection input');
    const message = input.value.trim();
    if (message === '') return;

    input.value = '';
    appendOutgoingMessage(message);

    const { error: insertError } = await supabaseClient
        .from('chats')
        .insert([{
            text: message,
            contact_id: activeContact,
            is_bot: false,
            user_id: localUserId
        }]);

    if (insertError) {
        alert('Error saving message: ' + insertError.message);
        return;
    }

    fetchAIReply(message);
}

document.querySelector('.inputSection button').addEventListener('click', sendMessage);
document.querySelector('.inputSection input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

async function createCharacter() {
    const nameInput = document.querySelector('.charNameInput');
    const personalityInput = document.querySelector('.charPersonalityInput');
    const greetingInput = document.querySelector('.charGreetingInput');

    const name = nameInput.value.trim();
    const personality = personalityInput.value.trim();
    const greeting = greetingInput.value.trim();

    if (name === '') {
        alert('Character name is required.');
        return;
    }

    nameInput.value = '';
    personalityInput.value = '';
    greetingInput.value = '';
    document.querySelector('.hider').classList.remove('show');

    const { data, error } = await supabaseClient
        .from('contacts')
        .insert([{
            name: name,
            personality: personality,
            greeting: greeting,
            user_id: localUserId // Stamp contact with local user ID
        }])
        .select();

    if (error) {
        alert('Error creating character: ' + error.message);
        return;
    }

    const newChar = data[0];

    if (greeting !== '') {
        await supabaseClient.from('chats').insert([{
            text: greeting,
            contact_id: newChar.id,
            is_bot: true,
            user_id: localUserId
        }]);
    }

    loadContacts();
}

document.querySelector('.createCharBtn').addEventListener('click', createCharacter);

document.querySelector('.cntcPeople').addEventListener('click', (e) => {
    const contact = e.target.closest('.cntcPerson');
    if (!contact) return;

    document.querySelectorAll('.cntcPerson').forEach((person) => {
        person.classList.remove('active');
    });

    contact.classList.add('active');
    activeContact = contact.dataset.contactId;
    activeContactData = {
        name: contact.dataset.name,
        personality: contact.dataset.personality
    };

    document.querySelector('.nameOutput').textContent = contact.dataset.name;
    loadMessages(activeContact);

    document.body.classList.add('chat-active');
});

document.querySelector('.newChat').addEventListener('click', () => {
    document.querySelector('.hider').classList.toggle('show');
});
document.querySelector('.closeButton').addEventListener('click', () => {
    document.querySelector('.hider').classList.remove('show');
});

document.querySelector('.actionInfo').addEventListener('click', () => {
    document.querySelector('.info').classList.toggle('show');
});

const esc = document.querySelectorAll('.esc');
const modal = document.querySelector('.modal');
const modal1 = document.querySelector('.signUp');
const modal2 = document.querySelector('.logIn');

document.querySelector('.mrKhen').addEventListener('click', () => {
    modal.classList.toggle('hide');
});

esc.forEach((element) => {
    element.addEventListener('click', () => {
        modal.classList.toggle('hide');
    });
});

document.querySelectorAll('.link').forEach((link) => {
    link.addEventListener('click', () => {
        modal1.classList.toggle('hide');
        modal2.classList.toggle('hide');
    });
});

document.querySelector('.chatHeaderLeft').router?.() || document.querySelector('.chatHeaderLeft').addEventListener('click', () => {
    document.body.classList.remove('chat-active');
});

loadContacts();