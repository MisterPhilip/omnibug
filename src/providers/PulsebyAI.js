/**
 * Pulse by AI
 * https://analyticsintelligence.net
 */

class PulsebyAIProvider extends BaseProvider {
    constructor() {
        super();
        this._key        = "PULSEBYAI";
        this._pattern    = /pulse\.analyticsintelligence\.net\/(track|session|campaign|api\/geolocation)/;
        this._name       = "Pulse by AI";
        this._type       = "analytics";
        this._keywords   = ["pulse", "analyticsintelligence", "pulsebyai"];
    }

    get name() {
        return "Pulse by AI";
    }

    get columnMapping() {
        return {
            account:     "company_id",
            requestType: "event_type",
        };
    }

    get groups() {
        return [
            { key: "general",   name: "General" },
            { key: "identity",  name: "Identity" },
            { key: "page",      name: "Page & Element" },
            { key: "campaign",  name: "Campaign" },
            { key: "batch",     name: "Batch / Queue" },
            { key: "geo",       name: "Geolocation" },
        ];
    }

    _resolveRequestType(path) {
        if (/\/track\/batch/.test(path))       return "Batch Events";
        if (/\/track\/flush/.test(path))       return "Flush";
        if (/\/track\/geolocation/.test(path)) return "Geolocation";
        if (/\/track/.test(path))              return "Event";
        if (/\/session\/end/.test(path))       return "Session End";
        if (/\/campaign\/track/.test(path))    return "Campaign";
        if (/\/api\/geolocation/.test(path))   return "IP Geolocation";
        return "Request";
    }

    parsePostData(postData = "") {
        const pairs = [];
        if (!postData) return pairs;
        let parsed;
        try { parsed = JSON.parse(postData); } catch (_) { return pairs; }
        if (parsed.events && Array.isArray(parsed.events)) {
            pairs.push(["_batch_count", String(parsed.events.length)]);
            const first = parsed.events[0] || {};
            this._flattenObject(first, pairs);
            return pairs;
        }
        this._flattenObject(parsed, pairs);
        return pairs;
    }

    _flattenObject(obj, acc, prefix = "") {
        for (const [k, v] of Object.entries(obj)) {
            const key = prefix ? `${prefix}.${k}` : k;
            if (v === null || v === undefined) {
                acc.push([key, ""]);
            } else if (typeof v === "object" && !Array.isArray(v)) {
                acc.push([key, JSON.stringify(v)]);
            } else if (Array.isArray(v)) {
                acc.push([key, JSON.stringify(v)]);
            } else {
                acc.push([key, String(v)]);
            }
        }
    }

    handleQueryParam(name, value) {
        if (name === "company_id")    return { key: name, field: "Company ID",          group: "identity", value };
        if (name === "user_id")       return { key: name, field: "User ID",             group: "identity", value };
        if (name === "device_id")     return { key: name, field: "Device ID",           group: "identity", value };
        if (name === "session_id")    return { key: name, field: "Session ID",          group: "identity", value };
        if (name === "event_type")    return { key: name, field: "Event Type",          group: "general",  value };
        if (name === "timestamp")     return { key: name, field: "Timestamp",           group: "general",  value };
        if (name === "_batch_count")  return { key: name, field: "Events in Batch",     group: "batch",    value };
        if (name === "page_url")      return { key: name, field: "Page URL",            group: "page",     value };
        if (name === "referrer")      return { key: name, field: "Referrer",            group: "page",     value };
        if (name === "viewport_size") return { key: name, field: "Viewport",            group: "page",     value };
        if (name === "user_agent")    return { key: name, field: "User Agent",          group: "page",     value };
        if (name === "element")       return { key: name, field: "Element Tag",         group: "page",     value };
        if (name === "element_id")    return { key: name, field: "Element ID",          group: "page",     value };
        if (name === "element_class") return { key: name, field: "Element Class",       group: "page",     value };
        if (name === "button_name")   return { key: name, field: "Button Name",         group: "page",     value };
        if (name === "scroll_depth")  return { key: name, field: "Scroll Depth (%)",    group: "page",     value };
        if (name === "mouse_coords_x") return { key: name, field: "Mouse X",           group: "page",     value };
        if (name === "mouse_coords_y") return { key: name, field: "Mouse Y",           group: "page",     value };
        if (name === "dwell_time_ms") return { key: name, field: "Dwell Time (ms)",     group: "page",     value };
        if (name === "input_name")    return { key: name, field: "Input Field Name",    group: "page",     value };
        if (name === "input_length")  return { key: name, field: "Input Length",        group: "page",     value };
        if (name === "form_data")     return { key: name, field: "Form Data",           group: "page",     value };
        if (name === "last_field")    return { key: name, field: "Last Field Touched",  group: "page",     value };
        if (name === "forms_abandoned") return { key: name, field: "Forms Abandoned",  group: "page",     value };
        if (name === "campaign_pid")  return { key: name, field: "Campaign PID",        group: "campaign", value };
        if (name === "utm_source")    return { key: name, field: "UTM Source",          group: "campaign", value };
        if (name === "utm_medium")    return { key: name, field: "UTM Medium",          group: "campaign", value };
        if (name === "utm_campaign")  return { key: name, field: "UTM Campaign",        group: "campaign", value };
        if (name === "utm_term")      return { key: name, field: "UTM Term",            group: "campaign", value };
        if (name === "utm_content")   return { key: name, field: "UTM Content",         group: "campaign", value };
        if (name === "gclid")         return { key: name, field: "Google Click ID",     group: "campaign", value };
        if (name === "fbclid")        return { key: name, field: "Facebook Click ID",   group: "campaign", value };
        if (name === "msclkid")       return { key: name, field: "Microsoft Click ID",  group: "campaign", value };
        if (name === "ttclid")        return { key: name, field: "TikTok Click ID",     group: "campaign", value };
        if (name === "pid")           return { key: name, field: "Pulse ID (pid)",      group: "campaign", value };
        if (name === "cid")           return { key: name, field: "Campaign ID (cid)",   group: "campaign", value };
        if (name === "iid")           return { key: name, field: "Internal ID (iid)",   group: "campaign", value };
        if (name === "first_seen")    return { key: name, field: "First Seen",          group: "campaign", value };
        if (name === "last_seen")     return { key: name, field: "Last Seen",           group: "campaign", value };
        if (name === "visit_count")   return { key: name, field: "Visit Count",         group: "campaign", value };
        if (name === "latitude")      return { key: name, field: "Latitude",            group: "geo",      value };
        if (name === "longitude")     return { key: name, field: "Longitude",           group: "geo",      value };
        if (name === "city")          return { key: name, field: "City",                group: "geo",      value };
        if (name === "region")        return { key: name, field: "Region",              group: "geo",      value };
        if (name === "country")       return { key: name, field: "Country",             group: "geo",      value };
        if (name === "country_code")  return { key: name, field: "Country Code",        group: "geo",      value };
        if (name === "postal_code")   return { key: name, field: "Postal Code",         group: "geo",      value };
        if (name === "timezone")      return { key: name, field: "Timezone",            group: "geo",      value };
        if (name === "accuracy")      return { key: name, field: "Accuracy (m)",        group: "geo",      value };
        if (name === "source")        return { key: name, field: "Geo Source",          group: "geo",      value };
        return super.handleQueryParam(name, value);
    }

    parseUrl(rawUrl, postData = "") {
        if (postData) {
            let parsed;
            try { parsed = JSON.parse(postData); } catch (_) {}
            if (parsed && parsed.events && Array.isArray(parsed.events)) {
                return parsed.events.map((event) => {
                    const result = super.parseUrl(rawUrl, JSON.stringify(event));
                    const hasType = result.data.some(p => p.key === "event_type" && p.value);
                    if (hasType === false) {
                        result.data.push({ key: "event_type", field: "Event Type", group: "general", hidden: false, value: event.event_type || "Batch Event" });
                    }
                    return result;
                });
            }
        }
        const result = super.parseUrl(rawUrl, postData);
        let url;
        try { url = new URL(rawUrl); } catch (_) { return result; }
        const hasEventType = result.data.some(p => p.key === "event_type" && p.value);
        if (hasEventType === false) {
            result.data.push({ key: "event_type", field: "Event Type", group: "general", hidden: false, value: this._resolveRequestType(url.pathname) });
        }
        return result;
    }
}

