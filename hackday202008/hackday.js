/*
let maybeText = document.querySelectorAll("div.c-article-text > p")
maybeText[0].textContent

(function() {
	let tags = ["https://cdnjs.cloudflare.com/ajax/libs/randomcolor/0.6.1/randomColor.min.js","https://gist.githubusercontent.com/grgbrn/c98ee99d9815e704ad8403b6b0092728/raw/hackday.js"]
	console.log(`inserting script tags:${tags}`)
	tags.forEach(scriptUrl => {
	  let s = document.createElement('script');
	  s.setAttribute('src',scriptUrl);
	  document.body.appendChild(s);
	})
})()
*/

// https://stackoverflow.com/questions/811195/fast-open-source-checksum-for-small-strings
function checksum(s) {
	var chk = 0x12345678;
	var len = s.length;
	for (var i = 0; i < len; i++) {
		chk += (s.charCodeAt(i) * (i + 1));
	}
	return (chk & 0xffffffff).toString(16);
}

function selectionToReference() {
	let s = document.getSelection()

	if (s.anchorNode !== s.focusNode) {
		console.log("text selection extends across paragraphs!")
		return null
	}

	// console.log(`anchorOffset=${s.anchorOffset}`)
	// console.log(`focusOffset=${s.focusOffset}`)

	let allParagraphs = document.querySelectorAll("div.c-article-text > p")

	// keep in mind this is zero-indexed :/
	// return paragraph id
	let whichParagraph = function(node) { 
		for (var i = 0; i < allParagraphs.length; i++) {
			if (node == allParagraphs[i]) {
				return i
			}
		}
		return null
	}

	let n = s.anchorNode
	while (n) {
		let paragraphNum = whichParagraph(n)
		if (paragraphNum !== null) {
			return {
				paragraph: paragraphNum,
				paragraphHash: checksum(allParagraphs[paragraphNum].textContent),
				startOffset: s.anchorOffset,
				endOffset: s.focusOffset,
				text: s.toString()
			}
		}
		n = n.parentNode
	}
	console.log("reached root without finding paragraph")
	return null
}

function setSelectionFromReference(ref, scrollIntoView) {
	let allParagraphs = document.querySelectorAll("div.c-article-text > p")
	let pNode = allParagraphs[ref.paragraph]
	let textNode = pNode.childNodes[0]

	let hash = checksum(pNode.textContent)
	// console.log(hash)

	if (ref.paragraphHash !== hash) {
		console.log("!!! text has been edited since reference was created")
		return
	}

	let range = document.createRange()
	range.setStart(textNode, ref.startOffset)
	range.setEnd(textNode, ref.endOffset)

	let sel = window.getSelection()
	sel.removeAllRanges()
	sel.addRange(range)

	if (scrollIntoView) {
		pNode.scrollIntoView()
	}
}
