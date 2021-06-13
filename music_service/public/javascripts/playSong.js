let play = document.querySelector('#play')
let recent_volume = document.querySelector('#volume')
let volume_show = document.querySelector('#volume_show')
let slider = document.querySelector('#duration_slider')
let show_duration = document.querySelector('#show_duration')
let playing_song = false
let track = document.createElement('audio')
let timer

function load_track(){
    track.src = document.querySelector('#pathsong').textContent
    timer = setInterval(range_slider,1000)
}

load_track()

function justplay(){
    if(playing_song == false){
        playsong();
    }else{
        pausesong();
    }
}

function playsong(){
    track.play()
    playing_song = true
    play.innerHTML = '<i class="fa fa-pause"></i>'
}

function pausesong(){
    track.pause()
    playing_song = false
    play.innerHTML = '<i class="fa fa-play"></i>'
}

function volume_change(){
    volume_show.innerHTML = recent_volume.value
    track.volume = recent_volume.value/100
}

function change_duration(){
    slider_position = track.duration * (slider.value/100)
    track.currentTime = slider_position
}


function range_slider(){
    var position = 0
    if(!isNaN(track.duration)){
        position = track.currentTime * (100/track.duration)
        slider.value = position
    }
    if(track.ended){
        play.innerHTML = '<i class="fa fa-play"></i>'
        slider.value = 0
    }
}