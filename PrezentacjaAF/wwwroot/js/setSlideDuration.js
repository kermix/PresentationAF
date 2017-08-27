// Code to get duration of audio /video file before upload - from: http://coursesweb.net/

    //register canplaythrough event to #audio element to can get duration
    var f_duration = 0;  //store duration
    document.getElementById('audio').addEventListener('canplaythrough', function (e) {
        //add duration in the input field #f_du
        f_duration = Math.round(e.currentTarget.duration);
        document.getElementById('SlideLength').value = f_duration;
        URL.revokeObjectURL(obUrl);
    });

    //when select a file, create an ObjectURL with the file and add it in the #audio element
    var obUrl;
    document.getElementById('MusicFile').addEventListener('change', function (e) {
        var file = e.currentTarget.files[0];
        //check file extension for audio/video type
        if (file.name.match(/\.(mp3|mpeg|ogg)$/i)) {
            obUrl = URL.createObjectURL(file);
            document.getElementById('audio').setAttribute('src', obUrl);
        }
    });