/**
 * Segment
 * https://segment.com/
 *
 * @class
 * @extends BaseProvider
 */
class SegmentProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "SEGMENT";
        this._pattern    = /api\.segment\.io\//;
        this._name       = "Segment";
        this._type       = "analytics";
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "requestType":  "omnibug_requestType"
        }
    }

    /**
     * Get all of the available URL parameter keys
     *
     * @returns {{}}
     */
    get keys()
    {
        return {

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
     * Parse custom properties for a given URL
     *
     * @param {string} url
     *
     * @returns {Array}
     */
    handleCustom(url)
    {
        let results = [],
            action = url.pathname.match(/\/v1\/([^\/]+)$/);
        if(action) {
            let type = action[1].toLowerCase();
            if(type === "p" || type === "page") {
                type = "Page";
            } else if(type === "i" || type === "identify") {
                type = "Identify";
            } else if(type === "t" || type === "track") {
                type = "Track";
            } else if(type === "s" || type === "screen") {
                type = "Screen";
            } else if(type === "g" || type === "group") {
                type = "Group";
            } else if(type === "a" || type === "alias") {
                type = "Alias";
            } else if(type === "b" || type === "batch") {
                type = "Batch";
            }

            results.push({
                "key":   "omnibug_requestType",
                "value": type,
                "hidden": true
            });
        }
        return results;
    }
}