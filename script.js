document.addEventListener('DOMContentLoaded', function () {
    // Setze das aktuelle Datum
    updateDateDisplay();

    // Lade Timer-Status aus dem lokalen Speicher
    loadTimerStatus();

    // Lade und zeige Einträge aus dem lokalen Speicher
    loadAndDisplayEntries();

    const initialVideoUrl = document.getElementById('youtubeSelect').value;
    changeVideo(initialVideoUrl);
});

let timerInterval;
let timerValue;
let aktiverTimerTyp = 'challengeTimer'; // Standard: Challenge Timer
let remainingTime = 0; // Hinzugefügte Variable für die verbleibende Zeit
let isTimerRunning = false; // Variable zum Verfolgen des Timer-Status

function switchTimer() {
    const challengeTimer = document.getElementById('challengeTimer');

    if (challengeTimer.checked) {
        aktiverTimerTyp = 'challengeTimer';
    }
}

function setTimer() {
    let manualTimer = document.getElementById('manualTimer').value;

    // Stopp den vorherigen Timer
    clearInterval(timerInterval);

    // Setze die verbleibende Zeit auf null
    remainingTime = 0;

    if (manualTimer > 0) {
        timerValue = manualTimer;

        // Zeige den eingestellten Timer-Wert an
        document.getElementById('timerDisplay').innerText = `${manualTimer}:00`;

        // Speichere den Timer-Status im lokalen Speicher
        saveTimerStatus(manualTimer);

        // Aktiviere den Start-Button
        document.getElementById('startTimerBtn').removeAttribute('disabled');
    } else {
        alert('Bitte einen gültigen Timer-Wert eingeben.');
    }
}

function saveTimerStatus(timerValue) {
    localStorage.setItem('timerStatus', timerValue);
}

function loadTimerStatus() {
    const savedTimerValue = localStorage.getItem('timerStatus');

    if (savedTimerValue) {
        document.getElementById('manualTimer').value = savedTimerValue;
        document.getElementById('timerDisplay').innerText = `${savedTimerValue}:00`;

        // Aktiviere den Start-Button, wenn ein Timer-Wert vorhanden ist
        document.getElementById('startTimerBtn').removeAttribute('disabled');
    }
}

function startTimer() {
    let timer;

    switch (aktiverTimerTyp) {
        case 'challengeTimer':
            timer = timerValue * 60;
            break;
        default:
            break;
    }

    if (timer > 0) {
        clearInterval(timerInterval);

        // Verwende die verbleibende Zeit, wenn der Timer gestoppt wurde
        timer = remainingTime > 0 ? remainingTime : timer;

        timerInterval = setInterval(function () {
            let minutes = Math.floor(timer / 60);
            let seconds = timer % 60;

            document.getElementById('timerDisplay').innerText =
                minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');

            if (--timer < 0) {
                clearInterval(timerInterval);
                document.getElementById('timerDisplay').innerText = '00:00';
                isTimerRunning = false; // Setze den Timer-Status, wenn der Timer abgelaufen ist

                // Ändere den Text des Buttons auf "Start" nach Abschluss des Timers
                updateStartButtonStatus();

                // Spiele den Sound ab
                playTimerSound();
            }
        }, 1000);

        isTimerRunning = true; // Setze den Timer-Status, wenn der Timer läuft

        // Hier können Sie zusätzlichen Code für den Timer-Start implementieren
        document.getElementById('pauseTimerBtn').removeAttribute('disabled');
        document.getElementById('startTimerBtn').disabled = true;

        // Ändere den Text des Buttons auf "Weiter" während der Timer läuft
        updateStartButtonStatus();
    } else {
        alert('Bitte zuerst den Timer-Wert einstellen.');
    }
}

function pauseTimer() {
    clearInterval(timerInterval);

    // Speichere die verbleibende Zeit beim Pausieren
    remainingTime = calculateRemainingTime();

    // Hier können Sie zusätzlichen Code für die Timer-Pause implementieren
    document.getElementById('pauseTimerBtn').disabled = true;
    document.getElementById('startTimerBtn').removeAttribute('disabled');

    // Ändere den Text des Buttons auf "Start" während der Timer pausiert ist
    updateStartButtonStatus();
}

function playTimerSound() {
    const timerSound = document.getElementById('timerSound');
    timerSound.play();
 alert("der Timer ist abgelaufen!");
}

function updateStartButtonStatus() {
    const startButton = document.getElementById('startTimerBtn');

    if (isTimerRunning) {
        startButton.innerText = 'Weiter';
    } else {
        startButton.innerText = 'Start';
    }
}

function calculateRemainingTime() {
    let timerDisplay = document.getElementById('timerDisplay').innerText;
    let [minutes, seconds] = timerDisplay.split(':').map(Number);

    return minutes * 60 + seconds;
}

function updateDateDisplay() {
    let heute = new Date();
    let optionen = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let formatiertesDatum = heute.toLocaleDateString('de-DE', optionen);

    document.getElementById('dateDisplay').innerText = formatiertesDatum;
}

function loadAndDisplayEntries() {
    // Lade Einträge aus dem lokalen Speicher
    const einträge = loadEntries();

    // Zeige Einträge im stündlichen Einträge-Bereich
    displayEntries(einträge);
}

function loadEntries() {
    // Lade Einträge aus dem lokalen Speicher
    return JSON.parse(localStorage.getItem('hourlyEntries')) || [];
}

function saveEntries(einträge) {
    // Speichere Einträge im lokalen Speicher
    localStorage.setItem('hourlyEntries', JSON.stringify(einträge));
}

function displayEntries(einträge) {
    // Zeige Einträge im stündlichen Einträge-Bereich
    const stündlicheEinträge = document.getElementById('hourlyEntries');
    stündlicheEinträge.innerHTML = '';

    einträge.forEach(eintrag => {
        const eintragDiv = createEntryElement(eintrag);
        stündlicheEinträge.appendChild(eintragDiv);
    });
}

function createEntryElement(eintrag) {
    const eintragDiv = document.createElement('div');
    eintragDiv.classList.add('hourly-entry');

    const label = document.createElement('label');
    label.innerText = `${eintrag.startHour} - ${eintrag.endHour}: ${eintrag.task}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('entry-checkbox');
    checkbox.addEventListener('change', function () {
        toggleEntryStatus(eintragDiv, checkbox.checked);
    });

    eintragDiv.appendChild(label);
    eintragDiv.appendChild(checkbox);

    return eintragDiv;
}

function addEntry() {
    let startHour = document.getElementById('startHour').value;
    let endHour = document.getElementById('endHour').value;
    let task = document.getElementById('task').value;

    if (startHour && endHour && task) {
        const eintrag = { startHour, endHour, task };

        // Lade vorhandene Einträge
        const einträge = loadEntries();

        // Füge den neuen Eintrag hinzu
        einträge.push(eintrag);

        // Speichere Einträge im lokalen Speicher
        saveEntries(einträge);

        // Zeige alle Einträge an
        loadAndDisplayEntries();

        // Eingabefelder leeren
        document.getElementById('startHour').value = '';
        document.getElementById('endHour').value = '';
        document.getElementById('task').value = '';
    } else {
        alert('Bitte alle Felder ausfüllen.');
    }
}

function toggleEntryStatus(eintragDiv, abgeschlossen) {
    if (abgeschlossen) {
        eintragDiv.classList.add('abgeschlossen');
    } else {
        eintragDiv.classList.remove('abgeschlossen');
    }
}

function deleteEntries() {
    // Lösche alle Einträge aus dem lokalen Speicher
    localStorage.removeItem('hourlyEntries');

    // Aktualisiere die Anzeige
    loadAndDisplayEntries();
}
function changeVideo() {
    const selectElement = document.getElementById('youtubeSelect');
    const videoUrl = selectElement.value;

    const youtubePlayer = document.getElementById('youtubePlayer');
    youtubePlayer.src = videoUrl;
}



