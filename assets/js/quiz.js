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
  },
  {
    text: "Combien font 2 + 3 ?",
    answers: ["3", "4", "5", "1"],
    correct: 2,
    timeLimit: 5,
  },
  {
    text: "Quel est le plus grand océan du monde ?",
    answers: ["Atlantique", "Pacifique", "Indien", "Arctique"],
    correct: 1,
    timeLimit: 15,
  },
  {
    text: "Qui a écrit 'Les Misérables' ?",
    answers: ["Émile Zola", "Victor Hugo", "Gustave Flaubert", "Molière"],
    correct: 1,
    timeLimit: 10,
  },
  {
    text: "Quelle planète est la plus proche du Soleil ?",
    answers: ["Mars", "Vénus", "Mercure", "Terre"],
    correct: 2,
    timeLimit: 10,
  },
  {
    text: "Quel est le symbole chimique de l'eau ?",
    answers: ["O2", "H2O", "CO2", "HO"],
    correct: 1,
    timeLimit: 5,
  },
  {
    text: "En quelle année a eu lieu la Révolution française ?",
    answers: ["1789", "1798", "1776", "1804"],
    correct: 0,
    timeLimit: 10,
  },
  {
    text: "Quel est le langage de programmation utilisé principalement pour le web ?",
    answers: ["Python", "Java", "JavaScript", "C++"],
    correct: 2,
    timeLimit: 5,
  },
  {
    text: "Combien y a-t-il de continents sur Terre ?",
    answers: ["5", "6", "7", "8"],
    correct: 2,
    timeLimit: 8,
  },
  {
    text: "Quelle est la couleur du sang des veines sous la peau ?",
    answers: ["Rouge", "Bleu", "Vert", "Violet"],
    correct: 0,
    timeLimit: 8,
  },
];

let recapQuestion = [];

let currentQuestionIndex = 0;
let score = 0;
let bestScore = loadFromLocalStorage("bestScore", 0);
let timerId = null;

// DOM Elements
const introScreen = getElement("#intro-screen");
const questionScreen = getElement("#question-screen");
const resultScreen = getElement("#result-screen");
const table = getElement("#tabRecap");

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

// Init
startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", restartQuiz);

setText(bestScoreValue, bestScore);

function startQuiz() {
  hideElement(introScreen);
  showElement(questionScreen);

  currentQuestionIndex = 0;
  score = 0;

  setText(totalQuestionsSpan, questions.length);

  showQuestion();
}

function showQuestion() {
  clearInterval(timerId);

  const q = questions[currentQuestionIndex];
  setText(questionText, q.text);
  setText(currentQuestionIndexSpan, currentQuestionIndex + 1);

  answersDiv.innerHTML = "";
  q.answers.forEach((answer, index) => {
    const btn = createAnswerButton(answer, () => selectAnswer(index, btn));
    answersDiv.appendChild(btn);
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

  const q = questions[currentQuestionIndex];
  if (index === q.correct) {
    score++;
    btn.classList.add("correct");
  } else {
    btn.classList.add("wrong");
  }

  // Création de l'objet pour récapitulatif
  addRecap(q.text, q.answers[index], q.answers[q.correct]);

  markCorrectAnswer(answersDiv, q.correct);
  lockAnswers(answersDiv);
  nextBtn.classList.remove("hidden");
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    endQuiz();
  }
}

function endQuiz() {
  hideElement(questionScreen);
  showElement(resultScreen);
  showElement(table);

  updateScoreDisplay(scoreText, score, questions.length);

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

function addRecap(question, answer, correct) {

  const exists = recapQuestion.some(item =>
    item.Question === question &&
    item.Reponse === answer &&
    item.Correct === correct
  );

  if (!exists) {
    recapQuestion.push({
      "Question": question,
      "Reponse": answer,
      "Correct": correct
    });

  } else {
    console.log("Cette question est déjà présente dans le tableau.");
  }

  showRecap();

}


function showRecap() {

  recapQuestion.forEach(item => {
    const exist = [...table.querySelectorAll("tr")].some(row =>
      row.dataset.question === item.Question
    );

    if (!exist) {
      const newRow = document.createElement("tr");
      newRow.dataset.question = item.Question;

      const questionCell = document.createElement("td");
      questionCell.textContent = item.Question;

      const answerCell = document.createElement("td");
      answerCell.textContent = item.Reponse;

      const correctCell = document.createElement("td");
      correctCell.textContent = item.Correct;

      newRow.appendChild(questionCell);
      newRow.appendChild(answerCell);
      newRow.appendChild(correctCell);

      table.appendChild(newRow);
    }
  });
}
