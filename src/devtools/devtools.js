/*
 * Omnibug
 * Intermediary between eventPage and devTools panel
 * (used for message passing only)
 *
 */
(() => {
    /**
     * Create the panel
     */
    chrome.devtools.panels.create(
        "##OMNIBUG_NAME##",
        "../assets/images/blue-32.png",
        "../devtools/panel.html",
        (panel) => {
            let queuedMessages = [],
                panelWindow,  // reference to devtools_panel.html's `window` object
                port;

            port = chrome.runtime.connect({
                name: "##OMNIBUG_KEY##-" + chrome.devtools.inspectedWindow.tabId
            });

            /**
             * Receieves messages from the eventPage
             */
            port.onMessage.addListener((msg) => {
                if (panelWindow) {
                    panelWindow.Omnibug.receive_message(msg);
                } else {
                    queuedMessages.push(msg);
                }
            });

            /**
             * Called when the devtools panel is first shown
             */
            let listener = (_window) => {
                panel.onShown.removeListener(listener); // Run once only
                panelWindow = _window;

                // Release queued messages
                let msg;
                while ((msg = queuedMessages.shift())) {
                    panelWindow.Omnibug.receive_message(msg);
                }

                // Inject a reply mechanism into the caller
                panelWindow.Omnibug.send_message = (...data) => {
                    port.postMessage(data);
                };
            };
            panel.onShown.addListener(listener);
        });

    return {};
})();
