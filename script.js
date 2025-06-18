let prompt = document.querySelector("#prompt");
let chatContainer = document.querySelector(".chat-container");
let imagebtn = document.querySelector("#image");
let imageinput = document.querySelector("#image input");
let image = document.querySelector("#image img");

const myProfile = {
    name: "Piyush",
    traits: "Friendly, tech-savvy, and always learning new things",
    background: "I work in web development and specialize in JavaScript",
    preferences: "I respond casually but professionally, with occasional emojis 😊",
    commonAnswers: {
        "who are you": "I'm Piyush! A web developer who loves building AI projects.",
        "what do you do": "I create web applications and teach coding in my free time",
        "your skills": "JavaScript, React, Node.js, and API integrations",
        "hobbies": "Coding, chess, and sci-fi movies 🎬",
        "favorite food": "Pizza! 🍕 (especially with extra cheese)"
    }
};

const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyB0vyBBFWJprw1914BWZCjNS_g0ix_xxNI";

let user = {
    message: null,
    file: {
        mime_type: null,
        data: null
    }
};

function createChatBox(html, classes) {
    let div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);
    return div;
}

function handleChatResponse(userMessage) {
    if (!userMessage.trim()) return; // Don't send empty messages
    
    user.message = userMessage;
    let html = `<img src="user.png" alt="" id="userav" width="50">
        <div class="user-chat-area">
            ${user.message}
            ${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />` : ''}
        </div>`;
    prompt.value = "";
    let userChatBox = createChatBox(html, "user-chat-box");
    chatContainer.appendChild(userChatBox);
    chatContainer.scrollTo({top: chatContainer.scrollHeight, behavior: "smooth"});

    setTimeout(() => {
        let html = `<img src="bot.png" alt="Bot Avatar" id="botav" width="50">
            <div class="ai-chat-area">
                <img src="load.gif" alt="" class="load" width="20px">
            </div>`;
        let aichatBox = createChatBox(html, "ai-chat-box");
        chatContainer.appendChild(aichatBox);
        generateResponse(aichatBox);
    }, 600);
}

async function generateResponse(aichatBox) {
    const lowerMessage = user.message.toLowerCase();
    let predefinedAnswer = null;
    
    for (const [question, answer] of Object.entries(myProfile.commonAnswers)) {
        if (lowerMessage.includes(question)) {
            predefinedAnswer = answer;
            break;
        }
    }
    
    if (predefinedAnswer) {
        aichatBox.querySelector(".ai-chat-area").innerHTML = predefinedAnswer;
        chatContainer.scrollTo({top: chatContainer.scrollHeight, behavior: "smooth"});
        return;
    }
    
    let RequestOptions = {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            "contents": [{
                "parts": [
                    {
                        "text": `Act as ${myProfile.name}. Personality: ${myProfile.traits}. ` +
                                `Background: ${myProfile.background}. Style: ${myProfile.preferences}. ` +
                                `Respond to: "${user.message}"`
                    },
                    (user.file.data ? {"inline_data": user.file} : {})
                ]
            }]
        })
    };
    
    try {
        let response = await fetch(Api_Url, RequestOptions);
        let data = await response.json();
        let apiResponse = data.candidates[0].content.parts[0].text.replace(/<[^>]*>/g, '').trim();
        aichatBox.querySelector(".ai-chat-area").innerHTML = apiResponse;
    } catch(error) {
        console.error(error);
        aichatBox.querySelector(".ai-chat-area").innerHTML = "hi, i am piyush kumar a fun guy who loves to learn new things , likes anime and pizza, the question you you aked i am not yet trained for that , thanks for using me 😊 . try asking questions like (who are you), (what do you do),(your skills, (hobbies),(Favourote Food)"; 
    } finally {
        chatContainer.scrollTo({top: chatContainer.scrollHeight, behavior: "smooth"});
        image.src = `img.svg`;
        image.classList.add("choose");
        user.file = {};
    }
}

// Event Listeners
prompt.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault(); // Prevent default form submission
        handleChatResponse(prompt.value);
    }
});

imageinput.addEventListener("change", (e) => {
    const file = imageinput.files[0];
    if (!file) return;
    
    let reader = new FileReader();
    reader.onload = (e) => {
        let base64string = e.target.result.split(",")[1];
        user.file = {
            mime_type: file.type,
            data: base64string
        };
        image.src = `data:${user.file.mime_type};base64,${user.file.data}`;
        image.classList.add("choose");
    };
    reader.readAsDataURL(file);
});

imagebtn.addEventListener("click", () => {
    imageinput.click();
});