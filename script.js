const mainContainer = document.querySelector(".main-container");

const textarea = document.getElementById("textarea");
const sendBtn = document.getElementById("input-sendBtn");

const headerModelIconBtn = document.getElementById("header-model-icon-btn");
const headerModelIcon = document.getElementById("header-model-icon")

const modelSelectorContainer = document.querySelector(".model-selector-container");
const modelSelectorBtns = document.querySelectorAll(".model-selector-btn")


const messages = document.getElementById("messages");
const MAX_TURNS_SENT = 4;
const history = [];
let waiting = false;

function addMessage(text, cls, prefix) {
    const div = document.createElement("div");
    div.className = `msg ${cls}`;
    div.textContent = `${prefix} : ${text}`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
}

async function send() {
    const message = textarea.value.trim();
    if (!message || waiting) return;

    waiting = true;
    sendBtn.disabled = true;
    addMessage(message, "user", "You");
    textarea.value = "";
    textarea.style.height = "100px";
    const pending = addMessage("…", "bot pending", "Gargantua");

    try {
        const r = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, history: history.slice(-MAX_TURNS_SENT) }),
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || `Error ${r.status}`);
        pending.textContent = `Gargantua : ${data.reply}` || "empty response";
        pending.classList.remove("pending");
        history.push({ role: "user", content: message }, { role: "assistant", content: data.reply });
    } catch (err) {
        pending.innerHTML = '<span>Gargantua does not respond. Try reloading the page.</span>';
        pending.className = "msg error";
    } finally {
        waiting = false;
        sendBtn.disabled = false;
    }
    
    if (pending.textContent.includes("```")) {
        const regex = /```([\s\S]*?)(?:```|$)/;
        const match = pending.textContent.match(regex);

        let codeContent = "";
        if (match) {
            codeContent = match[1];
            pending.textContent = pending.textContent.replace(regex, "");
        }

        const template = document.getElementById("template");
        const clone = template.content.cloneNode(true);

        const targetElement = clone.firstElementChild;
        if (targetElement) {
            targetElement.dataset.code = codeContent;
        }

        messages.appendChild(clone);

        pending.textContent = pending.textContent.replace(/```[\s\S]*?(```|$)/g, "");
    }
}


sendBtn.addEventListener("click", (e) => {
    send();
    const ripple = document.createElement("span")
    const rect = sendBtn.getBoundingClientRect()

    ripple.style.width = Math.max(rect.width, rect.height) + "px";
    ripple.style.height = Math.max(rect.width, rect.height) + "px";
    ripple.classList.add("ripple");

    ripple.style.left = `${e.clientX - rect.left - Math.max(rect.width, rect.height) / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - Math.max(rect.width, rect.height) / 2}px`;

    sendBtn.appendChild(ripple);

    textarea.focus();

    ripple.addEventListener("transitionend", () => {
        ripple.remove();
    })
});
textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
    }
});

headerModelIconBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    headerModelIcon.classList.toggle("open")
    modelSelectorContainer.classList.toggle("open")
    mainContainer.classList.toggle("focus")
})

mainContainer.addEventListener("click", (e) => {
    if (modelSelectorContainer.contains(e.target)) return;

    headerModelIcon.classList.remove("open");
    modelSelectorContainer.classList.remove("open");
    mainContainer.classList.remove("focus");
});

modelSelectorBtns.forEach(modelSelectorBtn => {
    modelSelectorBtn.addEventListener("click", (e) => {
        const ripple2 = document.createElement("span")
        const rect2 = modelSelectorBtn.getBoundingClientRect()

        ripple2.style.width = Math.max(rect2.width, rect2.height) + "px";
        ripple2.style.height = Math.max(rect2.width, rect2.height) + "px";
        ripple2.classList.add("ripple");

        ripple2.style.left = `${e.clientX - rect2.left - Math.max(rect2.width, rect2.height) / 2}px`;
        ripple2.style.top = `${e.clientY - rect2.top - Math.max(rect2.width, rect2.height) / 2}px`;

        modelSelectorBtn.appendChild(ripple2)
        ripple2.addEventListener("transitionend", () => {
            ripple2.remove();
        })


        const isAlreadySelected = modelSelectorBtn.getAttribute('aria-pressed') === 'true';
        if (isAlreadySelected) return;

        modelSelectorBtns.forEach(modelSelectorbtns => modelSelectorbtns.setAttribute('aria-pressed', 'false'));

        modelSelectorBtn.setAttribute('aria-pressed', 'true')
    })
})

// SIDEBAR //

const sidebar = document.querySelector(".sidebar");
const sidebar_transition = sidebar.style.transition;
const mainSideContent = document.querySelector(".main-side-content")
const mainSideContent_transition = mainSideContent.style.transition;
const sidebarOpenBtn = document.getElementById("sidebar-openBtn");
const sidebarOpenBtn_transition = sidebar.style.transition;
const sidebarOpenBtn__content = sidebarOpenBtn.innerHTML;
const sidebarReloadContainer = document.querySelector(".sidebar-reload-container");
const sidebarReloadContainer_transition = sidebarReloadContainer.style.transition;

const settingsOpenBtn = document.getElementById("settings-openBtn");



sidebarOpenBtn.addEventListener("pointerdown", (e) => {
    const clientX = e.clientX;
    const clientY = e.clientY;

    const rect = sidebarOpenBtn.getBoundingClientRect();

    const ripple = document.createElement("span");

    const size = Math.max(rect.width, rect.height);
    const posX = clientX - rect.left - rect.width / 2;
    const posY = clientY - rect.top - rect.height / 2;

    ripple.style.left = `${posX}px`;
    ripple.style.top = `${posY}px`;

    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;

    ripple.classList.add("btn-ripple")
    sidebarOpenBtn.appendChild(ripple);

    ripple.addEventListener("animationend", () => {
        ripple.remove();
    })
})

sidebarOpenBtn.addEventListener("click", (e) => {
    sidebarOpenBtn.disabled = true;
    e.stopPropagation();
    sidebar.classList.toggle("open");
    mainSideContent.classList.toggle("open-right")
    sidebarReloadContainer.style.setProperty('--sidebar-reload-container-random-rotate', Math.random() < 0.5 ? '-40deg' : '40deg')

    if (window.innerWidth > 768) {
        if (sidebar.classList.contains("open")) {
            localStorage.setItem("sidebar_opened", "true")
            sidebarOpenBtn.innerHTML = "<svg style='transform: scale(2)' xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='#000000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='3' y='3' width='18' height='18' rx='2' ry='2'/><line x1='9' y1='3' x2='9' y2='21'/><path d='M13 8l4 4-4 4'/></svg>";
        } else {
            localStorage.setItem("sidebar_opened", "false")
            sidebarOpenBtn.innerHTML = "<svg style='transform:scale(2)' xmlns='http://www.w3.org/2000/svg' width='800px' height='800px' viewBox='0 0 16 16' fill='none'><g fill='#000000'><path d='M11.726 5.263a.7.7 0 10-.952-1.026l-3.5 3.25a.7.7 0 000 1.026l3.5 3.25a.7.7 0 00.952-1.026L8.78 8l2.947-2.737z'/><path fill-rule='evenodd' d='M1 3.25A2.25 2.25 0 013.25 1h9.5A2.25 2.25 0 0115 3.25v9.5A2.25 2.25 0 0112.75 15h-9.5A2.25 2.25 0 011 12.75v-9.5zm2.25-.75a.75.75 0 00-.75.75v9.5c0 .414.336.75.75.75h1.3v-11h-1.3zm9.5 11h-6.8v-11h6.8a.75.75 0 01.75.75v9.5a.75.75 0 01-.75.75z' clip-rule='evenodd'/></g></svg>";
        }
    } else {
        if (sidebar.classList.contains("open")) {
            sidebarOpenBtn.textContent = "×"
        } else {
            sidebarOpenBtn.textContent = "≡";
        }
    }

    sidebarOpenBtn.addEventListener("transitionend", () => {
        sidebarOpenBtn.disabled = false;
    })
})

sidebar.addEventListener("click", () => {
    if (sidebar.classList.contains("open")) return;

    if (window.innerWidth > 768) {
        sidebarOpenBtn.innerHTML = "<svg style='transform: scale(2)' xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='#000000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='3' y='3' width='18' height='18' rx='2' ry='2'/><line x1='9' y1='3' x2='9' y2='21'/><path d='M13 8l4 4-4 4'/></svg>";
        localStorage.setItem("sidebar_opened", "true")
    } else {
        sidebarOpenBtn.textContent = "×"
    }

    sidebar.classList.add("open");
    mainSideContent.classList.add("open-right")
    sidebarReloadContainer.style.setProperty('--sidebar-reload-container-random-rotate', Math.random() < 0.5 ? '-40deg' : '40deg')
})


settingsOpenBtn.addEventListener("pointerdown", (e) => {
    const clientX = e.clientX;
    const clientY = e.clientY;

    const rect = settingsOpenBtn.getBoundingClientRect();

    const ripple = document.createElement("span");

    const size = Math.max(rect.width, rect.height);
    const posX = clientX - rect.left - rect.width / 2;
    const posY = clientY - rect.top - rect.height / 2;

    ripple.style.left = `${posX}px`;
    ripple.style.top = `${posY}px`;

    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;

    ripple.classList.add("btn-ripple")
    settingsOpenBtn.appendChild(ripple);

    ripple.addEventListener("animationend", () => {
        ripple.remove();
    })
})
// ======= //
