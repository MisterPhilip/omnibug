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
            {
                "key": "userattributes",
                "name": "User Attributes"
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
            "lc" : {
                "name": "Location (lc)",
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
            "str" : {
                "name": "Event Store (str)",
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
        } else if (name.indexOf("ua.") === 0) {
            result = {
                "key":   name,
                "field": name.slice(3,name.length),
                "value": value,
                "group": "userattributes"
            };   
        } else if (name.indexOf("ui[") === 0) {
            // hide  
            result = {
                "key": name,
                "value": value,
                "hidden": true
            };
        }
         else {
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

        // Event Type Value parsed (et)
        let etType = params.get("et");
        if (etType) {
            const etDict = {
                "0": "Unknown",
                "1": "Navigation",
                "2": "Location",
                "3": "Search",
                "4": "Transaction",
                "5": "UserContent",
                "6": "UserPreference",
                "7": "Social",
                "8": "Other",
                "9": "Media",
                "10": "ProductAddToCart",
                "11": "ProductRemoveFromCart",
                "12": "ProductCheckout",
                "13": "ProductCheckoutOption",
                "14": "ProductClick",
                "15": "ProductViewDetail",
                "16": "ProductPurchase",
                "17": "ProductRefund",
                "18": "PromotionView",
                "19": "PromotionClick",
                "20": "ProductAddToWishlist",
                "21": "ProductRemoveFromWishlist",
                "22": "ProductImpression",
                "23": "Attribution",
            };
            let etValue = !!(etDict[etType]) ? etDict[etType] : etType;
            results.push({
                "key":   "etParsed",
                "field": "Event Type Value",
                "value": etValue,
                "group": "general"
            });    
        }
        
        // Data type value parsed
        let dataType = params.get("dt");
        if (dataType) {
            const dataTypeDict = {
                "1": "Session Start",
                "2": "Session End",
                "3": "Screen View",
                "4": "Custom Event",
                "5": "Crash Report",
                "6": "Opt Out",
                "10": "App State Transition",
                "14": "Profile Change Message",
                "16": "Commerce Event",
            };
            let dataTypeValue = !!(dataTypeDict[dataType]) ? dataTypeDict[dataType] : dataType;
            results.push({
                "key":   "dtvalue",
                "field": "Data Type Value",
                "value": dataTypeValue,
                "group": "general"
            });    
        }
        
        // Event Name (n) value parsed to requesttype
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
            "field": "Request Type",
            "value": eventTypeValue,
            "group": "general"
        });

        // uid
        const identityTypeDict = {
            "0": "other",
            "1": "customerid",
            "2": "facebook",
            "3": "twitter",
            "4": "google",
            "5": "microsoft",
            "6": "yahoo",
            "7": "email",
            "8": "facebookcustomaudienceid",
            "9": "other2",
            "10": "other3",
            "11": "other4"
        };

        let uiArray = [];
        for (let p of params.entries()) {
            let k = p[0],
                v = p[1];
            if (k.indexOf("ui[") === 0) {
                 uiArray.push(k);
                 uiArray.push(v);
            }
        }
        
        let output = [];
        uiArray.map( (e, idx) => {
            if (idx === 0 || idx % 4 === 0) {
                output.push([e, uiArray[idx+1], uiArray[idx+2], uiArray[idx+3]]);
            }
        });

        output.forEach(e => {
            let idValue = e.toString().split(",")[1];
            let typeValue = e.toString().split(",")[3];
            results.push({
                "key":   identityTypeDict[typeValue] ? identityTypeDict[typeValue] : typeValue,
                "field": `Identity: ${identityTypeDict[typeValue]} (${typeValue})`,
                "value": idValue,
                "group": "userattributes"
            });
        });

        return results;
    }
} // class