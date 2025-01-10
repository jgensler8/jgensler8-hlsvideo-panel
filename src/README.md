# Hls-Video

stream m3u8 to your dashboard:

![example](https://github.com/jgensler8/jgensler8-hlsvideo-panel/blob/main/img/example.png?raw=true)

## Overview / Introduction

This plugins wraps the html [`<video>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video) element and uses [HLS.js](https://github.com/video-dev/hls.js/) for initialization.

It exposes various video element configuration parameters:

* src
* autoplay
* controls / controlslist
* crossorigin
* disablepictureinpicture
* disableremoteplayback
* loop
* muted
* playsinline
* poster
* preload

It also exposes the `style` parameter override if you need to customize the width/height of the video element.
The default behvaior is 100% width and 100% height which should always show the entire video and avoid any scroll boxes.

## Requirements

* none, hls.js is bundled with the plugin and not loaded via CDN

## Getting Started

1. configure panel with "HLS Video"
2. add m3u8 data source
3. configure panel (likely with `controls` and `autoplay`)

## Documentation

Here are is a docker compose config I am using to host my USB camera running on a raspberry pi:

```yml
services:
  server:
    build: ./nginx
    ports:
    - 8080:8080
    volumes:
    - hls:/hls
    
  ffmpeg_2:
    image: linuxserver/ffmpeg:version-7.1-cli
    restart: always
    devices:
      - /dev/video2:/dev/video2   # this is your USB camera device
    volumes:
      - hls:/hls
    command: >
      -f v4l2 -i /dev/video2
      -c:v libx264 -preset veryfast -tune zerolatency
      -f hls -hls_time 10 -hls_list_size 8640 -hls_start_number_source epoch -hls_flags delete_segments+round_durations+temp_file
      /hls/stream.m3u8
volumes:
  hls:
```

### nginx build config

<details>

and the following `nginx.conf`

```
worker_processes 1;

events {
    worker_connections 64;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 8080;
        root  /usr/share/nginx/html;

        location /hls {
            alias /hls/;
            types {
                application/vnd.apple.mpegURL m3u8;
                video/MP2T ts;
            }
            add_header 'Cache-Control' 'no-cache';
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, HEAD, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Range';
        }

        location / {
            try_files $uri $uri/ =404;
            add_header 'Cache-Control' 'no-cache';
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, HEAD, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Range';
        }
    }
}
```

index.html (useful to test hls.js outside of the plugin)
```
<html>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HLS Stream</title>
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
</head>

<body>
    <video id="video" controls autoplay style="width: 100%;"></video>
    <script>
        const video = document.getElementById('video');
        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource('http://localhost:8080/hls/stream.m3u8');
            hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegURL')) {
            video.src = 'http://localhost:8080/hls/stream.m3u8';
        } else {
            console.error('Your browser does not support HLS.');
        }
    </script>
</body>

</html>
```

dockerfile:
```
FROM nginx:1.27.3
COPY nginx.conf /etc/nginx/nginx.conf
COPY index.html /usr/share/nginx/html
```

</details>
