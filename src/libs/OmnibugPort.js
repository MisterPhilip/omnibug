/**
 * Omnibug Port
 */
/* exported OmnibugPort */
class OmnibugPort
{
    constructor(details)
    {
        this._name = details.name;
        this._port = details;
    }

    /**
     * Get the port/tab ID
     *
     * @return {string}
     */
    get id()
    {
        return this._name.split("-").pop();
    }

    /**
     * Get the port/tab name
     *
     * @return {string}
     */
    get name()
    {
        return this._name;
    }

    /**
     * Check if this tab belongs to Omnibug
     *
     * @return {boolean}
     */
    get belongsToOmnibug()
    {
        return /^##OMNIBUG_KEY##-\d+$/.test(this.name);
    }

    /**
     * Return the original port resource
     *
     * @return {{name: string, disconnect: function, error: {}, onDisconnect: function, onMessage: {}, postMessage: function, sender: {}}}}
     */
    get port()
    {
        return this._port;
    }

    /**
     * Initialize the tab
     *
     * @param   tabs   Object    The currently open tabs
     *
     * @return {{}}
     */
    init(tabs = {})
    {
        tabs[this.id] = this;

        this.port.onDisconnect.addListener((port) => {
            console.debug("Disconnecting port ", this.name );
            delete tabs[this.id];
        });

        // logs messages from the port (in the background page's console!)
        this.port.onMessage.addListener((msg) => {
            console.log("Message from port[" + this.id + "]: ", msg);
        });

        return tabs;
    }
}