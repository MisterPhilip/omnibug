/**
 * Optimizely
 * https://www.optimizely.com/
 *
 * @class
 * @extends BaseProvider
 */
class OptimizelyXProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "OPTIMIZELYX";
        this._pattern    = /\.optimizely\.com\/log\/event/;
        this._name       = "Optimizely X";
        this._type       = "testing";
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "account":      "mbox"
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
}
OmnibugProvider.addProvider(new OptimizelyXProvider());