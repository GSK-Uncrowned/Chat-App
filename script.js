import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabaseClient = createClient('https://mflwqmpfqdwscyxkdpfi.supabase.co', "sb_publishable_JVvk1dxs_aY3JydW6N_JfQ_tKcf1_RG");

const { data: { user } } = await supabaseClient.auth.getUser();

async function initializeTheFuckingApp() {

    const modal = document.querySelector('.modal');
    if (!user) {
        modal.classList.toggle('hide');
        console.log("not logged in");

        return;
    }
}
initializeTheFuckingApp();
console.log(user);



const output = document.querySelector('.outputSection');
const container = document.querySelector('.cntcPeople');

let activeContact = null;

function scrollOutputToBottom() {
    output.scrollTop = output.scrollHeight;
}

/*====================================================================
   Load messages and Send messages to and from the Supabase database
  ====================================================================*/

  /*======================[ Load Messages ]====================*/

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

/*======================[ Send Messages ]====================*/

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

    const { data: insertText, error: insertError } = await supabaseClient
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

/*====================================================================
   Function to handle the like button click
  ====================================================================*/
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
    Load contacts and Create new contacts
  ==============================================================================*/

  /*======================[ Load Contacts ]====================*/

async function loadContacts(contactId) {
    const { data, error } = await supabaseClient
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

        tatay.dataset.contactId = contact.user_id;

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

/*======================[ Create Contacts ]====================*/

async function createContact(userName, userId) {
    const tatay = document.createElement('div');
    tatay.className = "cntcPerson";

    const { data, error } = await supabaseClient
        .from('contacts')
        .insert([{
            name: userName,
            user_id: userId
        }])
        .select();

    if (error) {
        alert('Error creating contact: ' + error.message);
        return;
    }

    const newContact = data[0];

    tatay.dataset.contactId = newContact.user_id;

    tatay.innerHTML = `
        <img src="assets/profile.svg" class="cntcPersonImg">
        <div class="cntcPersonInfo">
            <h1 class="cntcPersonName">${data[0].name}</h1>
            <p>Start a new chat</p>
        </div>
    `

    container.appendChild(tatay);
}

/*====================================================================
    Handle login and signup form submissions
  ====================================================================*/

/*======================[ LogIn ]====================*/

const loginForm = document.querySelector('.logIn');
const signupForm = document.querySelector('.signUp');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = loginForm.querySelector('.emailInput').value.trim();
    const password = loginForm.querySelector('.passwordInput').value.trim();

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        alert('Error logging in: ' + error.message);
        return;
    }

    if (!data) {
        alert('Error logging in: No data returned');
        return;
    }

    document.querySelector('.emailInput').value = '';
    document.querySelector('.passwordInput').value = '';

    modal.classList.toggle('hide');
});

/*======================[ SignUp ]====================*/

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userName = signupForm.querySelector('.userInput').value.trim();
    const email = signupForm.querySelector('.emailInput').value.trim();
    const password = signupForm.querySelector('.passwordInput').value.trim();

    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                userName: userName,
            },
        },
    });

    const userId = authData?.user?.id;

    if (authError) {
        alert('Error creating user: ' + authError.message);
        return;
    }

    if (!authData) {
        alert('Error creating user: No data returned');
        return;
    }

    createContact(userName, userId);

    document.querySelector('.userInput').value = '';
    document.querySelector('.emailInput').value = '';
    document.querySelector('.passwordInput').value = '';

    modal.classList.toggle('hide');
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
    const nameOutput = document.querySelectorAll('.nameOutput');
    nameOutput.forEach((name) => {
        name.textContent = contactName;
    });

    contact.classList.add('active');

    activeContact = contact.dataset.contactId;

    loadMessages(activeContact);
});


/*====================================================================
   Toggle functions
  ====================================================================*/

document.querySelector('.actionInfo').addEventListener('click', () => {
    const rightPanel = document.querySelector('.info');
    rightPanel.classList.toggle('show');
});

/*==============================[ Modal ]==================================*/

const esc = document.querySelectorAll('.esc');
const modal = document.querySelector('.modal');
const modal1 = document.querySelector('.signUp');
const modal2 = document.querySelector('.logIn');

const acc = document.querySelector('.mrKhen').addEventListener('click', () => {
    modal.classList.toggle('hide');
});

function removeModal() {
    esc.forEach((something) => {
        something.addEventListener('click', () => {
            modal.classList.toggle('hide');
        });
    });
}

removeModal();

const change = document.querySelectorAll('.link');
change.forEach((something) => {
    something.addEventListener('click', () => {
        modal1.classList.toggle('hide');
        modal2.classList.toggle('hide');
    });
});