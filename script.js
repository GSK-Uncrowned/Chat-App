const input = document.querySelector ('.inputSection input');
const sendButton = document.querySelector('.inputSection button');
const output = document.querySelector('.outputSection');
const rightPanel = document.querySelector('.info');
const infoButton = document.querySelector('.actionInfo');
const newChatButton = document.querySelector('.newChat');
const hider = document.querySelector('.hider');
const closeButton = document.querySelector('.closeButton');
const nameInput = document.querySelector('.nameInput');
const joinChatButton = document.querySelector('.joinChatButton');
const nameOutput = document.querySelector('.nameOutput');

sendButton.addEventListener('click', () => {

    const message = input.value.trim();

    if (input.value ==='') return;

    const div = document.createElement('div');
    div.className = "outgoing";

    const p = document.createElement('p');

    output.appendChild(div);
    div.appendChild(p);
    p.textContent = message;

    input.value = '';
});

newChatButton.addEventListener('click', () => {

    hider.classList.toggle('show');
});

closeButton.addEventListener('click', () => {
    hider.classList.remove('show');
});

infoButton.addEventListener('click', () => {
    
    rightPanel.classList.toggle('show');
});

joinChatButton.addEventListener('click', () => {

    const name = nameInput.value.trim();
    if (name === '') return;

    if (nameOutput) {
        nameOutput.textContent = name;
    }
    else {
    const h1 = document.createElement('h1');
    h1.textContent = name;
    nameOutput.appendChild(h1);
    }

    nameInput.value = '';
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

    const prev = document.createElement('p');
    prev.textContent = "Start Messaging";

    papa.appendChild(pangalan);
    papa.appendChild(prev);

    tatay.appendChild(pic);
    tatay.appendChild(papa);

    nameOutputt.appendChild(tatay);
});

const cntcPeople = document.querySelector('.cntcPeople');

cntcPeople.addEventListener('click', (e) => {
    const contact = e.target.closest('.cntcPerson');
    if (!contact) return;

    const allContact = document.querySelectorAll('.cntcPerson');
    allContact.forEach((person) => {
        person.classList.remove('active');
    });
    contact.classList.add('active');
});