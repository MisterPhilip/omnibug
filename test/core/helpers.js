import test from 'ava';

import { createElement, clearStyles, clearChildren } from "./../helpers.js";

/*
 * --------- createElement ---------------------------------------------------------------------------------------------
 */
test("createElement should return an HTML Element", t => {
    let element = createElement("div");
    t.is(typeof element, "object");
    t.true(element instanceof HTMLElement);
});

test("createElement should add classes, if passed", t => {
    let elementWithoutClasses = createElement("div"),
        elementWithOneClass = createElement("div", {
            "classes": ["foo"]
        }),
        elementWithTwoClasses = createElement("div", {
            "classes": ["foo", "bar"]
        });

    t.is(elementWithoutClasses.classList.length, 0);

    t.is(elementWithOneClass.classList.length, 1);
    t.true(elementWithOneClass.classList.contains("foo"));

    t.is(elementWithTwoClasses.classList.length, 2);
    t.true(elementWithTwoClasses.classList.contains("foo"));
    t.true(elementWithTwoClasses.classList.contains("bar"));
});

test("createElement should add attributes, if passed", t => {
    let elementWithoutAttributes = createElement("div"),
        elementWithOneAttribute = createElement("div", {
            "attributes": {
                "title": "foobar"
            }
        }),
        elementWithTwoAttributes = createElement("div", {
            "attributes": {
                "title": "foobar",
                "data-test": "testing123"
            }
        });

    t.false(elementWithoutAttributes.hasAttributes());

    t.true(elementWithOneAttribute.hasAttributes());
    t.is(elementWithOneAttribute.getAttributeNames().length, 1);
    t.is(elementWithOneAttribute.getAttribute("title"), "foobar");

    t.true(elementWithTwoAttributes.hasAttributes());
    t.is(elementWithTwoAttributes.getAttributeNames().length, 2);
    t.is(elementWithTwoAttributes.getAttribute("title"), "foobar");
    t.is(elementWithTwoAttributes.getAttribute("data-test"), "testing123");
});

test("createElement should add text, if passed", t => {
    let elementWithoutText = createElement("div"),
        elementWithText = createElement("div", {
            "text": "foobar"
        });

    t.is(elementWithoutText.textContent, "");
    t.is(elementWithText.textContent, "foobar");
});

test("createElement should add HTML, if passed", t => {
    let elementWithoutHTML = createElement("div"),
        elementWithHTML = createElement("div", {
            "html": "&amp;"
        });

    t.is(elementWithoutHTML.textContent, "");
    t.is(elementWithHTML.textContent, "&");
});

test("createElement should add children, if passed", t => {
    let elementWithoutChildren = createElement("div"),
        child1 = createElement("div"),
        child2 = createElement("div"),
        elementWithChildren = createElement("div", {
            "children": [child1, child2]
        });

    t.is(elementWithoutChildren.children.length, 0);
    t.is(elementWithChildren.children.length, 2);
    t.is(elementWithChildren.children[0], child1, "Children should be added in the order provided");
});

test("createElement should add classes, attributes, children, and text if passed", t => {
    let child1 = createElement("div"),
        child2 = createElement("div"),
        parentElement = createElement("div", {
            "classes": ["testing", "foobar"],
            "attributes": {
                "title": "example title",
                "data-foo": "bar"
            },
            "text": "foobar",
            "children": [child1, child2]
        });

    // Classes
    t.true(parentElement.classList.contains("testing"));
    t.true(parentElement.classList.contains("foobar"));

    // Attributes
    t.is(parentElement.getAttributeNames().length, 3); // 2 attributes passed + class
    t.is(parentElement.getAttribute("title"), "example title");
    t.is(parentElement.getAttribute("data-foo"), "bar");

    // Text
    t.is(parentElement.textContent, "foobar");

    // Children
    t.is(parentElement.children.length, 2);
});

/*
 * --------- clearStyles -----------------------------------------------------------------------------------------------
 */
test("clearStyles should remove all styles in a given stylesheet", t => {
    let styleSheet = document.createElement("style");
    document.body.appendChild((styleSheet));
    styleSheet.sheet.insertRule("body { color: red; }" , styleSheet.sheet.cssRules.length);
    styleSheet.sheet.insertRule("div { color: blue; }" , styleSheet.sheet.cssRules.length);
    styleSheet.sheet.insertRule("body { color: red; }" , styleSheet.sheet.cssRules.length);

    t.is(styleSheet.sheet.cssRules.length, 3);
    clearStyles(styleSheet);
    t.is(styleSheet.sheet.cssRules.length, 0);
});

test("clearStyles should do nothing when passed an empty stylesheet", t => {
    let styleSheet = document.createElement("style");
    document.body.appendChild((styleSheet));

    clearStyles(styleSheet);
    t.is(styleSheet.sheet.cssRules.length, 0);
});

test("clearStyles should throw an error when passed a non-stylesheet element", t => {
    let nonStyleSheet = document.createElement("div");
    const error = t.throws(() => {
        clearStyles(nonStyleSheet);
    }, TypeError);

    t.is(error.message, "Parameter is not a stylesheet");
});

/*
 * --------- clearChildren ---------------------------------------------------------------------------------------------
 */
test("clearChildren should remove all children of an element passed", t => {
    let parentElement = document.createElement("div"),
        child1 = document.createElement("div"),
        child2 = document.createElement("div");

    parentElement.appendChild(child1);
    parentElement.appendChild(child2);


    t.is(parentElement.children.length, 2);
    clearChildren(parentElement);
    t.is(parentElement.children.length, 0);
});

test("clearChildren should throw an error when passed a non-HTML element", t => {
    let nonElement = {"foo": "bar"};
    const error = t.throws(() => {
        clearChildren(nonElement);
    }, TypeError);

    t.is(error.message, "Parameter is not an HTMLElement");
});