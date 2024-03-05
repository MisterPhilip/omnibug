/**
 * Vibes
 * https://developer-platform.vibes.com/docs/implementing-vibes-tags
 *
 * @class
 * @extends BaseProvider
 */
class VibesProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "VIBES";
        this._pattern    = /tagtracking\.(?:vibescm\.com|eu\.vibes\.com)\/track/;
        this._name       = "Vibes";
        this._type       = "marketing";
        this._keywords   = [];
    }
}
