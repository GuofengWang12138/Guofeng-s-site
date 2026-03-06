const terminal = document.querySelector(".terminal");
const hydra = document.querySelector(".hydra");
const rebootSuccessText = document.querySelector(".hydra_reboot_success");
const maxCharacters = 24;
const unloadedCharacter = ".";
const loadedCharacter = "#";
const spinnerFrames = ["/", "-", "\\", "|"];

// Clone the element and give the glitch classes
(glitchElement => {
    const glitch = glitchElement.cloneNode(true);
    const glitchReverse = glitchElement.cloneNode(true);
    glitch.classList.add("glitch--clone", "glitch--bottom");
    glitchReverse.classList.add("glitch--clone", "glitch--top");
    glitch.setAttribute("aria-hidden", "true");
    glitchReverse.setAttribute("aria-hidden", "true");

    glitchElement.insertAdjacentElement("afterend", glitch);
    glitchElement.insertAdjacentElement("afterend", glitchReverse);
})(terminal);

// Get all the loading bars
const loadingBars = document.querySelectorAll(".loading-bar");
const processAmounts = document.querySelectorAll(".process-amount");
const spinners = document.querySelectorAll(".spinner");
const rebootingText = document.querySelectorAll(".hydra_rebooting");
const glitches = document.querySelectorAll(".glitch--clone");

// Helper for random number
const RandomNumber = (min, max) => Math.floor(Math.random() * max) + min;

const HideAll = elements =>
    elements.forEach(glitchGroup =>
        glitchGroup.forEach(element => element.classList.add("hidden")) );

const ShowAll = elements =>
    elements.forEach(glitchGroup =>
        glitchGroup.forEach(element => element.classList.remove("hidden")) );

// Render the bar to HTML
const RenderBar = ( values ) => {
    const currentLoaded = values.lastIndexOf(loadedCharacter) + 1;
    const loaded = values.slice(0, currentLoaded).join("");
    const unloaded = values.slice(currentLoaded).join("");

    loadingBars.forEach(loadingBar => {
        loadingBar.innerHTML = `(${loaded}<span class="loading-bar--unloaded">${unloaded}</span>)`;
    });

    loadingPercent = Math.floor(currentLoaded / maxCharacters * 100);
    processAmounts.forEach(processAmount => {
        processAmount.innerText = loadingPercent;
    });
};

// 进度条速度控制
const DrawLoadingBar = ( values ) => {
    return new Promise((resolve) => {
            const loadingBarAnimation = setInterval(() => {
                if (!values.includes(unloadedCharacter)) {
                    clearInterval(loadingBarAnimation);
                    resolve();
                }

                values.pop(unloadedCharacter);
                values.unshift(loadedCharacter);
                RenderBar(values);
        // 保持 4.5秒 左右的进度条速度
        }, RandomNumber(100, 275)); 
    });
};

const DrawSpinner = (spinnerFrame = 0) => {
    return setInterval(() => {
        spinnerFrame += 1;
        spinners.forEach(
            spinner =>
                (spinner.innerText = `[${
                    spinnerFrames[spinnerFrame % spinnerFrames.length]
                }]`)
        );
    }, RandomNumber(100, 275));
};

const AnimateBox = () => {
    const first = hydra.getBoundingClientRect();
    HideAll([spinners, glitches, rebootingText]);
    rebootSuccessText.classList.remove("hidden");
    rebootSuccessText.style.visibility = "hidden";
    const last = hydra.getBoundingClientRect();

    const hydraAnimation = hydra.animate([
        { transform: `scale(${first.width / last.width}, ${first.height / last.height})` },
        { transform: `scale(${first.width / last.width}, 1.2)` },
        { transform: `none` }
    ],{
        duration: 600,
        easing: 'cubic-bezier(0,0,0.32,1)',
    }); 

    // --- 这里是修改的地方 ---
    hydraAnimation.addEventListener('finish', () => {
        rebootSuccessText.removeAttribute("style");
        hydra.removeAttribute("style");
        
        // 【修改了这里】
        // 之前是 500 (0.5秒)，太快了。
        // 现在改成 2500 (2.5秒)。
        // 这样屏幕会显示 "REBOOTING SUCCESSFUL" 足足 2.5秒，你绝对能看清。
        setTimeout(() => {
            window.location.href = "index.html?played=yes";
        }, 2500);
    });
};

const PlayHydra = async() => {
    terminal.classList.add("glitch");
    rebootSuccessText.classList.add("hidden");
    ShowAll([spinners, glitches, rebootingText]);
    const loadingBar = new Array(maxCharacters).fill(unloadedCharacter);
    const spinnerInterval = DrawSpinner();

    await DrawLoadingBar(loadingBar);
    
    requestAnimationFrame(()=> {
        clearInterval(spinnerInterval);
        terminal.classList.remove("glitch");
        AnimateBox();
    });
};

PlayHydra();
