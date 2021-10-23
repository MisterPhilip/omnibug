/**
 * 6Sense
 * https://6sense.com/platform/
 *
 * @class
 * @extends BaseProvider
 */
class SixSenseProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "SIXSENSE";
        this._pattern    = /6sense\.com\/v3\/company\/details/;
        this._name       = "6Sense";
        this._type       = "visitorid";
        this._keywords   = ["ip lookup"];
    }
}
