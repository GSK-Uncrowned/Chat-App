import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabaseClient = createClient('https://mflwqmpfqdwscyxkdpfi.supabase.co', "sb_publishable_JVvk1dxs_aY3JydW6N_JfQ_tKcf1_RG");


const output = document.querySelector('.outputSection');
const container = document.querySelector('.cntcPeople');

let activeContact = null;

function scrollOutputToBottom() {
    output.scrollTop = output.scrollHeight;
}

/*====================================================================
   Load messages from Supabase and display them in the output section 
  ====================================================================*/
async function loadMessages (contactId) {
    output.innerHTML = '';
    const {data: messages, error} = await supabaseClient
    .from('chats')
    .select('*')
    .order('created_at', { ascending: true })
    .eq('contact_id', contactId);

    if (error) {
        alert('Error loading messages: ' + error.message);
        return;
    }

    messages.forEach((message) => {
        const div = document.createElement('div');
        div.className = 'outgoing';
        const p = document.createElement('p');
        output.appendChild(div);
        div.appendChild(p);
        p.textContent = message.text;
    });

    scrollOutputToBottom();
}


/*====================================================================
   Function to send a message and insert it into the Supabase database
  ====================================================================*/
async function sendMessage() {
    if (!activeContact) {
        alert('Please select a contact first.');
        return;
    }
    const input = document.querySelector('.inputSection input');

    const message = input.value.trim();
    if (message === '') return;

    const div = document.createElement('div');
    div.className = 'outgoing';
    const p = document.createElement('p');
    output.appendChild(div);
    div.appendChild(p);
    p.textContent = message;
    input.value = '';
    scrollOutputToBottom();

    const {data: insertText, error: insertError} = await supabaseClient
    .from('chats')
    .insert([{
        text: message,
        contact_id: activeContact
    }]);

    if (insertError) {
        alert('Error inserting message: ' + insertError.message);
    }
}
document.querySelector('.inputSection input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
});

document.querySelector('.likee').addEventListener('click', () => {
    const bubble = document.createElement('div');
    bubble.className = 'outgoing';
    const likee = document.createElement('img');
    likee.src = 'assets/like.svg';
    output.appendChild(bubble);
    bubble.appendChild(likee);
    scrollOutputToBottom();
});


/*==============================================================================
   Function to display the contact name and profile picture in the contact list
  ==============================================================================*/
async function loadContacts(contactId) {
    const {data, error} = await supabaseClient
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: true })

    if (error) {
        alert('Error loading contacts: ' + error.message);
        return;
    }

    data.forEach((contact) => {
    const tatay = document.createElement('div');
    tatay.className = "cntcPerson";

    tatay.dataset.contactId = contact.id;

    tatay.innerHTML = `
        <img src="assets/profile.svg" class="cntcPersonImg">
        <div class="cntcPersonInfo">
            <h1 class="cntcPersonName">${contact.name}</h1>
            <p>Start a new chat</p>
        </div>
    `
    container.appendChild(tatay);
    });
}
loadContacts();


async function createContact() {

    const nameInput = document.querySelector('.nameInput');
    const name = nameInput.value.trim();
    if (name === '') return;

    nameInput.value = '';
    const hider = document.querySelector('.hider');
    hider.classList.remove('show');

    const {data, error} = await supabaseClient
    .from('contacts')
    .insert([{name: name}])
    .select();

    const tatay = document.createElement('div');
    tatay.className = "cntcPerson";

    tatay.dataset.contactId = data[0].id;

    tatay.innerHTML = `
        <img src="assets/profile.svg" class="cntcPersonImg">
        <div class="cntcPersonInfo">
            <h1 class="cntcPersonName">${data[0].name}</h1>
            <p>Start a new chat</p>
        </div>
    `

    container.appendChild(tatay);
}
document.querySelector('.nameInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') createContact();
});


/*====================================================================
                 Highlighting the selected contact
====================================================================*/
document.querySelector('.cntcPeople').addEventListener('click', (e) => {
    const contact = e.target.closest('.cntcPerson');
    if (!contact) return;

    const allContact = document.querySelectorAll('.cntcPerson');
    allContact.forEach((person) => {
        person.classList.remove('active');
    });

    const contactName = contact.querySelector('.cntcPersonName').textContent;
    const nameOutput = document.querySelector('.nameOutput');
    nameOutput.textContent = contactName;

    contact.classList.add('active');

    activeContact = contact.dataset.contactId;

    loadMessages(activeContact);
});


/*====================================================================
   Toggle the visibility of the new chat form and the right panel
  ====================================================================*/
document.querySelector('.newChat').addEventListener('click', () => {
    const hider = document.querySelector('.hider');
    hider.classList.toggle('show');
});

document.querySelector('.closeButton').addEventListener('click', () => {
    const hider = document.querySelector('.hider');
    hider.classList.remove('show');
});

document.querySelector('.actionInfo').addEventListener('click', () => {
    const rightPanel = document.querySelector('.info');
    rightPanel.classList.toggle('show');
});