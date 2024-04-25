const apiUrl = 'http://ai-chatbot.local/wp-json/myapi/v1/chat-bot/';
const botConfigurationUrl = 'http://ai-chatbot.local/wp-json/myapi/v1/chat-bot-config';
const copyButtons = document.querySelectorAll('.lwh-open-cbot .copy-button');
const button = document.querySelector('.lwh-open-cbot #submit-btn');
let messageInput = document.querySelector('.lwh-open-cbot #message');
let content = [];
let botConfigData = '';
let conversationTranscript = [];

function lwhOpenCbotToggleChat() {
    const chatWindow = document.querySelector(".lwh-open-cbot .chat");
    chatWindow.classList.toggle('show');
    if(chatWindow.classList.contains('show')){
        document.querySelector(".lwh-open-cbot .custom-chatbot").style.zIndex = '9999'
    }
    else{
        document.querySelector(".lwh-open-cbot .custom-chatbot").style.zIndex = '9998'
    }
}

function lwhOpenCbotonFormSubmit(event, userMessage) {
    event.preventDefault();
    if(button.disabled == true) return
    let message;
    if(userMessage == undefined){
        message = messageInput.value.trim();
        document.querySelector(".lwh-open-cbot .startup-btns").style.display = "none";
    }
    else{
        message = userMessage;
    }
    content.push({
        role: 'user',
        message: message,
    });
    let timestamp = new Date().toLocaleString();
    conversationTranscript.push({
        sender: 'user',
        time: timestamp,
        message: message,
    });
    data = "";
    if (message !== '') {
        lwhOpenCbotaddMessage('user', message);
        messageInput.value = '';
        lwhOpenCbotaddTypingAnimation('ai');
        lwhOpenCbotfetchData()
    }
}

function lwhOpenCbotaddMessage(sender, message) {
    let chatMessagesContainer = document.querySelector('.lwh-open-cbot .chat__messages');
    let messageContainer = document.createElement('div');
    messageContainer.classList.add('chat__messages__' + sender);
    let messageDiv = document.createElement('div');
    messageDiv.innerHTML = `
            ${sender === 'ai' ?
            `
                <div>
                <img width="30px" class="bot-image"
                    src="${botConfigData.botImageURL}"
                    alt="bot-image">
                </div>
                `
            : ""
        }
            <p>${message}
             </p>
            ${sender === 'user' ?
            `
                <div>
                <img width="30px" class="avatar-image"
                    src="${botConfigData.userAvatarURL}"
                    alt="avatar">
                </div>
                `
            : ""
        }
        `;
    messageContainer.appendChild(messageDiv);
    chatMessagesContainer.appendChild(messageContainer);
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

function lwhOpenCbotaddTypingAnimation(sender) {
    let chatMessagesContainer = document.querySelector('.lwh-open-cbot .chat__messages');
    let typingContainer = document.createElement('div');
    typingContainer.classList.add('chat__messages__' + sender);
    let typingAnimationDiv = document.createElement('div');
    typingAnimationDiv.classList.add('typing-animation');
    typingAnimationDiv.innerHTML = `
        <div>
        <img width="30px" class="bot-image"
            src="${botConfigData.botImageURL}"
            alt="">
        </div>
  <p>
  <svg height="16" width="40" style="max-height: 20px;">
    <circle class="dot" cx="10" cy="8" r="3" style="fill:grey;" />
    <circle class="dot" cx="20" cy="8" r="3" style="fill:grey;" />
    <circle class="dot" cx="30" cy="8" r="3" style="fill:grey;" />
  </svg>
</p>
  `;
    typingContainer.appendChild(typingAnimationDiv);
    chatMessagesContainer.appendChild(typingContainer);
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

function lwhOpenCbotreplaceTypingAnimationWithMessage(sender, message) {
    let chatMessagesContainer = document.querySelector('.lwh-open-cbot .chat__messages');
    let typingContainer = document.querySelector('.lwh-open-cbot .chat__messages__' + sender + ':last-child');
    if (typingContainer) {
        let messageContainer = document.createElement('div');
        messageContainer.classList.add('chat__messages__' + sender);
        messageContainer.classList.add('chat_messages_ai');
        let messageDiv = document.createElement('div');
        messageDiv.innerHTML = `
                ${sender === 'ai' ?
                `
                    <div>
                    <img width="30px" class="bot-image"
                        src="${botConfigData.botImageURL}"
                        alt="bot-image">
                    </div>
                    `
                : ""
            }
                <p class="typing-effect"></p>
                ${sender === 'user' ?
                `
                    <div>
                    <img width="30px" class="avatar-image"
                        src="${botConfigData.userAvatarURL}"
                        alt="avatar">
                    </div>
                    `
                : ""
            }
            `;
        messageContainer.appendChild(messageDiv);
        typingContainer.parentNode.replaceChild(messageContainer, typingContainer);
        const typingEffectElement = messageDiv.querySelector(".typing-effect");
        let index = 0;
        const typingInterval = setInterval(() => {
            typingEffectElement.textContent += message[index];
            index++;
            if (index === message.length) {
                clearInterval(typingInterval);
                typingEffectElement.insertAdjacentHTML('beforeend', `<span title="copy" class="copy-text" onclick="lwhOpenCbotcopyText(event)"><i class="fa-regular fa-copy"></i><span>copied</span></span>`);
                chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
            }
        }, 5);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }
}

function lwhOpenCbotremoveTypingAnimation() {
    let typingAnimationDivs = document.querySelectorAll('.lwh-open-cbot .typing-animation');
    typingAnimationDivs.forEach(function (typingAnimationDiv) {
        let chatMessagesAiDiv = typingAnimationDiv.closest('.chat__messages__ai');
        if (chatMessagesAiDiv) {
            chatMessagesAiDiv.parentNode.removeChild(chatMessagesAiDiv);
        }
    });
}

copyButtons.forEach(button => {
    button.addEventListener('click', function (event) {
        const codeElement = this.parentNode.nextElementSibling.querySelector('code');
        const codeText = codeElement.textContent;
        navigator.clipboard.writeText(codeText).then(function () {
            event.target.innerText = "Copied";
            setTimeout(() => {
                event.target.innerText = "Copy";
            }, 2000);
        }).catch(function (error) {
            console.error('Error copying code: ', error);
        });
    });
});

function lwhOpenCbotcopyText(event) {
    const paragraph = event.target.closest('p');
    const clone = paragraph.cloneNode(true);
    clone.querySelectorAll('.copy-text').forEach(elem => {
        elem.parentNode.removeChild(elem);
    });
    const textToCopy = clone.textContent.trim();
    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            const copiedSpan = event.target.nextElementSibling;
            copiedSpan.style.display = 'block';
            setTimeout(() => {
                copiedSpan.style.display = 'none';
            }, 2000);
        })
        .catch(error => {
            console.error('Error copying text: ', error);
        });
}

async function lwhOpenCbotfetchData() {
    button.disabled = true;
    try {
        response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "last_prompt": content[content.length - 1].message,
                "conversation_history": content.map(item => ({
                    "role": item.role,
                    "content": item.message
                }))
            })
        });
        if (response.ok) {
            data = await response.json();
            console.log(data, "Data from api");
            button.disabled = false;
            if (!data.success) {
                lwhOpenCbotremoveTypingAnimation()
                lwhOpenCbotshowPopup('Oops! Something went wrong!', '#991a1a');
                throw new Error("Something went wrong. Please Try Again!");
            }
        } else {
            lwhOpenCbotshowPopup('Oops! Something went wrong!', '#991a1a');
            throw new Error("Request failed. Please try again!");
        }
        content.push({
            role: 'assistant',
            message: data.result,
        });
        let timestamp = new Date().toLocaleString();
        conversationTranscript.push({
            sender: 'bot',
            time: timestamp,
            message: data.result,
        });
        lwhOpenCbotreplaceTypingAnimationWithMessage('ai', data.result);
    } catch (error) {
        lwhOpenCbotremoveTypingAnimation();
        lwhOpenCbotshowPopup('Oops! Something went wrong!', '#991a1a');
        console.error('There was a problem with the fetch operation:', error);
        return;
    }
}

async function lwhOpenCbotfetchBotConfiguration() {
    const chatMessagesContainer = document.querySelector(".lwh-open-cbot .chat__messages");
    document.querySelector(".lwh-open-cbot .loading").style.display = 'flex';
    chatMessagesContainer.innerHTML = '';
    let startupBtnsDiv = document.createElement('div');
    startupBtnsDiv.classList.add('startup-btns');
    chatMessagesContainer.appendChild(startupBtnsDiv);
    let botResponse = ''
    try {
        botResponse = await fetch(botConfigurationUrl);
        if (botResponse.ok) {
            botConfigData = await botResponse.json();
            console.log(botConfigData, "Data from api");
            chatMessagesContainer.style.fontSize = `${botConfigData.fontSize}px`;
            let startupBtns=''
            const startupBtnContainer = document.querySelector('.lwh-open-cbot .startup-btns');
            botConfigData.commonButtons.forEach(btn => {
                startupBtns += `<p onclick="lwhOpenCbotonFormSubmit(event, '${btn.buttonPrompt}'); lwhOpenCbothandleStartupBtnClick(event);">${btn.buttonText}</p>`;
            });            
            startupBtnContainer.innerHTML = startupBtns;
            if (botConfigData.botStatus == 1) {
                document.querySelector(".lwh-open-cbot .chat__status").innerHTML = `<span></span> Online`;
                document.querySelector(".lwh-open-cbot .chat__status").querySelector("span").style.background = "#68D391";
            }
           
            document.querySelector(".lwh-open-cbot .loading").style.display = 'none';
            lwhOpenCbotaddMessage('ai', botConfigData.StartUpMessage);
            content.push({
                role: 'assistant',
                message: botConfigData.StartUpMessage,
            });
            let timestamp = new Date().toLocaleString();
            conversationTranscript.push({
                sender: 'bot',
                time: timestamp,
                message: botConfigData.StartUpMessage,
            });
        } else {
            document.querySelector(".lwh-open-cbot .loading").style.display = 'none';
            lwhOpenCbotshowPopup('Oops! Something went wrong!', '#991a1a');
            throw new Error("Request failed. Please try again!");
        }
    } catch (error) {
        lwhOpenCbotshowPopup('Oops! Something went wrong!', '#991a1a');
        button.disabled = true
        console.error('There was a problem with the fetch operation:', error);
        return;
    }
}

function lwhOpenCbotshowPopup(val, color) {
    button.disabled = false;
    const popup = document.querySelector('.lwh-open-cbot .popup');
    popup.style.display = 'block';
    popup.style.opacity = 1;
    const innerPopup = popup.querySelector('p');
    innerPopup.innerText = val;
    innerPopup.style.color = color;
    popup.classList.add('popup-animation');
    setTimeout(() => {
        popup.classList.remove('popup-animation');
        popup.style.display = 'none';
        popup.style.opacity = 0;
    }, 3000);
}


function lwhOpenCbothandleStartupBtnClick(event){
    const startupBtnContainer = event.target.parentNode;
    startupBtnContainer.style.display = 'none';
}

lwhOpenCbotfetchBotConfiguration();
