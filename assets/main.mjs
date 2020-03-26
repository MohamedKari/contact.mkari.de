let isSet = false
let terminal = undefined
let fastForward = false

let lastTouch = undefined
let admissibleDoubleTouchInterval = 200

document.addEventListener("DOMContentLoaded", ready)



async function ready() {
    window.addEventListener("keydown", event => {
        if([13, 27, 32].includes(event.keyCode)){
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

    terminal = document.getElementById("terminal")

    const defaultTypingStyle = {
        "lowerBound": parseInt(terminal.attributes["data-typing-style-lower"].value),
        "upperBound": parseInt(terminal.attributes["data-typing-style-upper"].value),
    }

    const commandSequenceElement = convertNoscriptToDiv("noscript-comand-sequence", "command-sequence")
    const commandElements = commandSequenceElement.getElementsByClassName("command")

    const commands = Array.from(commandElements).map( (element) => 
        getCommandFromCommandElement(element, defaultTypingStyle)
    )

    prepareCommands(commands)
    
    document.getElementById("terminal").appendChild(
        commandSequenceElement               
    )

    await typeCommands(commands)   
    
}

function convertNoscriptToDiv(noscriptid, newid){
    const noscript = document.getElementById(noscriptid)
    const div = document.createElement("div")
    div.innerHTML = noscript.innerText
    div.id = newid
    noscript.parentElement.removeChild(noscript)
    return div
}

function getCommandFromCommandElement(commandElement, defaultTypingStyle){
    const command = {
        prompt:     commandElement.getElementsByClassName("prompt")[0],
        type:       commandElement.getElementsByClassName("type")[0],
        cursor:     commandElement.getElementsByClassName("cursor")[0],
        output:     commandElement.getElementsByClassName("output")[0], 
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
        await delay(command.typeDelay)
        show(command.type)
        await typeInput(command.type, typeText, command.typingStyle)
        hide(command.cursor)
        await delay(command.outputDelay)
        show(command.output)
    }
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
        const pause = getPause(typingStyle)
        await delay(pause)
    }
}

function processOutput(outputText){
    let outputString = undefined
    if(typeof outputText === "string"){
        outputString = outputText
    } else if (Array.isArray(outputText)){
        outputString = outputText.join("\n")
    } else if (outputText.hasOwnProperty("mobile") && outputText.hasOwnProperty("desktop")) {
        if (window.matchMedia("(max-width: 600px)").matches){
            outputString = processOutput(outputText.mobile)
        } else {
            outputString = processOutput(outputText.desktop)
        }
    } else {
        throw "Output format not recognized for outputText..."
    }

    outputString = outputString.replace("$(date)", getDateString())

    return outputString
}


// json styling

function getPause(typingStyle){
    if(fastForward){
        return 0
    }
    
    return randint(typingStyle.lowerBound, typingStyle.upperBound)
}

async function delay(t, v){
    let checkInterval = 100
    let checkCount = Math.floor(t/checkInterval)
    let finalCheckDuration = t % checkInterval

    for(let i=0; i<checkCount; i++){
        if(!fastForward) await _delay(checkInterval)
    }

    if(!fastForward) await _delay(finalCheckDuration)
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
