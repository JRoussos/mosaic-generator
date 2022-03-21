import requests
import json
import os
import urlparse
import random

from colorthief import ColorThief

def rgb2lab (rgb) :
  RGB = [0, 0, 0]

  for idx, value in enumerate(rgb) :
    value = float(value) / 255

    if value > 0.04045 :
      value = ( ( value + 0.055 ) / 1.055 ) ** 2.4
    else :
      value = value / 12.92

    RGB[idx] = value

  XYZ = [0, 0, 0]

  XYZ[ 0 ] = RGB [0] * 0.4124 + RGB [1] * 0.3576 + RGB [2] * 0.1805
  XYZ[ 1 ] = RGB [0] * 0.2126 + RGB [1] * 0.7152 + RGB [2] * 0.0722
  XYZ[ 2 ] = RGB [0] * 0.0193 + RGB [1] * 0.1192 + RGB [2] * 0.9505

  XYZ[ 0 ] = float( XYZ[ 0 ] ) / 0.95047
  XYZ[ 1 ] = float( XYZ[ 1 ] ) / 1.00000
  XYZ[ 2 ] = float( XYZ[ 2 ] ) / 1.08883

  for idx, value in enumerate(XYZ) :

    if value > 0.008856 :
      value = value ** ( 1.0/3.0 )
    else :
      value = ( 7.787 * value ) + ( 16.0 / 116.0 )

    XYZ[idx] = value

  Lab = [0, 0, 0]

  Lab [ 0 ] = ( 116.0 * XYZ[ 1 ] ) - 16.0
  Lab [ 1 ] = 500.0 * ( XYZ[ 0 ] - XYZ[ 1 ] )
  Lab [ 2 ] = 200.0 * ( XYZ[ 1 ] - XYZ[ 2 ] )

  return Lab

def main () :
  outfile = open("photos2.json", 'w')
  list = []

  colorList = ['red', 'orange', 'yellow', 'green', 'turquoise', 'blue', 'violet', 'pink', 'brown', 'black', 'gray', 'white']
  count = 0

  isExist  = os.path.exists('./photos')
  if not isExist:
    os.makedirs('./photos')

  for color in range(len(colorList)): 
    for i in range(100): 
      randomNumber = random.randint(0, i)
      count += 1

      res = requests.get('https://source.unsplash.com/random/200x200?sig=' + str(randomNumber) + '&' +colorList[color])

      file = open("./photos/photo"+str(count)+".jpg", "wb")
      file.write(res.content)
      file.close()

      ixid = urlparse.urlparse(res.url).path
      # ixid = urlparse.parse_qs(parsed.query)['ixid'][0]

      print(ixid + ' \t[DONE]') 

      color_thief = ColorThief("./photos/photo"+str(count)+".jpg")
      dominant_color = color_thief.get_color(quality=1)

      photo = {
          "id": ixid[1:],
          "count": count,
          "url": res.url,
          "path": "./assets/photos/photo"+str(count)+".jpg",
          "dominantColor": rgb2lab(dominant_color),
          "colorCategory": colorList[color]
      }

      list.append(photo)

    raw_input("Color: '" + colorList[color] + "' finished. Press enter to continue...")
      
  json.dump(list, outfile)

if __name__ == '__main__':
  main()

# Output example:

# {
#   "count": 56,
#   "dominantColor": [
#       1.096693984095186,
#       0.0001492039488348862,
#       -0.0002952203635442352
#   ],
#   "url": "https://images.unsplash.com/photo-1580142772672-074840f8b74e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=200&ixid=MnwxfDB8MXxyYW5kb218MHx8cmVkfHx8fHx8MTY0NTI3NDYxNw&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=200",
#   "path": "/photos/photo56.jpg",
#   "colorCategory": "red",
#   "id": "photo-1580142772672-074840f8b74e"
# }
