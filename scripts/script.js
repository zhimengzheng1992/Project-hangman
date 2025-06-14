// To generate 26 keys
const keyboard = document.querySelector(".keyboard");
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
letters.forEach(letter => {
    const btn = document.createElement("div");
    btn.textContent = letter;
    keyboard.appendChild(btn);
});


const hangmanGame = {
    word: "",
    hint: "",
    letters: [],
    wrongGuessCount: 0,
    maxWrongGuesses: 7,

    reset: function () {
        this.word = "";
        this.hint = "";
        this.letters = [];
        this.wrongGuessCount = 0;

        //reset UI status
        document.querySelector(".letter-area").innerHTML = "";
        document.querySelector(".hint-area").innerHTML = "";
        document.querySelector(".message").innerHTML = "Incorrect guesses: 0/7";
        document.querySelector("#lost-message").textContent = "";
        document.querySelector("#pic img").src = "../images/0.png";


        // // Reset overlay and result display
        const overlay = document.getElementById("overlay");
        const win = document.querySelector(".win");
        const lost = document.querySelector(".lost");
        overlay.style.display = "none";
        overlay.style.opacity = 0;
        overlay.style.pointerEvents = "none";

        win.style.opacity = 0;
        win.style.display = "none";
        lost.style.opacity = 0;
        lost.style.display = "none";

        // Reset keyboard button styles: Clear clicked state and restore pointer cursor
        const keys = document.querySelectorAll(".keyboard div");
        for (const key of keys) {
            key.classList.remove("clicked");
            key.style.cursor = "pointer";
        }

        // clear win animation.
        if (winTimeout) {
            clearTimeout(winTimeout);
            winTimeout = null;
        }

    }
};

function startGame() {

    hangmanGame.reset();

    fetch('../json/baby_word_list.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(setupNewRound)
        .catch(error => {
            console.error('Error loading JSON:', error);
        });
}



function setupNewRound(data) {

    const randomIndex = Math.floor(Math.random() * data.length);
    const letterArea = document.querySelector(".letter-area")
    const hintArea = document.querySelector(".hint-area")

    hangmanGame.word = data[randomIndex].word;
    hangmanGame.hint = data[randomIndex].hint;
    hangmanGame.letters = hangmanGame.word.split("");

    for (let i = 0; i < hangmanGame.letters.length; i++) {
        letterArea.innerHTML += `<div class="underline-box"></div>`
    }
    hintArea.innerHTML = `<p>Hint: ${hangmanGame.hint} - ${hangmanGame.word} </p>`


    const keys = document.querySelectorAll(".keyboard div")

    for (const key of keys) {
        key.addEventListener("click", onLetterClick)
        key.addEventListener("mouseover", function () {
            key.classList.add("over")
        })
        key.addEventListener("mouseleave", function () {
            key.classList.remove("over")
        })
    }
}

function onLetterClick(event) {

    const message = document.querySelector(".message")
    const key = event.currentTarget;
    const { word, letters, maxWrongGuesses } = hangmanGame;

    if (hangmanGame.wrongGuessCount >= maxWrongGuesses) {
        return
    }

    if (key.classList.contains("clicked")) {
        return
    };

    key.classList.add("clicked");
    key.style.cursor = "not-allowed";

    let matched = false;
    for (let i = 0; i < letters.length; i++) {
        if (letters[i].toUpperCase() === key.textContent.toUpperCase()) {
            const box = document.querySelectorAll('.underline-box')[i];
            if (box) {
                box.textContent = letters[i]
                box.classList.add("correct-box")
            }
            matched = true;
        }
    }
    if (!matched) {
        hangmanGame.wrongGuessCount++;
    }

    const boxes = document.querySelectorAll('.underline-box');
    let allFilled = true;

    for (let i = 0; i < boxes.length; i++) {
        if (boxes[i].textContent === "") {
            allFilled = false;
            break;
        }
    }

    if (allFilled) {
        message.innerHTML = "🎉 You Win!";

        const winMessage = document.querySelector("#win-message");

        winMessage.textContent = `The word was "${word}"`;

        showOverlayWin();
        return;
    }

    if (hangmanGame.wrongGuessCount >= maxWrongGuesses) {
        message.innerHTML = "💀 Game Over!";
        const lostMessage = document.querySelector("#lost-message")
        lostMessage.textContent = `The word was "${word}"`
        showOverlayLost();
        return;
    }

    message.innerHTML = `Incorrect guesses: ${hangmanGame.wrongGuessCount}/${maxWrongGuesses}`;

    const pic = document.querySelector("#pic img")
    if (hangmanGame.wrongGuessCount !== 0) {
        pic.src = `../images/${hangmanGame.wrongGuessCount}.png`
    }
}

const overlay = document.getElementById("overlay");
const lost = document.querySelector(".lost");
const win = document.querySelector(".win");
const againBtns = document.querySelectorAll(".again");

function showOverlayWin() {
    lost.style.display = "none";
    overlay.style.display = "flex";
    win.style.display = "flex";

    requestAnimationFrame(() => {
        overlay.style.opacity = 1;
        overlay.style.pointerEvents = "auto";
        win.style.opacity = 1;
    })
    winAnimation();
}

function showOverlayLost() {
    win.style.display = "none";
    overlay.style.display = "flex";
    lost.style.display = "flex";

    requestAnimationFrame(() => {
        overlay.style.opacity = 1;
        overlay.style.pointerEvents = "auto";
        lost.style.opacity = 1;
    })
}

for (const againBtn of againBtns) {
    againBtn.addEventListener("click", () => {
        overlay.style.display = "none";
        win.style.display = "none";
        lost.style.display = "none";
        startGame();
    })
};

// Animation for win overlay
let frameIndex = 1;
const MAX_FRAME = 7;
let winTimeout;

function winAnimation() {
    winTimeout = setTimeout(function () {
        const winImg = document.querySelector(".win img");
        winImg.src = `./images/win-images/${frameIndex}.png`;
        frameIndex++;
        if (frameIndex > MAX_FRAME) {
            frameIndex = 1;
        }
        requestAnimationFrame(winAnimation);
    }, 150);
}
startGame();