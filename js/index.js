alertify.set('notifier', 'delay', 1.5);
alertify.set('notifier', 'position', 'bottom-left');

// help
var help = $('div.help-inner');
var isHelpOn = false;   // used in help
help.click(function () {
    help.toggleClass('active');
    isHelpOn = !isHelpOn;
    toggleHelp();
});

// actions
$('div.action').each(function () {
    $(this).on('animationend', (e) => {
        $(this).removeClassRegex('animate__*');
    });
});

var converter = $('#convert');
converter.on('click', (e) => {
    converter.addClass('animate__animated animate__spin');
    makePaste('make');
});

var eraser = $('#erase');
eraser.on('click', (e) => {
    eraser.addClass('animate__animated animate__shake');
    clearPaste();
});

var copier = $('#copy');
copier.on('click', (e) => {
    copier.addClass('animate__animated animate__grow');
    copyPaste();
});

// Prism core converter.
var input = $('#source');  // <textarea id='source'>
var output = $('pre>code');  // 选择pre标签元素的直系code标签元素
var isEmpty = true;    // used in help

// Override tab key behavior
input.on('keydown', function (e) {
    if (e.key == 'Tab') {
        e.preventDefault();
        var start = this.selectionStart;
        var end = this.selectionEnd;

        // set textarea value to: text before caret + tab + text after caret
        this.value = this.value.substring(0, start) +
            "    " + this.value.substring(end);

        // put caret at right position again
        this.selectionStart = this.selectionEnd = start + 4;
    }
});


// type传入此时进行的操作，包括clear, make
async function makePaste(type) {
    // console.log(input.val());
    // console.log(output.html());
    // .html()获取该元素的html代码内容，.html('')将该元素的代码内容清空
    output.html('');
    // console.log(output.html());

    // .trim()用于去除字符串两端的空白字符
    output.text(input.val().trim());
    // console.log(output.html());

    
    await Prism.highlightAll(); // 等待渲染结束，再执行下面的代码


    if (output.html() === '') {
        isEmpty = true;
        // 如果点的是清空
        if (type === 'clear') {
            alertify.success("Code paste already cleared 🥹");
            // 如果在没有输入内容的情况下执行高亮
        } else if (type == 'make') {
            alertify.warning("The ingredient, please (> <)");
        }
    } else {
        isEmpty = false;
        var str = output.html().toString();
        // 更改output的html代码内容
        str = str.replaceAll('\n', '<br/>');
        str = normalizeString(str);
        output.html(str);

        if (type == 'make') {
            alertify.success("Code paste ready to go!😋");
        } else if (type == 'random') {
            alertify.success("You like the random paste?🙃");
        }
    }
    if (isHelpOn) {
        help.click();
    }

    toggleHelp();
    updateLanguageTip();
}

async function clearPaste() {
    input.val('');
    $('#source').get(0).dispatchEvent(new Event('input'));
    await makePaste('clear');
}

async function copyPaste() {
    if (output.html() === '') {
        alertify.warning("Make your code paste first (> <)");
        return;
    }
    // 复制具有html格式的代码，同时word等软件能够识别这些内容，以实现功能
    if (copyHTMLElement(output.get(0))) {
        alertify.success("Code paste copied to clipboard!🤩");
    } else {
        alertify.error("Oops! Something went wrong :(");
    }
}

var cover = $('div.cover');
var showHelp = true;
var interval = null;
function toggleHelp() {
    var show = (isEmpty || isHelpOn);
    if (show === showHelp) {
        return;
    }
    showHelp = show;
    if (interval !== null) {
        clearInterval(interval);
        interval = null;
    }
    cover.removeClassRegex('animate__*');
    if (showHelp) {
        cover.addClass('animate__animated animate__fadeIn');
        cover.show();
    } else {
        cover.addClass('animate__animated animate__fadeOut');
        interval = setTimeout(function () {
            cover.hide();
        }, 500);
    }
}

// panel
$('div.panel').each(function () {
    $(this).on('animationend', (e) => {
        $(this).removeClassRegex('animate__*');
    });
});

// language
var currentLanguage = "C";
// 右上角标注type（鼠标悬浮触发）
function updateLanguageTip() {
    var tip = $('div.toolbar-item span');
    if (tip.length) {
        tip.text(currentLanguage);
    }
}

var code = $('#code');
$('#lang').change(function () {
    var optionSelected = $(this).find("option:selected");
    updateActiveLanguage(optionSelected.val(), optionSelected.text());
    localStorage.setItem("language", optionSelected.val());
});

function updateActiveLanguage(lang, text) {
    // 去除原样式，添加新样式
    code.removeClass().addClass('language-' + lang);
    currentLanguage = text;
}

// auto-fit text area
// Reference: https://stackoverflow.com/questions/454202/creating-a-textarea-with-auto-resize
const MIN_HEIGHT = 400;
const MAX_HEIGHT = 600;
$("textarea").each(function () {
    this.setAttribute("style", "height:" + (MIN_HEIGHT) + "px;");
}).on("input", function () {
    this.style.height = 0;
    var targetHeight = this.scrollHeight;
    if (targetHeight > MAX_HEIGHT) {
        $(this).addClass('full');
        targetHeight = MAX_HEIGHT;
    } else {
        $(this).removeClass('full');
        if (targetHeight < MIN_HEIGHT) {
            targetHeight = MIN_HEIGHT;
        }
    }
    this.style.height = (targetHeight) + "px";
});

// support
var supporter = $('#coffee');
supporter.on('click', (e) => {
    supporter.addClass('animate__animated animate__grow');
    alertify.alert("Buy me a coffee 🍵", `<div class="coffee"><img src="/res/img/payment.jpg" alt="WeChat Pay" title="Scan to support me"><p>We appreciate your sponsorship!🌹</p></div>`);
});

// 获取组件，绑定点击事件
var random = $('#random');  // 获取id为random的组件（这里是div)

random.on('click', (e) => {
    // 点击时出现动画，可见.addClass是一次性的
    random.addClass('animate__animated animate__rubber');

    /* 
    1. 选择随机语言，并选中
    2. 填入对应语言代码，并自动执行高亮显示
     */
    makeRandomPaste();
});

// Random codes are in code.js

function generateRandomLanguage() {
    const target = Math.floor(Math.random() * CODE_COUNT);
    var i = 0;
    for (const [key, value] of Object.entries(CODE_SET)) {
        if (i == target) {
            return key;
        }
        i++;
    }
}

function getRandomLanguage() {
    const optionSelected = $('#lang').find("option:selected");
    const current = optionSelected.val();

    var lang = generateRandomLanguage();

    // 得到一个异于当前的language，否则重复调用
    while (lang == current) {
        lang = generateRandomLanguage();
    }
    return lang;
}

function makeRandomPaste() {
    // get random code
    // 得到随机type
    const lang = getRandomLanguage();
    // 根据type得到准备好的代码，填入输入框（.val更改textarea的文本）
    input.val(CODE_SET[lang]);
    // 找到ID为 'source' 的元素，然后在该元素上触发一个 'input' 事件(模拟用户输入)
    $('#source').get(0).dispatchEvent(new Event('input'));

    // update language
    // 对应type设置为选中状态 prop
    $('option[value="' + lang + '"]').prop("selected", true);
    const optionSelected = $('#lang').find("option:selected");

    // 对语言添加相应的样式
    updateActiveLanguage(optionSelected.val(), optionSelected.text());

    // auto trigger make 即直接显示高亮之后的代码，否则需要自己点make
    makePaste('random');
}

function makeRandomPasteWithLang(lang) {
    // get random code
    input.val(CODE_SET[lang]);
    $('#source').get(0).dispatchEvent(new Event('input'));

    // update language
    $('option[value="' + lang + '"]').prop("selected", true);
    const optionSelected = $('#lang').find("option:selected");
    updateActiveLanguage(optionSelected.val(), optionSelected.text());

    // auto trigger make
    makePaste('random');
}

if (localStorage.getItem("language") != null) {
    $('option[value="' + localStorage.getItem("language") + '"]').prop("selected", true);
    const optionSelected = $('#lang').find("option:selected");
    updateActiveLanguage(optionSelected.val(), optionSelected.text());
    setTimeout(function () {
        makeRandomPasteWithLang(localStorage.getItem("language"));
    }, 1000);
}
else {
    setTimeout(function () {
        makeRandomPaste()
    }, 1000);
}

if (localStorage.getItem("notify") == null) {
    alertify.alert("Notification 🔔", `<div class="notification"><p>We use <a href="https://clarity.microsoft.com/" target="_blank">Microsoft Clarity</a> to provide you with better user experience.</p><br/><p>By continuing, it means you accept this tracker.🖲️</p></div>`);
    localStorage.setItem("notify", true);
}