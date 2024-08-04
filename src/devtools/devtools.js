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
            console.log("devtools.panel.create", panel);
            let queuedMessages = [],
                panelWindow,  // reference to devtools_panel.html's `window` object
                port;

            const connectPort = () => {
                port = chrome.runtime.connect({
                    name: String(chrome.devtools.inspectedWindow.tabId)
                });

                port.onMessage.addListener((msg) => {
                    if (panelWindow) {
                        panelWindow.Omnibug.receive_message(msg);
                    } else {
                        queuedMessages.push(msg);
                    }
                });
                port.onDisconnect.addListener(connectPort);
            }
            connectPort();

            /**
             * Called when the devtools panel is first shown
             */
            const listener = (_window) => {
                panel.onShown.removeListener(listener); // Run once only
                panelWindow = _window;

                // Release queued messages
                let msg;
                while ((msg = queuedMessages.shift())) {
                    panelWindow.Omnibug.receive_message(msg);
                }

                // Inject a reply mechanism into the caller
                panelWindow.Omnibug.send_message = (...data) => {
                    if(port && port.postMessage) {
                        port.postMessage(data);
                    }
                };
            };
            panel.onShown.addListener(listener);
        });

    return {};
})();
