const input = document.querySelector ('.inputSection input');
const sendButton = document.querySelector('.inputSection button');
const output = document.querySelector('.outputSection');
const rightPanel = document.querySelector('.info');
const infoButton = document.querySelector('.actionInfo');

infoButton.addEventListener('click', () => {
    
    rightPanel.classList.toggle('show');
});

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