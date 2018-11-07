/**
 * Mparticle
 * https://docs.mparticle.com/developers/sdk/javascript/getting-started
 *
 * @class
 * @extends BaseProvider
 */

class MparticleProvider extends BaseProvider {
    constructor() {
        super();
        this._key       = "MPARTICLE";
        this._pattern   = /\.mparticle\.com\/v\d\/JS\/\w{32}\/Events$/;
        this._name      = "Mparticle";
        this._type      = "marketing";
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "account":      "clientCode",
            "requestType":  "requestTypeParsed"
        };
    }

    /**
     * Retrieve the group names & order
     *
     * @returns {*[]}
     */
    get groups()
    {
        return [
            {
                "key": "general",
                "name": "General"
            },
            {
                "key": "customattributes",
                "name": "Custom Attributes"
            },
        ];
    }

    /**
     * Get all of the available URL parameter keys
     *
     * @returns {{}}
     */
    get keys()
    {
        return {
            "av" : {
                "name": "Application Version (av)",
                "group": "general"
            },
            "at" : {
                "name": "Application State (at)",
                "group": "general"
            },
            "attrs" : {
                "name": "Attributes (attrs)",
                "group": "general"
            },
            "cgid" : {
                "name": "Client Generated ID (cgid)",
                "group": "general"
            },
            "ct" : {
                "name": "Unix Time (ct)",
                "group": "general"
            },
            "das" : {
                "name": "Device Application Stamp (das)",
                "group": "general"
            },
            "dbg" : {
                "name": "Debug (dbg)",
                "group": "general"
            },
            "dt" : {
                "name": "Data Type (dt)",
                "group": "general"
            },
            "eec" : {
                "name": "Expanded Event Count (eec)",
                "group": "general"
            },
            "et" : {
                "name": "Event Type (et)",
                "group": "general"
            },
            "flags" : {
                "name": "flags",
                "group": "general"
            },
            "fr" : {
                "name": "First Run (fr)",
                "group": "general"
            },
            "iu" : {
                "name": "Is Upgrade (iu)",
                "group": "general"
            },
            "lr" : {
                "name": "Launch Referral (lr)",
                "group": "general"
            },
            "mpid" : {
                "name": "Mparticle ID",
                "group": "general"
            },
            "n" : {
                "name": "Event Name (n)",
                "group": "general"
            },
            "o" : {
                "name": "Opt-Out (o)",
                "group": "general"
            },
            "pb" : {
                "name": "User Product-Bags (pb)",
                "group": "general"
            },
            "sdk" : {
                "name" : "SDK Version (sdk)",
                "group": "general"
            },
            "sid" : {
                "name": "Session UID (sid)",
                "group": "general"
            },
            "str.uid.Expires" : {
                "name": "uid expires",
                "group": "general"
            },
            "str.uid.Value" : {
                "name": "uid",
                "group": "general"
            },
            "ua" : {
                "name": "User Attributes (ua)",
                "group": "general"
            },
            "ui" : {
                "name": "User Identities (ui)",
                "group": "general"
            },
            "uic" : {
                "name": "User Identity Change (uic)",
                "group": "general"
            },
        };
    }

    /**
     * Parse any POST data into param key/value pairs
     *
     * @param postData
     * @return {Array}
     */
    parsePostData(postData = "")
    {
        let params = [],
            parsed = {};
        if(typeof postData === "string" && postData !== "")
        {
            try
            {
                parsed = JSON.parse(postData);
                /* Based on https://stackoverflow.com/a/19101235 */
                function recurse (cur, prop)
                {
                    if (Object(cur) !== cur)
                    {
                        params.push([prop, cur]);
                    }
                    else if (Array.isArray(cur))
                    {
                        for(var i=0, l=cur.length; i<l; i++)
                        {
                            recurse(cur[i], prop + "[" + i + "]");
                        }
                        if (l === 0)
                        {
                            params.push([prop, ""]);
                        }
                    }
                    else
                    {
                        let isEmpty = true;
                        for (let p in cur)
                        {
                            if(!cur.hasOwnProperty(p)) { continue; }
                            isEmpty = false;
                            recurse(cur[p], prop ? prop+"."+p : p);
                        }
                        if (isEmpty && prop)
                        {
                            params.push([prop, ""]);
                        }
                    }
                }
                recurse(parsed, "");
            }
            catch(e)
            {
                console.error("postData is not JSON", e.message);
            }
        }
        return params;
    }

    /**
     * Parse a given URL parameter into human-readable form
     *
     * @param {string}  name
     * @param {string}  value
     *
     * @returns {void|{}}
     */
    handleQueryParam(name, value)
    {
        let result = {};
        if(name.indexOf("attrs.") === 0) {
            result = {
                "key":   name,
                "field": name.replace("attrs.", ""),
                "value": value,
                "group": "customattributes"
            };
        } else {
            result = super.handleQueryParam(name, value);
        }
        return result;
    }

    /**
     * Parse custom properties for a given URL
     *
     * @param    {string}   url
     * @param    {object}   params
     *
     * @returns {void|Array}
     */
    handleCustom(url, params)
    {
        let results = [];

        // Client Code
        const clientCodeRe = /v\d\/JS\/(.+)\/Events$/;
        let clientCodematches =  url.pathname.match(clientCodeRe);
        if(clientCodematches !== null) {
            results.push({
                "key":   "clientCode",
                "field": "Client Code",
                "value": clientCodematches[1],
                "group": "general"
            });
        }

        // Event Types
        let eventType = params.get("n");
        const eventDict = {
            "pageView" : "Page View",
            "1" : "Session Start",
            "2" : "Session End",
            "10": "State Transition"
        };

        let eventTypeValue = !!(eventDict[eventType]) ? eventDict[eventType] : eventType;
        results.push({
            "key":   "requestTypeParsed",
            "field": "Event Type",
            "value": eventTypeValue,
            "group": "general"
        });
        return results;
    }
} // class