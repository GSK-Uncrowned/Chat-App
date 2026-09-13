import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabaseClient = createClient('https://mflwqmpfqdwscyxkdpfi.supabase.co', "sb_publishable_JVvk1dxs_aY3JydW6N_JfQ_tKcf1_RG");

const output = document.querySelector('.outputSection');
const container = document.querySelector('.cntcPeople');

let activeContact = null;
let activeContactData = null;

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

async function loadMessages(contactId) {
    output.innerHTML = '';
    const { data: messages, error } = await supabaseClient
        .from('chats')
        .select('*')
        .order('created_at', { ascending: true })
        .eq('contact_id', contactId);

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
                model: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
                messages: [
                    {
                        role: 'system',
                        content: `You are roleplaying as ${activeContactData.name}.\nPersonality: ${activeContactData.personality || 'Engaging character'}.`
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
            is_bot: true
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
            is_bot: false
        }]);

    if (insertError) {
        alert('Error saving message: ' + insertError.message);
        return;
    }

    fetchAIReply(message);
}

document.querySelector('.inputSection input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
});

document.querySelector('.likee').addEventListener('click', () => {
    const message = "👍";
    appendOutgoingMessage(message);
    fetchAIReply(message);
});

async function loadContacts() {
    container.innerHTML = '';
    const { data, error } = await supabaseClient
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        alert('Error loading contacts: ' + error.message);
        return;
    }

    data.forEach((contact) => {
        const tatay = document.createElement('div');
        tatay.className = "cntcPerson";
        tatay.dataset.contactId = contact.id;
        tatay.dataset.name = contact.name;
        tatay.dataset.personality = contact.personality || '';

        tatay.innerHTML = `
            <img src="assets/profile.svg" class="cntcPersonImg">
            <div class="cntcPersonInfo">
                <h1 class="cntcPersonName">${contact.name}</h1>
                <p>${contact.personality ? contact.personality.substring(0, 25) + '...' : 'Start roleplaying'}</p>
            </div>
        `;
        container.appendChild(tatay);
    });
}
loadContacts();

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
            greeting: greeting
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
            is_bot: true
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