/**
 * Omnibug Tracker
 */
/* exported OmnibugTracker */
class OmnibugTracker
{

    static get browserTrackingEnabled() { return false; }
    init(allowTracking = true) { }
    updateAllowTracking(allowTracking = true) { }
    track(data, force = false) { }
}