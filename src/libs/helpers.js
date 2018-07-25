/**
 * Create a new HTML element
 *
 * @param type
 * @param options
 * @returns {HTMLElement}
 */
const createElement = (type, options = {}) => {
    let element = document.createElement(type);

    // Add any classes
    if(typeof options.classes === "object" && options.classes.length) {
        element.classList.add(...options.classes);
    } else if(typeof options.classes === "string") {
        element.classList.add(options.classes);
    }

    // Add any attributes
    if(typeof options.attributes === "object") {
        Object.entries(options.attributes).forEach((attribute) => {
            element.setAttribute(...attribute);
        });
    }

    // Add a text node
    if(options.text) {
        let textNode = document.createTextNode(options.text);
        element.appendChild(textNode);
    }

    // Add any children
    if(typeof options.children === "object" && options.children.length) {
        options.children.forEach((child) => {
            if(child instanceof HTMLElement) {
                element.appendChild(child);
            }
        });
    } else if(typeof options.children === "object" && options.children instanceof HTMLElement) {
        element.appendChild(options.children);
    }

    return element;
};

/**
 * Removes all styles from a stylesheet
 *
 * @param styleSheet
 */
const clearStyles = (styleSheet) => {
    if(!styleSheet || !styleSheet.sheet || !styleSheet.sheet.cssRules) {
        throw new TypeError("Parameter is not a stylesheet");
    }
    while(styleSheet.sheet.cssRules.length) {
        styleSheet.sheet.deleteRule(0);
    }
};

/**
 * Remove all the pesky children for an element
 *
 * @param element
 */
const clearChildren = (element) => {
    if(!(element instanceof HTMLElement)) {
        throw new TypeError("Parameter is not an HTMLElement");
    }
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
};