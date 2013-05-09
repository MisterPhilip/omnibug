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
# Requires: ImageMagick tools
#

BRIGHTNESS=0
CONTRAST=-60

# Vertical spacer between the 24px images
convert -size 24x16 canvas:transparent -transparent-color white canvas.png

# Darken the small inactive image
convert -brightness-contrast "${BRIGHTNESS}x${CONTRAST}" o-24.png o-24-dark.png

# Create 24px vertical sprite
convert -append o-24.png canvas.png o-24-dark.png o-24-2x.png
rm canvas.png
rm o-24-dark.png

# Darken the large inactive image
convert -brightness-contrast "${BRIGHTNESS}x${CONTRAST}" o-32.png o-32-dark.png

# Create 32px vertical sprite
convert -append o-32.png o-32-dark.png o-32-2x.png
rm o-32-dark.png

# Combine sprites horizontally
convert +append o-32-2x.png o-24-2x.png o-32-24.png
rm o-32-2x.png o-24-2x.png

