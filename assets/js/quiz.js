// quiz.js
import {
  getElement,
  showElement,
  hideElement,
  setText,
  createAnswerButton,
  updateScoreDisplay,
  lockAnswers,
  markCorrectAnswer,
} from "./dom.js";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  startTimer,
} from "./utils.js";

console.log("Quiz JS loaded...");

const questions = [
  {
    text: "Quelle est la capitale de la France ?",
    answers: ["Marseille", "Paris", "Lyon", "Bordeaux"],
    correct: 1,
    timeLimit: 10,
    theme: "culture",
  },
  {
    text: "Combien font 2 + 3 ?",
    answers: ["3", "4", "5", "1"],
    correct: 2,
    timeLimit: 6,
    theme: "math",
  },
  {
    text: "Quel est le synonyme de 'joyeux' ?",
    answers: ["Triste", "Heureux", "Fâché", "Calme"],
    correct: 1,
    timeLimit: 8,
    theme: "french",
  },
  {
    text: "Qui a peint la Mona Lisa ?",
    answers: [
      "Vincent Van Gogh",
      "Claude Monet",
      "Pablo Picasso",
      "Léonard de Vinci",
    ],
    correct: 3,
    timeLimit: 8,
    theme: "culture",
  },
  {
    text: "Quel est le plus grand musée du monde ?",
    answers: ["Le Louvre", "Le British Museum", "Le Musée d'Orsay", "Le Prado"],
    correct: 0,
    timeLimit: 8,
    theme: "culture",
  },
  {
    text: "Dans quelle ville se trouve la Tour Eiffel ?",
    answers: ["Berlin", "Paris", "Rome", "Madrid"],
    correct: 1,
    timeLimit: 6,
    theme: "culture",
  },
  {
    text: "Combien fait 7 x 8 ?",
    answers: ["56", "49", "64", "42"],
    correct: 0,
    timeLimit: 10,
    theme: "math",
  },
  {
    text: "Quel est le résultat de 25 ÷ 5 ?",
    answers: ["4", "5", "6", "7"],
    correct: 1,
    timeLimit: 8,
    theme: "math",
  },
  {
    text: "Si x = 4, quelle est la valeur de x² ?",
    answers: ["8", "16", "4", "2"],
    correct: 1,
    timeLimit: 10,
    theme: "math",
  },
  {
    text: "Quel est le contraire de 'heureux' ?",
    answers: ["Triste", "Joyeux", "Content", "Satisfait"],
    correct: 0,
    timeLimit: 8,
    theme: "french",
  },
  {
    text: "Comment écrit-on le pluriel de 'cheval' ?",
    answers: ["Chevaux", "Chevals", "Chevales", "Chevauxs"],
    correct: 0,
    timeLimit: 10,
    theme: "french",
  },
  {
    text: "Quelle est la bonne orthographe ?",
    answers: ["Papillon", "Papyllon", "Pappillon", "Papyllon"],
    correct: 0,
    timeLimit: 8,
    theme: "french",
  },
  {
    text: "Cliquez sur l'image qui montre un chien.",
    answers: [
      "../assets/img/chien.jpg",
      "../assets/img/chat.jpg",
      "../assets/img/perroquet.jpg",
      "../assets/img/elephant.jpg",
    ],
    correct: 0,
    timeLimit: 8,
    theme: "culture",
  },
  {
    text: "Cliquez sur l'image qui complète les pointillés : 4 ... 10 = 40 ",
    answers: [
      "../assets/img/plus.jpg",
      "../assets/img/minus.jpg",
      "../assets/img/times.jpg",
      "../assets/img/divided.jpg",
    ],
    correct: 2,
    timeLimit: 8,
    theme: "math",
  },
];

let currentQuestionIndex = 0;
let score = 0;
let bestScore = loadFromLocalStorage("bestScore", 0);
let timerId = null;
let filteredQuestions = [...questions];

// DOM Elements
const introScreen = getElement("#intro-screen");
const questionScreen = getElement("#question-screen");
const resultScreen = getElement("#result-screen");

const bestScoreValue = getElement("#best-score-value");
const bestScoreEnd = getElement("#best-score-end");

const questionText = getElement("#question-text");
const answersDiv = getElement("#answers");
const nextBtn = getElement("#next-btn");
const startBtn = getElement("#start-btn");
const restartBtn = getElement("#restart-btn");

const scoreText = getElement("#score-text");
const timeLeftSpan = getElement("#time-left");

const currentQuestionIndexSpan = getElement("#current-question-index");
const totalQuestionsSpan = getElement("#total-questions");

const themeSelect = getElement("#theme-select");

const toggleDarkModeBtn = getElement("#toggle-darkmode");

// Init
startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", restartQuiz);

themeSelect.addEventListener("change", filterQuestionsByTheme);

/////////////////////////////////////////Feature Dark Mode

toggleDarkModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("darkmode");
  document
    .querySelectorAll(
      "h1, .notice, button, #timer-div, #progress, #result-screen h2, .top-score, .best-score-value, #question-text, #result-screen p, #result-screen h2, #theme-select-label"
    )
    .forEach((element) => {
      element.classList.toggle("darkmode");
    });
});

/////////////////////////////////////////

setText(bestScoreValue, bestScore);

function filterQuestionsByTheme() {
  const selectedTheme = themeSelect.value;
  if (selectedTheme === "all") {
    filteredQuestions = [...questions];
  } else {
    filteredQuestions = questions.filter((q) => q.theme === selectedTheme);
  }
}

function startQuiz() {
  hideElement(introScreen);
  showElement(questionScreen);

  currentQuestionIndex = 0;
  score = 0;

  setText(totalQuestionsSpan, filteredQuestions.length);

  showQuestion();
}

function showQuestion() {
  clearInterval(timerId);

  const q = filteredQuestions[currentQuestionIndex];
  setText(questionText, q.text);
  setText(currentQuestionIndexSpan, currentQuestionIndex + 1);

  answersDiv.innerHTML = "";

  q.answers.forEach((answer, index) => {
    let answerElement;
    if (
      answer.includes(".jpg") ||
      answer.includes(".png") ||
      answer.includes(".jpeg")
    ) {
      console.log("images answers");
      answerElement = document.createElement("img");
      answerElement.src = answer;
      answerElement.alt = "Image";
      answerElement.classList.add("answer-img");
      answerElement.addEventListener("click", () =>
        selectAnswer(index, answerElement)
      );
    } else {
      answerElement = createAnswerButton(answer, () =>
        selectAnswer(index, answerElement)
      );
    }

    answersDiv.appendChild(answerElement);
  });

  nextBtn.classList.add("hidden");

  timeLeftSpan.textContent = q.timeLimit;
  timerId = startTimer(
    q.timeLimit,
    (timeLeft) => setText(timeLeftSpan, timeLeft),
    () => {
      lockAnswers(answersDiv);
      nextBtn.classList.remove("hidden");
    }
  );
}

function selectAnswer(index, btn) {
  clearInterval(timerId);

  const q = filteredQuestions[currentQuestionIndex];
  if (index === q.correct) {
    score++;
    btn.classList.add("correct");
  } else {
    btn.classList.add("wrong");
  }

  markCorrectAnswer(answersDiv, q.correct);
  lockAnswers(answersDiv);
  nextBtn.classList.remove("hidden");
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < filteredQuestions.length) {
    showQuestion();
  } else {
    endQuiz();
  }
}

function endQuiz() {
  hideElement(questionScreen);
  showElement(resultScreen);

  updateScoreDisplay(scoreText, score, filteredQuestions.length);

  if (score > bestScore) {
    bestScore = score;
    saveToLocalStorage("bestScore", bestScore);
  }
  setText(bestScoreEnd, bestScore);
}

function restartQuiz() {
  hideElement(resultScreen);
  showElement(introScreen);

  setText(bestScoreValue, bestScore);
}
