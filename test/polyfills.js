/**
 * Basic polyfill for Ports: https://developer.chrome.com/extensions/runtime#type-Port
 */
class SamplePort {
    constructor(name = "")
    {
        this._name = name;
        this._listeners = {"onDisconnect": [], "onMessage": []}
    }

    get name()
    {
        return this._name;
    }

    get onDisconnect()
    {
        return {
            addListener: (port) => {
                this._listeners.onDisconnect.push(port);
            }
        }
    }

    get onMessage()
    {
        return {
            addListener: (port) => {
                this._listeners.onMessage.push(port);
            }
        }
    }

    trigger(type, payload)
    {
        this._listeners[type].forEach((listener) => {
            listener.call(null, payload);
        });
    }
}

export { SamplePort }