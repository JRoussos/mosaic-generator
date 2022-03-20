### The CLI Version of Mosaica
<hr>

Generate a mosaic quickly and localy from the terminal.

1. Same as before for you need the images folder, so run the python script in the /assets folder, or if you already have run it before for the server, you could just copy and paste those

2. Then `npm install` the dependencies

3. Type `node index <path_to_image>` to run it.

Example:

``` 
    node index demo.jpg 
```

### Options
<hr>

1. Use the `-s` option to change the scalnig factor. The scale controlling the area of the image that we'll pick a color sample from. The smaller the scale the bigger the mosaic it'll produce. (default is 4)   

    > The scale would be 1:<your_input> but for ease of use the option accepts numbers. So `-s 3` would be a 1:3 scaling. 
    >
     ```
    node index -s 3 demo.jpg 
    ```

2. Use the `-d` option to change the depth of the duplicates check. The algoritm uses logic to prevent same images ending up next to each other on the final mosaic. A depth check of 2 would check for the 2 neighbor images to be different. (default is 2)

    ```
    node index -s 2 -d 3 demo.jpg 
    ```

3. Use the `-t` option to change the size of the thumbnails. The images gotten by the python script are 200x200 so if you want thumbnails bigger than that you should edit the script too. (default is 50)

    > The thumbnails are squre images so, as you can imagine, only one number is needed to change the size. Meaning that `-t 150` would produce thumbnails 150x150 pixels. 
    >
    > Note that if you change the thumbnail size you probably have to change the final image's size to a bigger resolution also.  
    >
    ```
    node index -s 2 -t 200 demo.jpg 
    ```

4. Use the `-f` option to change the size of the final image. It accepts a number or the word 'auto'. If given an number, it will resize the image respecting the original aspect ratio of the input image. 

    If given the 'auto' keyword it'll keep the natural size of mosaic. I.e., the size of each thumbnail. For example with a thumbsnail size of 50 and 72 thumbs over the width of the image, the final width would be 3600px. 

    ```
    node index -s 4 -t 80 -f 1080 demo.jpg 
    ```

### Caveats and possible future changes
<hr>

1. Apparently there is a limit for the memory usage in V8 of around 1.7 GB. And because a large number of images are needed to be open in order to produce the final mosaic, options that enables high details could produce an 'Node.js heap out of memory' error. [Read at this StackOverflow post.](https://stackoverflow.com/questions/38558989/node-js-heap-out-of-memory)

    As it is described at the post above, one solution is to use the node option: `--max-old-space-size` and manualy set the memory limit.

    Example: 

    ```
    node --max-old-space-size=4096 index -s 1 -b 200 -f auto demo.jpg
    ```

2. I would like to experiment with thread workers, as it is my understanding that it may be better in terms of overall performance.