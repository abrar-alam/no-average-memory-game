const colorGridDiv = document.querySelector("div#game");
const gameContainer = document.getElementById("game");
const gameStartScreen = document.querySelector("div#game-start-screen");
const liveScoreDiv = document.querySelector("div#live-score-div");
let  totalNumberOfCards = null;
let cardsRevealed = 0;
let score = 0;
const gameOverScreen = document.querySelector("div#game-over-screen");
let playingCards = [];



// The object that keeps track of the two consecutive guesses

const realTimeData = {
  types : [null, null],
  indices : [null, null],
  guessCounter : 0,
  timeoutID : null
};

// here is a helper function to shuffle an array
// it returns the same array with values shuffled
// it is based on an algorithm called Fisher Yates if you want ot research more
function shuffle(array) {
  let counter = array.length;

  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    let index = Math.floor(Math.random() * counter);

    // Decrease counter by 1
    counter--;

    // And swap the last element with it
    let temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }

  return array;
}


// this function loops over the array of colors
// it creates a new div and gives it a class with the value of the color
// it also adds an event listener for a click for each card
function createDivsForColors(colorArray) {

  let i = 0;

  for (let color of colorArray) {
    // create a new div
    const newDiv = document.createElement("div");

    // give it a class attribute for the value we are looping over
    newDiv.classList.add(color);

    // give it a unique index (data attribute)
    newDiv.setAttribute("data-idx", `${i}`);

    // call a function handleCardClick when a div is clicked on
    newDiv.addEventListener("click", handleCardClick);

    // append the div to the element with an id of game
    gameContainer.append(newDiv);

    i++;
  }

  
}

// This function takes care of loading the game screen for the first time with the best score value so far. 
function setupGame(){
  
  // createDivsForColors(cards);
  // totalNumberOfCards = colorGridDiv.childElementCount;
  // Load the best score value from local storage
  if (localStorage.getItem("bestScore")){
    gameStartScreen.querySelector("h3#best-score-val").innerText = JSON.parse(localStorage.getItem("bestScore"));
  }
}

gameStartScreen.querySelector("button#start-game-button").addEventListener("click", handleStartGame);


function handleStartGame(event){
  // numberOfCards = gameStartScreen.querySelector("")
  totalNumberOfCards = parseInt(gameStartScreen.querySelector("input#num-of-cards").value);
  if ((totalNumberOfCards < 2) || ((totalNumberOfCards%2) !== 0)){
    alert("Please enter a valid number");
    return;
  }

  // generate cards
  playingCards = generateCards(totalNumberOfCards);

  // shuffle the cards
  shuffle(playingCards);

  // generate the html elements with the shuffled cards
  createDivsForColors(playingCards);

  gameContainer.style.display = "block";
  gameStartScreen.style.display = "none";
  liveScoreDiv.style.display = "block";
  liveScoreDiv.querySelector("h3#score-value").innerText = score;
  gameOverScreen.style.display = "none" ;
}

// This function generates an array of random colored cards with size of numOfCards. 
// numOfCards: a positive even number which is at least 2.
// This DOES NOT shuffle the cards
function generateCards(numOfCards){
  let cards = [];
  let r = 0;
  let g = 0;
  let b = 0;
  for (let i = 0; i < numOfCards; i++){
    if (i%2 === 0){
      r = (Math.random()*256).toFixed(0);
      g = 255;
      b = (Math.random()*256).toFixed(0);
      cards.push(`rgb(${r},${g},${b})`);
    }
    else {
      cards.push(cards[i-1]);
    }
  }
  return cards;
}




function handleCardClick(event) {
    

    if (realTimeData.guessCounter === 0){
      realTimeData.timeoutID = setTimeout(function(){
        // if still no further guesses, then put the card face-down again
        if (realTimeData.guessCounter < 2){
          event.target.style.backgroundColor = "white";
          
          realTimeData.guessCounter --;
        }
        
         }, 1000);
        
        event.target.style.backgroundColor = event.target.getAttribute("class");
        realTimeData.guessCounter++;
        realTimeData.indices[0] = event.target.dataset.idx;
        realTimeData.types[0] = event.target.getAttribute("class");
        //Keep updating the live score
        liveScoreDiv.querySelector("h3#score-value").innerText = ++score;

    }

    else if ((realTimeData.guessCounter === 1) && ((event.target.dataset.idx !== realTimeData.indices[0]))){
      event.target.style.backgroundColor = event.target.getAttribute("class");
      realTimeData.guessCounter++;
      realTimeData.indices[1] = event.target.dataset.idx;
      realTimeData.types[1] = event.target.getAttribute("class");
      // check if two cards are match.
      if(realTimeData.types[0] === realTimeData.types[1]){
        console.log("Timeout ID ", realTimeData.timeoutID);
        clearTimeout(realTimeData.timeoutID);
        // detach the event listeners
        event.target.removeEventListener("click", handleCardClick);
        colorGridDiv.querySelector(`div[data-idx = '${realTimeData.indices[0]}']`).removeEventListener("click",handleCardClick);
        // Resetting back the counter to 0 since we have a match
        realTimeData.guessCounter = 0;
        cardsRevealed += 2;

        //Keep updating the live score
        liveScoreDiv.querySelector("h3#score-value").innerText = ++score;

        // Check if the player has finished playing. If so update some display
        // properties, and save the score 
        if (cardsRevealed === totalNumberOfCards){
          gameOverScreen.style.display = "block" ;
          // if a previous score does not exist or the current score is lower than a previous non
          // zero score, then update the local storage
          if ((!localStorage.getItem("bestScore")) || ((score !== 0) && (JSON.parse(localStorage.getItem("bestScore")) > score))){
            localStorage.setItem("bestScore", score);
          }
        }
        
      }
      else {
        clearTimeout(realTimeData.timeoutID);
        //Keep updating the live score
        liveScoreDiv.querySelector("h3#score-value").innerText = ++score;
        setTimeout(function(){
          event.target.style.backgroundColor = "white";
          colorGridDiv.querySelector(`div[data-idx = '${realTimeData.indices[0]}']`).style.backgroundColor = "white";
          realTimeData.guessCounter = 0;
        }, 1500);
      }
    }    
  }

  gameOverScreen.querySelector("button#restart-button").addEventListener(
    "click", 
    function(event){
      gameOverScreen.style.display = "none";
      cardsRevealed = 0;
      for (let element of colorGridDiv.querySelectorAll("div")){
        element.remove();
      }
      liveScoreDiv.querySelector("h3#score-value").innerText = (score = 0);
      createDivsForColors(playingCards);
    }
  );
  
  


// when the DOM loads
setupGame();
