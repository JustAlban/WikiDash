document.getElementById('createParty').addEventListener('click', createParty);
document.getElementById('startGame').addEventListener('click', () => startGame());
document.getElementById('stopGame').addEventListener('click', stopGame);

let username = '';

async function createParty() {
    // Prompt the player to enter their username
    username = prompt('Enter your username:');

    // Generate party ID and create a new party
    const partyId = Math.random().toString(36).substr(2, 9);
    await createPartyInFirebase(partyId, username);

    // Generate invite link and display it
    const inviteLink = generateInviteLink(partyId);
    displayInviteLink(inviteLink);

    // Show game area
    document.getElementById('gameArea').style.display = 'block';
}

function generateInviteLink(partyId) {
    return location.origin + location.pathname + '?party=' + partyId;
}

async function createPartyInFirebase(partyId, username) {
    const partyRef = firebase.database().ref('parties/' + partyId);
    await partyRef.set({ player1: username, player2: null });
    partyRef.on('value', (snapshot) => {
        const party = snapshot.val();
        if (party.player2) {
            document.getElementById('startGame').disabled = false;
        }
    });
}

function displayInviteLink(inviteLink) {
    const inviteLinkContainer = document.getElementById('inviteLinkContainer');
    inviteLinkContainer.innerHTML = 'Invite link: <a href="' + inviteLink + '">' + inviteLink + '</a>';
}

async function getRandomWikipediaPage() {
    const response = await fetch('https://en.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=1&format=json&origin=*');
    const data = await response.json();
    const pageTitle = data.query.random[0].title;
    return 'https://en.wikipedia.org/wiki/' + encodeURIComponent(pageTitle);
}

function extractTitleFromURL(url) {
    return decodeURIComponent(url.split('/wiki/')[1].replace(/_/g, ' '));
}

async function startGame() {
    // Generate random start and end pages, and update the iframe and objective
    const startPage = await getRandomWikipediaPage();
    const endPage = await getRandomWikipediaPage();
    const endPageTitle = extractTitleFromURL(endPage);
    document.getElementById('wikiFrame').src = startPage;
    document.getElementById('objective').innerText = 'Objective: Get to ' + endPageTitle;

    // Start the timer
    startTimer();

    // Check for victory condition
    checkVictory(endPage);
}

let timerInterval;
function startTimer() {
clearInterval(timerInterval);
let seconds = 0
    timerInterval = setInterval(function () {
        seconds++;
        document.getElementById('timer').innerText = formatTime(seconds);
    }, 1000);
}

function formatTime(seconds) {
const min = Math.floor(seconds / 60);
const sec = seconds % 60;
return (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec);
}

function checkVictory(endPage) {
const wikiFrame = document.getElementById('wikiFrame');

wikiFrame.onload = function () {
    if (wikiFrame.contentWindow.location.href === endPage) {
        clearInterval(timerInterval);
        alert('Congratulations! You reached the objective.');
        resetGame();
    }
};
}

function resetGame() {
document.getElementById('timer').innerText = '00:00';
document.getElementById('wikiFrame').src = 'https://en.wikipedia.org/wiki/Special:Random';
}

function stopGame() {
    clearInterval(timerInterval);
    resetGame();
    // Notify both players that the game has been canceled
    alert('The game has been canceled.');
}


