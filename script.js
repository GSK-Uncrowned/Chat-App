const input = document.querySelector ('.inputSection input');
const sendButton = document.querySelector('.inputSection button');
const output = document.querySelector('.outputSection');

sendButton.addEventListener('click', () => {

    const message = input.value.trim();

    if (input.value ==='') return;

    const div = document.createElement('div');
    div.className = "outgoing";

    const p = document.createElement('p');

    output.appendChild(div);
    div.appendChild(p);
    p.textContent = input.value;

    input.value = '';
});