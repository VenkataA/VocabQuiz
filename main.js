let vocabulary = [];
const today = new Date().toISOString().split('T')[0];
let quizData;
let currentIndex = 0;
let currentAnswer = "";

let dueWords;

async function loadVocab(vocalURL) {
    let json = [];
    let url = 'data/' + vocalURL;
    try {
        let response = await fetch(url);
        json = await response.json();
    } catch (err) {
        console.log("Error: " + err.message);
        console.log("Looking up: " + url);
        console.log("Returning: " + json);
    }
    return json;
}

function reset() {
    currentIndex = 0;
    quizData.forEach((currentValue, index, arr) => { arr[index].nextReview = today });
    dueWords = quizData.filter(item => item.nextReview <= today);
}

async function loadProgress() {

    const saved = localStorage.getItem("vocabProgress");
    //console.log("saved = " + saved);
    if (saved) return JSON.parse(saved);
    return vocabulary.map(item => ({
        ...item,
        EF: 2.5,
        interval: 0,
        repetition: 0,
        nextReview: today
    }));
}

function saveProgress() {
    localStorage.setItem("vocabProgress", JSON.stringify(quizData));
}

async function loadQuestion(vocabURL) {
    localLog = [];
    try {
    localLog.push("Got vocabURL");
    await loadProgress().then((data) => { quizData = data; dueWords = quizData.filter(item => item.nextReview <= today); vocabulary = loadVocab(vocabURL); }).then(() => reset());

    // reset();

    if (currentIndex >= dueWords.length) {
        document.querySelector(".card-body").innerHTML = `<h5 class="text-center">All done for today!</h5>`;
        return;
    }

    document.getElementById("submitQuestion").style.visibility = "visible";
    document.getElementById("nextQuestion").style.visibility = "hidden";

    const current = dueWords[currentIndex];
    document.getElementById("definition").textContent = `Definition: ${current.definition}`;
    currentAnswer = current.word;

    const wrongChoices = quizData
        .filter(item => item.word !== current.word)
        .sort(() => 0.5 - Math.random())
        .slice(0, 2)
        .map(item => item.word);

    const allChoices = shuffle([current.word, ...wrongChoices]);

    const choicesDiv = document.getElementById("choices");
    choicesDiv.innerHTML = "";
    allChoices.forEach(choice => {
        choicesDiv.innerHTML += `
        <div class="form-check">
          <input class="form-check-input" type="radio" name="choice" value="${choice}" id="${choice}">
          <label class="form-check-label" for="${choice}">${choice}</label>
        </div>
      `;
    });

    document.getElementById("feedback").textContent = "";
    //document.getElementById("rating").classList.add("d-none");
    updateProgress();
    } catch(err) {
        console.log("Error: " + err.message);
        console.log(localLog);
    }
     console.log(localLog);
}

function submitAnswer() {
    const selected = document.querySelector('input[name="choice"]:checked');
    if (!selected) {
        alert("Please select an answer!");
        return;
    }

    const answer = selected.value;
    const feedback = document.getElementById("feedback");

    document.getElementById("submitQuestion").style.visibility = "hidden";
    document.getElementById("nextQuestion").style.visibility = "visible";
    if (answer === currentAnswer) {
        feedback.textContent = "Correct!";
        feedback.className = "text-success";


    } else {
        feedback.textContent = `Wrong! Correct answer: ${currentAnswer}`;
        feedback.className = "text-danger";

    }

    //document.getElementById("rating").classList.remove("d-none");
}

function nextQuestion() {
    const feedback = document.getElementById("feedback");
    if (feedback.textContent == "Correct!") {
        rateAnswer(4);
    }

    rateAnswer(0);
}

function rateAnswer(quality) {
    const word = dueWords[currentIndex];
    const index = quizData.findIndex(item => item.word === word.word);
    const item = quizData[index];

    if (quality >= 3) {
        if (item.repetition === 0) {
            item.interval = 1;
        } else if (item.repetition === 1) {
            item.interval = 6;
        } else {
            item.interval = Math.round(item.interval * item.EF);
        }
        item.repetition += 1;
    } else {
        item.repetition = 0;
        item.interval = 1;
    }

    item.EF = Math.max(1.3, item.EF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + item.interval);
    item.nextReview = nextDate.toISOString().split('T')[0];

    quizData[index] = item;
    saveProgress();

    currentIndex++;
    loadQuestion();
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function updateProgress() {
    document.getElementById("progress").textContent = `Word ${currentIndex + 1} of ${dueWords.length}`;
}