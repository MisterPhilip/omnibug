/**
 * Omnibug Tracker
 */
/* exported OmnibugTracker */
class OmnibugTracker
{
    constructor()
    {
        window.tracker = function(){ (window.tracker.q = window.tracker.q||[]).push(arguments), window.tracker.l=1*new Date(); };
        this.loaded = false;

        // Set defaults
        this.track(["create", "##OMNIBUG_UA_ACCOUNT##", "auto"], true);
        this.track(["set", "checkProtocolTask", ()=>{}], true);
        this.track(["set", "forceSSL", true], true);
        this.track(["set", "dimension1", "##OMNIBUG_VERSION##"], true);
    }

    static get browserTrackingEnabled()
    {
        return true;
    }

    /**
     * Load GA on the page
     */
    init(allowTracking = true)
    {
        this.updateAllowTracking(allowTracking);

        if(!this.loaded) {

            // Load GA script
            window.GoogleAnalyticsObject = "tracker";
            (function(o,m,n,i,b,u,g){o['GoogleAnalyticsObject']=b;o[b]=o[b]||function(){
                (o[b].q=o[b].q||[]).push(arguments)},o[b].l=1*new Date();u=m.createElement(n),
                g=m.getElementsByTagName(n)[0];u.async=1;u.src=i;g.parentNode.insertBefore(u,g)
            })(window,document,'script','../../assets/js/google-analytics.js','tracker');

            this.loaded = true;
        }
    }

    /**
     * Update settings
     *
     * @param allowTracking
     */
    updateAllowTracking(allowTracking = true)
    {
        this.allowTracking = allowTracking;
    }

    /**
     * ga() wrapper
     *
     * @param data
     * @param force
     */
    track(data, force = false)
    {
        try {
            if(this.allowTracking || force) {
                window.tracker.apply(window, data);
            }
        } catch(e) {
            console.error(e.message);
        }
    }
}