const terminal = document.querySelector(".terminal");
const hydra = document.querySelector(".hydra");
const rebootSuccessText = document.querySelector(".hydra_reboot_success");
const maxCharacters = 24;
const unloadedCharacter = ".";
const loadedCharacter = "#";
const spinnerFrames = ["/", "-", "\\", "|"];

// 复制 glitch 元素 (保持原样)
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

// 获取所有元素
const loadingBars = document.querySelectorAll(".loading-bar");
const processAmounts = document.querySelectorAll(".process-amount");
const spinners = document.querySelectorAll(".spinner");
const rebootingText = document.querySelectorAll(".hydra_rebooting");
const glitches = document.querySelectorAll(".glitch--clone");

// 随机数生成器
const RandomNumber = (min, max) => Math.floor(Math.random() * max) + min;

const HideAll = elements =>
    elements.forEach(glitchGroup =>
        glitchGroup.forEach(element => element.classList.add("hidden")) );

const ShowAll = elements =>
    elements.forEach(glitchGroup =>
        glitchGroup.forEach(element => element.classList.remove("hidden")) );

// 渲染进度条 HTML
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

// --- 核心修改：控制进度条速度 ---
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
        
        // 【关键修改】让速度更稳定！
        // 之前是 (100, 275)，范围太大导致忽快忽慢。
        // 现在改成 (170, 200)。
        // 这样每一步都差不多是 0.18秒，24步走完非常稳定地接近 4.5秒。
        }, RandomNumber(170, 200)); 
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
    }, RandomNumber(170, 200)); // 转轮速度同步
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

    hydraAnimation.addEventListener('finish', () => {
        rebootSuccessText.removeAttribute("style");
        hydra.removeAttribute("style");
        
        // 这里保留了你想要的“结局停留时间”
        // 动画跑完后，显示 SUCCESS 字样 2.5秒，然后才跳转
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
