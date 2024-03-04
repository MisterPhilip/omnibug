/**
 * Sojern
 * https://www.sojern.com/
 *
 * @class
 * @extends BaseProvider
 */
class SojernProvider extends BaseProvider {
    constructor() {
        super();
        this._key = "SOJERN";
        this._pattern = /beacon\.sojern\.com/;
        this._name = "Sojern";
        this._type = "marketing";
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping() {
        return {
            "account": "pixelId",
            "requestType": "pt"
        };
    }

    /**
     * Retrieve the group names & order
     *
     * @returns {*[]}
     */
    get groups() {
        return [
            {
                "key": "general",
                "name": "General"
            },
            {
                "key": "hotel",
                "name": "Hotels"
            },
            {
                "key": "flight",
                "name": "Flights"
            },
            {
                "key": "cruise",
                "name": "Cruises"
            },
            {
                "key": "car",
                "name": "Cars"
            },
            {
                "key": "entertainment",
                "name": "Entertainment"
            },
            {
                "key": "rail",
                "name": "Rail"
            },
            {
                "key": "vacation",
                "name": "Vacation"
            }
        ];
    }

    /**
     * Get all the available URL parameter keys
     *
     * @returns {{}}
     */
    get keys() {
        return {
            "be": {
                "name": "Booking Engine Key",
                "group": "general"
            },
            "md5_eml": {
                "name": "Hashed Email (MD5)",
                "group": "general"
            },
            "sha1_eml": {
                "name": "Hashed Email (SHA1)",
                "group": "general"
            },
            "sha256_eml": {
                "name": "Hashed Email (SHA256)",
                "group": "general"
            },
            "ffl": {
                "name": "Loyalty Status",
                "group": "general"
            },
            "t": {
                "name": "Number of Travelers",
                "group": "general"
            },
            "tad": {
                "name": "Number of Adults",
                "group": "general"
            },
            "tch": {
                "name": "Number of Children",
                "group": "general"
            },
            "pgid": {
                "name": "Page ID",
                "group": "general"
            },
            "pname": {
                "name": "Page Name",
                "group": "general"
            },
            "pc": {
                "name": "Page Category",
                "group": "general"
            },
            "pt": {
                "name": "Page Type",
                "group": "general"
            },
            "ppot": {
                "name": "Purpose of Travel",
                "group": "general"
            },
            "rpnow": {
                "name": "Pay Now or Later",
                "group": "general"
            },
            "pn": {
                "name": "Product Name",
                "group": "general"
            },
            "fow": {
                "name": "One Way",
                "group": "general"
            },
            "fmc": {
                "name": "Multi-City",
                "group": "general"
            },
            "ptr": {
                "name": "Pets Traveling",
                "group": "general"
            },
            "pixelId": {
                "name": "Pixel ID",
                "group": "general"
            },
            "domain": {
                "name": "Domain",
                "group": "general"
            },
            "s": {
                "name": "debug",
                "group": "other"
            },
            "rphn": {
                "name": "Phone Number",
                "group": "general"
            },
            "md5_phn": {
                "name": "Phone Number (MD5)",
                "group": "general"
            },
            "sha1_phn": {
                "name": "Phone Number (SHA1)",
                "group": "general"
            },
            "sha256_phn": {
                "name": "Phone Number (SHA256)",
                "group": "general"
            },
            "sjrn_click_campaign_id": {
                "name": "Click Campaign ID",
                "group": "general"
            },
            "sjrn_click_placement_id": {
                "name": "Click Placement ID",
                "group": "general"
            },
            "sjrn_click_id": {
                "name": "Click ID",
                "group": "general"
            },
            "auto_out": {
                "name": "Auto Cookieless Opt-Out",
                "group": "other"
            },
            "dnf": {
                "name": "Do Not Fire",
                "group": "other"
            },
            "ccid": {
                "name": "Client Cookie ID",
                "group": "other"
            },
            "hb": {
                "name": "Hotel Brand",
                "group": "hotel"
            },
            "hpid": {
                "name": "Hotel Property ID",
                "group": "hotel"
            },
            "hpr": {
                "name": "Hotel Property",
                "group": "hotel"
            },
            "hcu": {
                "name": "Currency Code",
                "group": "hotel"
            },
            "hc1": {
                "name": "Hotel City",
                "group": "hotel"
            },
            "hs1": {
                "name": "Hotel State",
                "group": "hotel"
            },
            "hn1": {
                "name": "Hotel Country",
                "group": "hotel"
            },
            "hd": {
                "name": "Number of Nights",
                "group": "hotel"
            },
            "hd1": {
                "name": "Check In Date",
                "group": "hotel"
            },
            "hd2": {
                "name": "Check Out Date",
                "group": "hotel"
            },
            "ha1": {
                "name": "Nearest Airport",
                "group": "hotel"
            },
            "hr": {
                "name": "Number of Rooms",
                "group": "hotel"
            },
            "hc": {
                "name": "Room Type",
                "group": "hotel"
            },
            "hrp": {
                "name": "Rate Plan",
                "group": "hotel"
            },
            "hsr": {
                "name": "Star Rating",
                "group": "hotel"
            },
            "hoh": {
                "name": "Home Hotel",
                "group": "hotel"
            },
            "fd1": {
                "name": "Departure Date",
                "group": "flight"
            },
            "fd2": {
                "name": "Return Date",
                "group": "flight"
            },
            "fd": {
                "name": "Number of Nights",
                "group": "flight"
            },
            "fc": {
                "name": "Service Class",
                "group": "flight"
            },
            "ffc": {
                "name": "Fare Code",
                "group": "flight"
            },
            "fc2": {
                "name": "Origin City",
                "group": "flight"
            },
            "fs2": {
                "name": "Origin State",
                "group": "flight"
            },
            "fn2": {
                "name": "Origin Country",
                "group": "flight"
            },
            "fa1": {
                "name": "Origin Airport",
                "group": "flight"
            },
            "fc1": {
                "name": "Destination City",
                "group": "flight"
            },
            "fs1": {
                "name": "Destination State",
                "group": "flight"
            },
            "fn1": {
                "name": "Destination Country",
                "group": "flight"
            },
            "fa2": {
                "name": "Destination airport",
                "group": "general"
            },
            "fan": {
                "name": "Flight Company Name",
                "group": "general"
            },
            "lyvr": {
                "name": "Layover Airport #1",
                "group": "general"
            },
            "lyvr2": {
                "name": "Layover Airport #2",
                "group": "general"
            },
            "lyvr3": {
                "name": "Layover Airport #3",
                "group": "general"
            },



            "cd1": {
                "name": "Departure Date",
                "group": "cruise"
            },
            "cd2": {
                "name": "Return Date",
                "group": "cruise"
            },
            "ca1": {
                "name": "Nearest Departure Port Airport",
                "group": "cruise"
            },
            "cf2": {
                "name": "Departure City",
                "group": "cruise"
            },
            "cs2": {
                "name": "Departure State",
                "group": "cruise"
            },
            "cn2": {
                "name": "Departure Country",
                "group": "cruise"
            },
            "ca2": {
                "name": "Nearest Arrival Port Airport",
                "group": "cruise"
            },
            "cf1": {
                "name": "Arrival City",
                "group": "cruise"
            },
            "cs1": {
                "name": "Arrival State",
                "group": "cruise"
            },
            "cn1": {
                "name": "Arrival Country",
                "group": "cruise"
            },
            "cd": {
                "name": "Number of Nights",
                "group": "cruise"
            },
            "crl": {
                "name": "Number of Days",
                "group": "cruise"
            },
            "creg": {
                "name": "Region",
                "group": "cruise"
            },
            "cco": {
                "name": "Cruise Line",
                "group": "cruise"
            },
            "csh": {
                "name": "Cruise Ship",
                "group": "cruise"
            },
            "cm": {
                "name": "Cruise Month",
                "group": "cruise"
            },
            "cc": {
                "name": "Cruise Class",
                "group": "cruise"
            },
            "cr": {
                "name": "Number of Rooms",
                "group": "cruise"
            },
            "vt": {
                "name": "Attraction Type",
                "group": "cruise"
            },
        };
    }
}
