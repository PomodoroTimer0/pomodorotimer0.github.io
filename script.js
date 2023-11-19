document.addEventListener('DOMContentLoaded', function () {
    // Setze das aktuelle Datum
    updateDateDisplay();

    // Lade Timer-Status aus dem lokalen Speicher
    loadTimerStatus();

    // Lade und zeige Einträge aus dem lokalen Speicher
    loadAndDisplayEntries();

    // Lade direkt das YT video beim Laden der Seite
    const initialVideoUrl = document.getElementById('youtubeSelect').value;
    changeVideo(initialVideoUrl);
});

let timerInterval;
let timerValue;
let aktiverTimerTyp = 'challengeTimer'; 
let remainingTime = 0; 
let isTimerRunning = false; 

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
    alert("Timer ist abgelaufen!")
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





let flashcards = JSON.parse(localStorage.getItem('flashcards')) || [];
let quizCards = [];

updateFlashcards();

function addFlashcard() {
    const question = document.getElementById('question').value;
    const answer = document.getElementById('answer').value;

    if (question && answer) {
        const flashcard = { question, answer };
        flashcards.push(flashcard);
        clearInputFields();
        saveFlashcardsToLocalStorage();
        updateFlashcards(); // Hier aktualisieren, nachdem eine Karte hinzugefügt wurde
    } else {
        alert('Bitte Frage und Antwort eingeben.');
    }
}

function updateFlashcards() {
    const flashcardsContainer = document.getElementById('flashcards');
    flashcardsContainer.innerHTML = '';

    flashcards.forEach((flashcard, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('flashcard');
        cardDiv.innerHTML = `<strong>Frage:</strong> ${flashcard.question}<br><strong>Antwort:</strong> ${flashcard.answer}`;
        flashcardsContainer.appendChild(cardDiv);
    });

    // Hinzugefügten Code für den Karteikarten-Löschen-Button
    const deleteFlashcardsBtn = document.getElementById('deleteFlashcardsBtn');
    if (flashcards.length > 0) {
        deleteFlashcardsBtn.style.display = 'block';
    } else {
        deleteFlashcardsBtn.style.display = 'none';
    }
}

function saveFlashcardsToLocalStorage() {
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
}

function showDeleteFlashcardsButton() {
    const deleteFlashcardsButton = document.getElementById('deleteFlashcardsBtn');
    deleteFlashcardsButton.style.display = 'block';
}

function clearInputFields() {
    document.getElementById('question').value = '';
    document.getElementById('answer').value = '';
}

function deleteFlashcards() {

    flashcards = [];
    saveFlashcardsToLocalStorage();
    updateFlashcards();
}

function hideDeleteFlashcardsButton() {
    const deleteFlashcardsButton = document.getElementById('deleteFlashcardsBtn');
    deleteFlashcardsButton.style.display = 'none';
}

function startQuiz() {
    quizCards = [...flashcards];
    shuffleArray(quizCards);
    showQuiz();
}

function showQuiz() {
    document.getElementById('quiz').style.display = 'block';
    checkQuiz(); 
}

function updateQuizCards() {
    const quizCardsContainer = document.getElementById('quizCards');
    quizCardsContainer.innerHTML = ''; // Hier wird der Inhalt vor dem Hinzufügen von neuen Quiz-Fragen gelöscht

    quizCards.forEach((quizCard, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('quiz-card');
        cardDiv.innerHTML = `<strong>Frage ${index + 1}:</strong> ${quizCard.question}`;
        quizCardsContainer.appendChild(cardDiv);
    });
checkQuiz();
}

function checkQuiz() {
    const userAnswers = [];

    quizCards.forEach((quizCard, index) => {
        const userAnswer = prompt(`Frage ${index + 1}: ${quizCard.question}`);
        userAnswers.push(userAnswer);
    });

    displayResults(userAnswers);
}

function displayResults(userAnswers) {
    let correctCount = 0;
    const incorrectAnswers = [];

    quizCards.forEach((quizCard, index) => {
        if (userAnswers[index] === quizCard.answer) {
            correctCount++;
        } else {
            incorrectAnswers.push({
                question: quizCard.question,
                userAnswer: userAnswers[index],
                correctAnswer: quizCard.answer
            });
        }
    });

    const accuracy = (correctCount / quizCards.length) * 100;

    alert(`Ergebnis: Du hast ${correctCount} von ${quizCards.length} Fragen richtig beantwortet. Genauigkeit: ${accuracy.toFixed(2)}%`);

    if (incorrectAnswers.length > 0) {
        showIncorrectAnswers(incorrectAnswers);
    }
}

function showIncorrectAnswers(incorrectAnswers) {
    const incorrectAnswersContainer = document.getElementById('incorrectAnswers');
    incorrectAnswersContainer.innerHTML = '';

    incorrectAnswers.forEach((incorrectAnswer, index) => {
        const answerDiv = document.createElement('div');
        answerDiv.classList.add('incorrect-answer');
        answerDiv.innerHTML = `<strong>Frage:</strong> ${incorrectAnswer.question}<br>
                               <strong>Deine Antwort:</strong> ${incorrectAnswer.userAnswer}<br>
                               <strong>Richtige Antwort:</strong> ${incorrectAnswer.correctAnswer}`;
        incorrectAnswersContainer.appendChild(answerDiv);
    });
}

// Fisher-Yates Shuffle Algorithmus zum Zufällig Mischen von Arrays
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}







