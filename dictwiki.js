var dictwiki = {
		wikiUrl: "http://en.wiktionary.org/wiki/",
		englishHash: "#English",
		baseUrl: "http://en.wiktionary.org/w/api.php?action=query&prop=revisions&rvprop=content&format=json&",
		langprops: "&prop=langlinks&lllimit=500",
		popup: "width=900,height=400,status=yes,resizable=yes",
		englishStr: "==English==",
		goodCount: 0, 
		badCount : 0,
};

function lookupWordHandler() {
	// Get word
	var word = document.getElementById("theWord").value;
	lookUpWord(word, "lookUpCallback");
}

function lookUpWord(word, callback) {
	clearLast();
	var url = dictwiki.baseUrl + "callback=" + callback + "&titles=" + word;
	var jsonp = "jsonp";
	
	var newScriptElement = document.createElement("script");
	newScriptElement.setAttribute("src", url);
	newScriptElement.setAttribute("id", jsonp);
	var old = document.getElementById(jsonp);
	var head = document.getElementsByTagName("head")[0];
	if (old === null) {
		head.appendChild(newScriptElement);
	} else {
		head.replaceChild(newScriptElement, old);
	}

	// Sync request
// var httpReq = new XMLHttpRequest();
// httpReq.open("GET", url, false);
// httpReq.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
// httpReq.send(null);
// if (httpReq.status !== 200) {
// alert("Request url: " + url + " failed: " + httpReq.statusText);
// }
// var response = JSON.parse(httpReq.responseText);
	
}

// {"query":{"pages":{"-1":{"ns":0,"title":"testx","missing":""}}}}
// {"query":{"pages":{"27637":{"pageid":27637,"ns":0,"title":"test"}}}}
// {"query":{"pages":{"27637":{"pageid":27637,"ns":0,"title":"test","langlinks":[{"lang":"ar","*":"test"},{"lang":"br","*":"test"},{"lang":"ca","*":"test"},
			//{"lang":"cs","*":"test"},{"lang":"cy","*":"test"},{"lang":"de","*":"test"},
function lookUpCallback(response) {
// alert("Got a response: " + JSON.stringify(response));
	var query = response.query;
	var place = document.getElementById("lookUpResult");
	var word;
	for (var result in query.pages) {
		var page = query.pages[result];
		var wordLabel = document.createElement("p");
		var revisions = [];
		if (page["pageid"] !== undefined) {
			wordLabel.setAttribute("id", page["pageid"]);
			word = page["title"];
			var result = "<p>"+ word + " is a word";
			var english = false, content = "", posEnglish;
			revisions = page["revisions"];
			for (var i=0; i<revisions.length; i++) {
				var revision = revisions[i];
				if (revision !== undefined) {
					content = revision["*"];
					posEnglish = content.indexOf(dictwiki.englishStr, 0);
					if (posEnglish != -1) {
						english = true;
					}
				}
			}
//			langList = page["langlinks"];
//			if (langList !== undefined) {
//				for (var i=0; i<langList.length; i++) {
//					var lang = langList[i];
//					if (lang["lang"] === "uk") {
//						english = true;
//					}
//				}
//			}
			if (!english) {
				result += " - but it aint english";
			}
			result += "</p>";
			wordLabel.innerHTML = result;
			//Open a pop up to show the wiki dictionary page
			window.open(dictwiki.wikiUrl + word + dictwiki.englishHash, word, dictwiki.popup);
		} else {
			wordLabel.setAttribute("id", "failed");
			wordLabel.innerHTML = "<p>"+ page["title"] + " is not an english word</p>";
		}
		place.appendChild(wordLabel);
	}

}

function tryCallback(response) {
// alert("Got a response: " + JSON.stringify(response));
	var query = response.query;
	var place = document.getElementById("words");
	for (var result in query.pages) {
		var page = query.pages[result];
		if (page["pageid"] !== undefined) {
			var english = false, content = "", posEnglish;
			revisions = page["revisions"];
			for (var i=0; i<revisions.length; i++) {
				var revision = revisions[i];
				if (revision !== undefined) {
					content = revision["*"];
					posEnglish = content.indexOf(dictwiki.englishStr, 0);
					if (posEnglish != -1) {
						english = true;
					}
				}
			}
			if (english) {
				var wordLabel = document.createElement("p");
				wordLabel.setAttribute("id", page["title"]);
				wordLabel.setAttribute("class", "word");
				wordLabel.innerHTML = "<p>"+ page["title"] + "</p>";
				wordLabel.onclick = function() { window.open(dictwiki.wikiUrl + page["title"] + dictwiki.englishHash, page["title"], dictwiki.popup);};
				place.appendChild(wordLabel);
				dictwiki.goodCount++;
			} else {
				dictwiki.badCount++;
			}
		} else {
			dictwiki.badCount++;
		}
	}
	// Report progress
	var place = document.getElementById("count");
	var countId = "counter", total = dictwiki.goodCount + dictwiki.badCount;
	var countElement = document.getElementById(countId);
	var countLabel = document.createElement("p");
	countLabel.setAttribute("id", countId);
	countLabel.setAttribute("class", "result");
	countLabel.innerHTML = "<p>Responses: " + total + " Good: " + dictwiki.goodCount + " Non words: " + dictwiki.badCount + "</p>";
	if (countElement !== null) {
		place.replaceChild(countLabel, countElement);
	} else {
		place.appendChild(countLabel);
	}

}

function clearLast(){
	// Clear out old words
	var place = document.getElementById("lookUpResult");
	deleteChildren(place, "p");
	place = document.getElementById("words");
	deleteChildren(place, "p");
	place = document.getElementById("try");
	deleteChildren(place, "p");
	place = document.getElementById("count");
	deleteChildren(place, "p");
	dictwiki.goodCount = 0;
	dictwiki.badCount = 0;
}

function deleteChildren(place, tagName) {
	var labels = place.getElementsByTagName(tagName);
	while (labels.length > 0) {
		place.removeChild(labels[0]);
	}
}

function feudHandler() {
	clearLast();
	// Get fixed letters into an array
	var fixed = [];
	var letterElement = "letter";
	var numFixed = 0;
	for(var i=0; i<7; i++) {
		var letterEle = document.getElementById(letterElement + i);
		if (letterEle === null) {
			break;
		} else {
			var letter = letterEle.value;
			fixed[i] = letter;
			if (letter !== "" && letter !== " ") {
				numFixed++;
			} else {
				fixed[i] = "";
			}
		}
	}
	var numBlanks = fixed.length - numFixed;
	// Retreive letters to try
	var letterVal = document.getElementById("letters").value;
	var letters = [];
	for (var i=0; i<letterVal.length; i++) {
		letters[i] = letterVal.charAt(i);
	}
	var tries = generateLetters([], letters, numBlanks);
	var i, j;
	var place = document.getElementById("try");
	for (i=0; i<tries.length; i++) {
		var letPos = 0, word = "";
		for (j=0; j<fixed.length; j++) {
			if (fixed[j] === "") {
				word += tries[i][letPos++];
			} else {
				word += fixed[j];
			}
		}
		var html = 	"<p>Looking up: " + word + "</p>";
		reportStatus(place, html);
		lookUpWord(word, "tryCallback");
	}
	reportStatus(place, "<p class='result'>Complete: " + tries.length + " words looked up</p>");
}

function reportStatus(place, html) {
	var tryId = "trying";
	var tryElement = document.getElementById(tryId);
	var wordLabel = document.createElement("p");
	wordLabel.setAttribute("id", tryId);
	wordLabel.innerHTML = html;
	if (tryElement !== null) {
		place.replaceChild(wordLabel, tryElement);
	} else {
		place.appendChild(wordLabel);
	}
}

function generateLetters(stem, letters, numSlots) {
	var i;
	var lettersToTry = [], tries = [];
	
	for (i=0; i<letters.length; i++) {
		if (numSlots === 1) {
			// Can generate actual tries
			lettersToTry = stem.concat(letters[i]);
			tries.push(lettersToTry);
		} else {
			var nextStem = stem.concat(letters[i]);
			var nextLetters = [];
			var sliceStart = i+1;
			var sliceEnd = letters.length;
			for (var j=sliceStart; j<sliceEnd; j++) {
				nextLetters.push(letters[j]);
			}
			sliceStart = 0;
			sliceEnd = i;
			for (var j=sliceStart; j<sliceEnd; j++) {
				nextLetters.push(letters[j]);
			}
			// Recurse
			var newTries = generateLetters(nextStem, nextLetters, numSlots-1);
			for (var j=0; j<newTries.length; j++) {
				tries.push(newTries[j]);
			}
		}
	}
	return tries;
}

function addLetterHandler() {
	// Add another letter
	var letters = document.getElementById("letterSlots");
	var letterStem = "letter";
	for(var i=0; i<10; i++) {
		var letterId = letterStem + i;
		var letterElement = document.getElementById(letterId);

		if (letterElement === null) {
			var newLetter = document.createElement("input");
			newLetter.setAttribute("type", "text");
			newLetter.setAttribute("class", "tile");
			newLetter.setAttribute("id", letterId);
			newLetter.setAttribute("size", "1");
			newLetter.setAttribute("maxLength", "1");
			letters.appendChild(newLetter);
			break;
		}
	}
}

function deleteLetterHandler() {
	// Add another letter
	var letters = document.getElementById("letterSlots");
	var children = letters.getElementsByTagName("input");
	letters.removeChild(children[children.length - 1]);
}

onload = function() {
	var button = document.getElementById("lookupButton");
	button.onclick = lookupWordHandler;
	button = document.getElementById("feud");
	button.onclick = feudHandler;
	button = document.getElementById("addLetter");
	button.onclick = addLetterHandler;
	button = document.getElementById("deleteLetter");
	button.onclick = deleteLetterHandler;
	
};  