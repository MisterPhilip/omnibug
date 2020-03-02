/**
 * Omnibug Port
 */
// eslint-disable-next-line no-unused-vars
class OmnibugPort {
    /**
     * New OmnibugPort
     *
     * @param details   Tab details, as provided by the browser
     * @param settings  OmnibugSettings object
     */
    constructor(details, settings) {
        this._name = details.name;
        this._port = details;
        this._settings = settings;
    }

    /**
     * Get the port/tab ID
     *
     * @return {string}
     */
    get id() {
        return this._name.split("-").pop();
    }

    /**
     * Get the port/tab name
     *
     * @return {string}
     */
    get name() {
        return this._name;
    }

    /**
     * Check if this tab belongs to Omnibug
     *
     * @return {boolean}
     */
    get belongsToOmnibug() {
        return /^##OMNIBUG_KEY##-\d+$/.test(this.name);
    }

    /**
     * Return the original port resource
     *
     * @return {{name: string, disconnect: function, error: {}, onDisconnect: function, onMessage: {}, postMessage: function, sender: {}}}}
     */
    get port() {
        return this._port;
    }

    /**
     * Initialize the tab
     *
     * @param   tabs   Object    The currently open tabs
     *
     * @return {{}}
     */
    init(tabs = {}) {
        tabs[this.id] = this;

        this.port.onDisconnect.addListener((port) => {
            console.debug("Disconnecting port ", this.name);
            delete tabs[this.id];
        });

        this.port.onMessage.addListener((messages) => {
            console.log("Message(s) from port[" + this.id + "]: ", messages);
            messages.forEach((message) => {
                if (message.type === "settings") {
                    if (typeof message.key === "string" && message.value) {
                        this._settings.updateItem(message.key, message.value);
                    } else {
                        this._settings.save(message.value);
                    }
                } else if (message.type === "linkClick") {
                    chrome.tabs.create({ url: message.url });
                } else if (message.type === "openSettings") {
                    chrome.runtime.openOptionsPage();
                }
            });
        });

        return tabs;
    }
}