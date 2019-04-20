export class SamplePort {
    constructor(name) {
        this.name = name;
        this.listeners = {
            onDisconnect: [],
            onMessage: []
        };
        this.onDisconnect = {
            addListener: (callback) => {
                this.listeners.onDisconnect.push(callback);
            }
        };
        this.onMessage = {
            addListener: (callback) => {
                this.listeners.onMessage.push(callback);
            }
        };
    }

    trigger(event, details) {
        if(event === "disconnect") {
            this.listeners.onDisconnect.forEach((callback) => { callback(details); });
        } else if(event === "message") {
            this.listeners.onMessage.forEach((callback) => { callback(details); });
        }
    }
}