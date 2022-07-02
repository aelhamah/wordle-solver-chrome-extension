
function getPossibilitiesRunner(knownWords) {
  // get all of game-rows
  let gameRows = document.getElementsByClassName("Row-module_row__dEHfN");
  // query select the divs
  // let gameRows = app.querySelectorAll("game-row")

  final_word = [undefined, undefined, undefined, undefined, undefined];
  // key is the letter, value is the list of indices where it doesn't belong
  yellow_letters = {};
  black_letters = [];

  for (let i = 0; i < gameRows.length; i++) {
    let gameRow = gameRows[i];
    // get the game-tiles
    let gameTiles = gameRow.getElementsByClassName("Tile-module_tile__3ayIZ");
    for (let j = 0; j < gameTiles.length; j++) {
      let gameTile = gameTiles[j];
      let letter = gameTile.innerText.toLowerCase();
      let evaluation = gameTile.getAttribute("data-state");

      if (evaluation == "correct") {
        final_word[j] = letter;
      } else if (evaluation == "present") {
        if (yellow_letters[letter] == undefined) {
          yellow_letters[letter] = [];
        }
        yellow_letters[letter].push(j);
      } else if (evaluation == "absent") { 
        black_letters.push(letter);
      }
    }
  }

  // generate the possibilities
  possibilities = [];

  // for each word in the known words
  for (let i = 0; i < knownWords.length; i++) {
      let word = knownWords[i];

      // Check the black letters
      // if any of the black letters are in the word, skip over this word
      let black_letter_in_word = false;
      for (let j = 0; j < black_letters.length; j++) {
        // if the black letter is in the final_word, continue
        if (final_word.indexOf(black_letters[j]) > -1) {
          continue;
        }
        // if the letter is in yellow letters continue
        if (black_letters[j] in yellow_letters) {
          continue;
        }
        if (word.includes(black_letters[j])) {
            black_letter_in_word = true;
            break;
        }
      }
      if (black_letter_in_word) {
          continue;
      }

      // Check green letters
      // check that the word contains all of the green letters in the correct positions in final word
      valid_word = true;
      for (let j = 0; j < final_word.length; j++) {
          if (final_word[j] == undefined) {
              continue;
          } else if (word[j] != final_word[j]) {
              valid_word = false;
              break;
          }
      }
      if (!valid_word) {
          continue;
      }

      // Check the yellow letters
      // yellow letters is a dictionary of the letters that are in the word and the value is a list of indices where it doesn't belong
      should_skip = false;
      for(let letter in yellow_letters) {
        if (!word.includes(letter)) {
          should_skip = true;
          break;
        }
        for (let i = 0; i < yellow_letters[letter].length; i++) {
          let pos = yellow_letters[letter][i];
          if (word[pos] == letter) {
            should_skip = true;
            break;
          }
        }
      }

      if (should_skip) {
        continue;
      }

      // if we get here, the word is valid
      possibilities.push(word);
  }
  // generate the possibilities
  console.log("possibilities: ", possibilities);

  // create a ul
  let ul = document.createElement("ul");
  // add each element of letters to the ul "possibilities"
  for (let i = 0; i < possibilities.length; i++) {
    let li = document.createElement("li");
    li.innerText = possibilities[i];
    ul.appendChild(li);
  }
  return ul.innerHTML;
}

async function runner() {
  let response = await fetch("knownwords.json");
  let knownWords = await response.json();
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: getPossibilitiesRunner,
    args: [knownWords],
  }, (result) => {
    // get possibilities element
    document.getElementById("possibilities").innerHTML = result[0].result;
    // add a click event listener to each item
    let items = document.getElementsByTagName("li");
    for (let i = 0; i < items.length; i++) {
      items[i].addEventListener("click", async (e) => {
          // get the current word
          console.log(e.path[0].innerText);
        let word = e.path[0].innerText
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: fillelems,
          args: [word],
        })
      });
    }
  });
}

runner();
