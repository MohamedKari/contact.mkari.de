let isSet = false
let terminal = undefined
let fast_forward = false

document.addEventListener("DOMContentLoaded", ready)

async function ready() {
    window.addEventListener("keydown", handleKeyDown)
    terminal = document.getElementById("terminal")    

    const response = await fetch("./content.json")
    const contentDict = await response.json()
    
    await typeContent(contentDict)
}

function handleKeyDown(event){
    if([13, 27, 32].includes(event.keyCode)){
        fast_forward = true
    }
}

async function typeContent(contentDict){
    
    const prompt = getPromptString(contentDict.prompt)
    const typingStyle = contentDict.typingStyle
    const promptDelay = contentDict.promptDelay
    const outputDelay = contentDict.outputDelay

    const commandSequence = contentDict.commandSequence

    for(let i=0; i<commandSequence.length; i++){
        const command = commandSequence[i]
        const inputText = command.input
        const outputText = command.output

        let currentPrompt = getPromptString(command.prompt) || prompt
        let currentTypingStyle = command.typingStyle || typingStyle
        let currentPromptDelay = command.promptDelay || promptDelay
        let currentOutputDelay = command.outputDelay || outputDelay

        const promptElement = document.createElement("span")
        promptElement.classList.add("prompt")
        promptElement.innerHTML = currentPrompt

        const typeElement = document.createElement("span")
        typeElement.classList.add("type")

        const cursorElement = document.createElement("span")
        cursorElement.classList.add("cursor")
        cursorElement.classList.add("nodisplay")
        cursorElement.innerHTML = "▌"

        const inputElement = document.createElement("div")
        inputElement.classList.add("input")
        inputElement.appendChild(promptElement)
        inputElement.appendChild(typeElement)
        inputElement.appendChild(cursorElement)

        const outputElement = document.createElement("div")
        outputElement.classList.add("output")
        outputElement.classList.add("nodisplay")
        outputElement.classList.add("pre-wrap")
        outputElement.innerHTML = processOutput(outputText)

        const commandElement = document.createElement("div")
        commandElement.classList.add("command")
        commandElement.id = String(i)
        commandElement.appendChild(inputElement)
        commandElement.appendChild(outputElement)
        
        terminal.insertAdjacentElement("beforeend", commandElement) 

        show(cursorElement)
        await delay(currentPromptDelay)
        await typeInput(typeElement, inputText, currentTypingStyle)
        hide(cursorElement)
        await delay(currentOutputDelay)
        show(outputElement)
    }
}

function show(element){
    element.classList.remove("nodisplay")
}

function hide(element){
    element.classList.add("nodisplay")
}

function getPromptString(promptObject){
    if(promptObject){
        return `${promptObject.username}@${promptObject.hostname}:${promptObject.dir} $ `
    }
}

async function typeInput(element, text, typingStyle){
    for(let i=0; i<text.length; i++){
        let char = text.charAt(i)
        
        element.insertAdjacentText("beforeend", char)

        await delay(getPause(typingStyle))
    }
}

function processOutput(outputText){
    let outputString = undefined
    if(typeof outputText === "string"){
        outputString = outputText
    } else if (Array.isArray(outputText)){
        outputString = outputText.join("\n")
    } else {
        outputString = JSON.stringify(outputText, null, "  ")
    }

    outputString = outputString.replace("$(date)", )

    return outputString
}

// touch event
// json styling

function getPause(typingStyle){
    if(fast_forward){
        return 0
    }
    
    return randint(typingStyle.lowerBound, typingStyle.upperBound)
}

async function delay(t, v){
    let checkInterval = 100
    let checkCount = Math.floor(t/checkInterval)
    let finalCheckDuration = t % checkInterval

    for(let i=0; i<checkCount; i++){
        if(!fast_forward) await _delay(checkInterval)
    }

    if(!fast_forward) await _delay(finalCheckDuration)
}

function _delay(t, v) {
    return new Promise(function(resolve) { 
        setTimeout(resolve.bind(null, v), t);
    });
} 
 
 function randint(min, max) {
     return Math.random() * (max - min) + min;
 }


 function getDateString() {
    let d = String(new Date())
    return d.slice(0, 11) + d.slice(16, 31)
 }
