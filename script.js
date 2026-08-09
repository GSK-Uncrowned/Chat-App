import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabaseClient = createClient('https://mflwqmpfqdwscyxkdpfi.supabase.co', "sb_publishable_JVvk1dxs_aY3JydW6N_JfQ_tKcf1_RG");


const output = document.querySelector('.outputSection');

/*====================================================================
   Load messages from Supabase and display them in the output section 
  ====================================================================*/
async function loadMessages () {
    const {data: messages, error} = await supabaseClient
    .from('chat')
    .select('*')
    .order('created_at', { ascending: true });

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
    })
}
loadMessages();


/*=====================================================================
   Function to send a message and insert it into the Supabase database
  =====================================================================*/
async function sendMessage() {

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

    const {data: insertText, error: insertError} = await supabaseClient
    .from('chat')
    .insert([{text: message}]);

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
});


/*==============================================================================
   Function to display the contact name and profile picture in the contact list
  ==============================================================================*/
async function createContact() {

    const nameInput = document.querySelector('.nameInput');
    const name = nameInput.value.trim();
    if (name === '') return;

    nameInput.value = '';
    const hider = document.querySelector('.hider');
    hider.classList.remove('show');

    const nameOutputt = document.querySelector('.cntcPeople');

    const tatay = document.createElement('div');
    tatay.className = "cntcPerson";

    const pic = document.createElement('img');
    pic.src = "assets/profile.svg";
    pic.className = "cntcPersonImg";

    const papa = document.createElement('div');
    papa.className = "cntcPersonInfo";

    const pangalan = document.createElement('h1');
    pangalan.textContent = name;
    pangalan.className = "cntcPersonName";

    const prev = document.createElement('p');
    prev.textContent = "Start Messaging";

    papa.appendChild(pangalan);
    papa.appendChild(prev);

    tatay.appendChild(pic);
    tatay.appendChild(papa);

    nameOutputt.appendChild(tatay);
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