/**
 * Create a new HTML element
 *
 * @param type
 * @param options
 * @returns {HTMLElement}
 */
// eslint-disable-next-line no-unused-vars
const createElement = (type, options = {}) => {
    let element = document.createElement(type);

    // Add any classes
    if (typeof options.classes === "object" && options.classes.length) {
        element.classList.add(...options.classes);
    } else if (typeof options.classes === "string") {
        element.classList.add(options.classes);
    }

    // Add any attributes
    if (typeof options.attributes === "object") {
        Object.entries(options.attributes).forEach((attribute) => {
            element.setAttribute(...attribute);
        });
    }

    // Add a text node
    if (options.text) {
        let textNode = document.createTextNode(options.text);
        element.appendChild(textNode);
    }

    // Add any children
    if (typeof options.children === "object" && options.children.length) {
        options.children.forEach((child) => {
            if (child instanceof HTMLElement) {
                element.appendChild(child);
            }
        });
    } else if (typeof options.children === "object" && options.children instanceof HTMLElement) {
        element.appendChild(options.children);
    }

    return element;
};

/**
 * Removes all styles from a stylesheet
 *
 * @param styleSheet
 */
// eslint-disable-next-line no-unused-vars
const clearStyles = (styleSheet) => {
    if (!styleSheet || !styleSheet.sheet || !styleSheet.sheet.cssRules) {
        throw new TypeError("Parameter is not a stylesheet");
    }
    while (styleSheet.sheet.cssRules.length) {
        styleSheet.sheet.deleteRule(0);
    }
};

/**
 * Remove all the pesky children for an element
 *
 * @param element
 */
// eslint-disable-next-line no-unused-vars
const clearChildren = (element) => {
    if (!(element instanceof HTMLElement)) {
        throw new TypeError("Parameter is not an HTMLElement");
    }
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
};

/**
 * Show toast message
 *
 * @param message
 * @param type
 * @param timeout
 */
// eslint-disable-next-line no-unused-vars
const showToast = (message, type = "primary", timeout = 10) => {
    if (["primary", "success", "warning", "error"].indexOf(type) === -1) {
        type = "primary";
    }
    let wrapper = document.getElementById("toasts"),
        toastTemplate = document.getElementById("toast-template"),
        toast = document.importNode(toastTemplate.content, true),
        toastDiv = toast.querySelector(".toast");

    toast.querySelector("span").innerText = message;
    toastDiv.classList.add(`toast-${type}`);
    wrapper.appendChild(toast);
    window.setTimeout(() => {
        toastDiv.remove();
    }, timeout * 1000);
};

/**
 * Get the appropriate text color for a given background color
 *
 * @param bgColor   string  The hexadecimal background color
 */
// eslint-disable-next-line no-unused-vars
const getAppropriateTextColor = (bgColor = "#FFFFFF") => {
    bgColor = bgColor.replace("#", "");
    const r = parseInt(bgColor.substr(0,2),16),
        g = parseInt(bgColor.substr(2,2),16),
        b = parseInt(bgColor.substr(4,2),16),
        yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? "#000" : "#FFF";
};
