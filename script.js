import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseClient = createClient('https://mflwqmpfqdwscyxkdpfi.supabase.co', "sb_publishable_JVvk1dxs_aY3JydW6N_JfQ_tKcf1_RG");

async function sendMessage() {
    const {data, error} = await supabaseClient
    .from('chat')
    .select('message, created_at')
    .order('created_at', { ascending: true });

    const input = document.querySelector('.inputSection input');
    const output = document.querySelector('.outputSection');

    const message = input.value.trim();
    if (message === '') return;

    const div = document.createElement('div');
    div.className = 'outgoing';
    const p = document.createElement('p');
    output.appendChild(div);
    div.appendChild(p);
    p.textContent = message;
    input.value = '';

    const {data, error} = await supabaseClient
    .from('chat')
    .insert([{text: message}]);

    if (error) {
        alert('Error inserting message: ' + error.message);
    }

    if (data) {
        alert('Message sent successfully!');
    }
}

document.querySelector('.inputSection input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
});

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

function senddMessage() {

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
    if (e.key === 'Enter') senddMessage();
});

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

document.querySelector('.likee').addEventListener('click', () => {
    const output = document.querySelector('.outputSection');
    const bubble = document.createElement('div');
    bubble.className = 'outgoing';
    const likee = document.createElement('img');
    likee.src = 'assets/like.svg';
    output.appendChild(bubble);
    bubble.appendChild(likee);
});