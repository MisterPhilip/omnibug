/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

if ( typeof Omnibug == "undefined" ) {
    dump( ">>>   OmnibugContext: creating new Omnibug object\n" );
    var Omnibug = {};
}

Omnibug.OmnibugContext = function( panel ) {
    dump( ">>>   OmnibugContext: constructor, panel=" + panel + "\n" );
};

/**
 * Toggle a row
 * @param {Event} evt DOM event fired for the click
 */
Omnibug.OmnibugContext.prototype.toggle = function( evt ) {
    //dump( ">>>   OmnibugContext: toggle, evt=" + evt + "\n" );

    var i, img,
        el = evt.target,
        tr = el.parentNode.parentNode.parentNode,
        td = tr.getElementsByTagName( "td" ),
        div = tr.getElementsByTagName( "div" )[0];

    // change expand/collapse icon
    for( i=0; i<td.length; ++i ) {
        if( td[i].className.match( /exp/ ) ) {
           img = td[i].getElementsByTagName( "img" )[0];
           if( img ) {
               img.src = "chrome://omnibug/skin/twisty" + ( img.src.match( /Closed/ ) ? "Open" : "Closed" ) + ".png";
           }
        }
    }

    // hide/show the content div
    if( div.className.match( /hid/ ) ) {
        div.className = 'reg';
    } else {
        div.className = 'hid';
    }
}

