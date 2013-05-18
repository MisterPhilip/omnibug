#!/bin/bash
#
# This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
# To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send
# a letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041,
# USA.
#
# Creates the devtools panel icon
#   Icon requirements:
#     Aa
#     Bb
#   Where
#     A = 32x32 inactive (undocked)
#     B = 32x32 clicked  (undocked)
#     a = 24x24 inactive (docked)
#     b = 24x24 clicked  (docked)
#
# Requires: ImageMagick tools (http://www.imagemagick.org/)
#

BRIGHTNESS=0
CONTRAST=-60



#######################################

command -v convert >/dev/null 2>&1 || {
    echo "$0: ImageMagick \`convert' command not found.  Aborting." >&2; echo; exit 1;
}

SMALL_ICON=$1
LARGE_ICON=$2

if [[ ! -e "${SMALL_ICON}" || ! -e "${LARGE_ICON}" ]]; then
    echo "Usage: $0 <small_icon> <large_icon>, where small_icon is 24x24px, and large_icon is 32x32px"
    echo
    exit 2
fi

DEST_ICON="$( basename ${SMALL_ICON} )_$( basename ${LARGE_ICON} )_sprite.png"
if [[ -e "${DEST_ICON}" ]]; then
    echo "Destination icon ${DEST_ICON} exists; please remove before continuing"
    echo
    exit 3
fi



# Vertical spacer between the 24px images
convert -size 24x16 canvas:transparent -transparent-color white canvas.png

# Darken the small inactive image
convert -brightness-contrast "${BRIGHTNESS}x${CONTRAST}" ${SMALL_ICON} ${SMALL_ICON}_dark

# Create 24px vertical sprite
convert -append ${SMALL_ICON} canvas.png ${SMALL_ICON}_dark ${SMALL_ICON}_sprite
rm canvas.png
rm ${SMALL_ICON}_dark

# Darken the large inactive image
convert -brightness-contrast "${BRIGHTNESS}x${CONTRAST}" ${LARGE_ICON} ${LARGE_ICON}_dark

# Create 32px vertical sprite
convert -append ${LARGE_ICON} ${LARGE_ICON}_dark ${LARGE_ICON}_sprite
rm ${LARGE_ICON}_dark

# Combine sprites horizontally
convert +append ${LARGE_ICON}_sprite ${SMALL_ICON}_sprite ${DEST_ICON}
rm ${LARGE_ICON}_sprite ${SMALL_ICON}_sprite

echo "Created ${DEST_ICON}"

