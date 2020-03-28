let fastForward = false

let lastTouch = undefined
let admissibleDoubleTouchInterval = 200

document.addEventListener("DOMContentLoaded", ready)

async function ready() {
    const KEY_CR = 13
    const KEY_ESC = 27
    const KEY_SPACE = 32

    window.addEventListener("keydown", event => {
        if([KEY_CR, KEY_ESC, KEY_SPACE].includes(event.keyCode)){
            fastForward = true
        }
    })

    window.addEventListener("touchstart", event => {
        const now = Date.now()
        if(now - lastTouch < admissibleDoubleTouchInterval){
            fastForward = true
        }
        lastTouch = now
    })

    let terminal = document.getElementById("terminal")

    const commandSequenceElement = convertNoscriptToDiv("noscript-comand-sequence", "command-sequence")
   
    const commandElements = commandSequenceElement.getElementsByClassName("command")
    const commands = commandElementsToCommands(commandElements, getDefaultTypingStyle(terminal))
    prepareCommands(commands)

    terminal.appendChild(commandSequenceElement)

    await typeCommands(commands)   
}

function getDefaultTypingStyle(terminal){
    return {
        lowerBound: parseInt(terminal.attributes["data-typing-style-lower"].value),
        upperBound: parseInt(terminal.attributes["data-typing-style-upper"].value),
    }
}

function commandElementsToCommands(commandElements, defaultTypingStyle){
    return Array.from(commandElements).map( (element) => 
        getCommandFromCommandElement(element, defaultTypingStyle)
    )
}

function convertNoscriptToDiv(noscriptid, newid){
    const noscript = document.getElementById(noscriptid)
    const div = document.createElement("div")
    div.innerHTML = noscript.innerText
    div.id = newid
    noscript.parentElement.removeChild(noscript)
    return div
}

function preprocessOutput(output){
    let preprocessedOutput = output
    const elementsToPreprocess = output.querySelectorAll("[data-preprocess]")

    for(let element of elementsToPreprocess){
        console.log(element)
        if(element.getAttribute("data-preprocess") == "replace-by-date"){
            element.innerHTML = getDateString()
        }
    }

    return preprocessedOutput
}

function getCommandFromCommandElement(commandElement, defaultTypingStyle){
    const command = {
        prompt:     commandElement.getElementsByClassName("prompt")[0],
        type:       commandElement.getElementsByClassName("type")[0],
        cursor:     commandElement.getElementsByClassName("cursor")[0],
        output:     preprocessOutput(commandElement.getElementsByClassName("output")[0]), 
    }

    command.typeDelay = parseInt(command.type.attributes["data-delay"].value)
    command.outputDelay = parseInt(command.output.attributes["data-delay"].value)

    const currentTypingStyleLower = command.type.attributes["data-typing-style-lower"]
    const currentTypingStyleUpper = command.type.attributes["data-typing-style-upper"] 

    command.typingStyle = {
        "lowerBound": currentTypingStyleLower && currentTypingStyleLower.value && parseInt(currentTypingStyleLower.value) || defaultTypingStyle.lowerBound,
        "upperBound": currentTypingStyleUpper && currentTypingStyleUpper.value && parseInt(currentTypingStyleUpper.value)|| defaultTypingStyle.upperBound
    }

    return command
}

function prepareCommands(commands){
    for(let command of commands){
        hide(command.prompt)
        hide(command.type)
        hide(command.cursor)
        hide(command.output)
    }
}

function show(element){
    element.classList.remove("nodisplay")
}

function hide(element){
    element.classList.add("nodisplay")
}


async function typeCommands(commands){

    for(let command of commands){
        const typeText = String(command.type.innerText).trim()
        command.type.innerHTML = ""

        show(command.prompt)
        show(command.cursor)
        await delay_responsively(command.typeDelay)
        show(command.type)
        await typeInput(command.type, typeText, command.typingStyle)
        hide(command.cursor)
        await delay_responsively(command.outputDelay)
        show(command.output)
    }
}

async function typeInput(element, text, typingStyle){

    for(let i=0; i<text.length; i++){
        let char = text.charAt(i)
        
        element.insertAdjacentText("beforeend", char)
        const pause = getPause(typingStyle)
        await delay_responsively(pause)
    }
}


function getPause(typingStyle){
    if(fastForward){
        return 0
    }
    
    return randint(typingStyle.lowerBound, typingStyle.upperBound)
}

async function delay_responsively(t, v){
    let checkInterval = 100
    let checkCount = Math.floor(t/checkInterval)
    let finalCheckDuration = t % checkInterval

    for(let i=0; i<checkCount; i++){
        if(!fastForward) await delay(checkInterval, v)
    }

    if(!fastForward) await delay(finalCheckDuration, v)
}

function delay(t, v) {
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
