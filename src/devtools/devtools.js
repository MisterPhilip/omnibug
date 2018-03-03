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
    browser.devtools.panels.create(
        "Omnibug",
        "./images/o-32.png",
        "./devtools/panel.html"
    ).then((panel) => {
        let queuedMessages = [],
            panelWindow,  // reference to devtools_panel.html's `window` object
            port;

        port = browser.runtime.connect({
            name: "omnibug-" + browser.devtools.inspectedWindow.tabId
        });

        /**
         * Receieves messages from the eventPage
         */
        port.onMessage.addListener((msg) => {
            if(panelWindow) {
                panelWindow.Omnibug.receive_message(msg);
            } else {
                queuedMessages.push(msg);
            }
        });

        /**
         * Called when the devtools panel is first shown
         */
        let listener = ( _window ) => {
            panel.onShown.removeListener(listener); // Run once only
            panelWindow = _window;

            // Release queued messages
            let msg;
            while((msg = queuedMessages.shift())) {
                panelWindow.Omnibug.receive_message(msg);
            }

            // Inject a reply mechanism into the caller
            panelWindow.Omnibug.send_message = (msg) => {
                port.postMessage( msg );
            };
        };
        panel.onShown.addListener(listener);
    });

    return {};
})();
