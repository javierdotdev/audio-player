/**
 * Audio Player
 * Dependency-free playlist player built with the HTML5 Audio API.
 */
(function () {
  'use strict';

  var TRACKS = [
    {
      image: 'images/sunhawk-small@2x.jpg',
      name: 'Sunhawk - She Snake Shuffle',
      sources: [
        { src: 'audio/she-snake.mp3', type: 'audio/mpeg' }
      ]
    },
    {
      image: 'images/sunhawk-small-2@2x.jpg',
      name: 'Sunhawk - Shotgun Love',
      sources: [
        { src: 'audio/shotgun-love.mp3', type: 'audio/mpeg' },
        { src: 'audio/shotgun-love.m4a', type: 'audio/mp4' }
      ]
    }
  ];

  var SEEK_STEP_SECONDS = 5;
  var COVER_FADE_MS = 200;

  function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
  }

  function formatTime(value) {
    if (!Number.isFinite(value) || value < 0) {
      return '0:00';
    }

    var minutes = Math.floor(value / 60);
    var seconds = Math.floor(value % 60).toString().padStart(2, '0');
    return minutes + ':' + seconds;
  }

  function requireElement(root, selector) {
    var element = root.querySelector(selector);
    if (!element) {
      throw new Error('Audio Player: missing required element ' + selector);
    }
    return element;
  }

  function validateTracks(tracks) {
    if (!Array.isArray(tracks) || tracks.length === 0) {
      throw new Error('Audio Player: the playlist must contain at least one track');
    }

    tracks.forEach(function (track, index) {
      if (!track.name || !track.image || !Array.isArray(track.sources) || track.sources.length === 0) {
        throw new Error('Audio Player: invalid track at index ' + index);
      }
    });
  }

  function AudioPlayer(root, tracks) {
    if (!(root instanceof HTMLElement)) {
      throw new Error('Audio Player: a valid root element is required');
    }

    validateTracks(tracks);

    this.root = root;
    this.tracks = tracks;
    this.currentIndex = 0;
    this.coverTimer = null;

    this.imageContainer = requireElement(root, '.audio-player-image');
    this.songName = requireElement(root, '.audio-player-song-name');
    this.progress = requireElement(root, '.audio-player-progress');
    this.progressBar = requireElement(root, '.audio-player-progress-bar');
    this.previousButton = requireElement(root, '.icon-backward');
    this.playButton = requireElement(root, '.audio-player-place-pause-button');
    this.nextButton = requireElement(root, '.icon-forward');

    this.audio = document.createElement('audio');
    this.audio.preload = 'metadata';
    this.audio.setAttribute('aria-hidden', 'true');
    this.root.appendChild(this.audio);

    this.cover = document.createElement('img');
    this.cover.alt = '';
    this.imageContainer.appendChild(this.cover);

    this.bindEvents();
    this.loadTrack(0, false, false);
  }

  AudioPlayer.prototype.currentTrack = function () {
    return this.tracks[this.currentIndex];
  };

  AudioPlayer.prototype.isPlaying = function () {
    return !this.audio.paused && !this.audio.ended;
  };

  AudioPlayer.prototype.bindEvents = function () {
    this.playButton.addEventListener('click', this.togglePlayPause.bind(this));
    this.previousButton.addEventListener('click', this.previous.bind(this));
    this.nextButton.addEventListener('click', this.next.bind(this));
    this.progress.addEventListener('pointerup', this.seekFromPointer.bind(this));
    this.progress.addEventListener('keydown', this.seekFromKeyboard.bind(this));

    this.audio.addEventListener('loadstart', this.setLoading.bind(this, true));
    this.audio.addEventListener('waiting', this.setLoading.bind(this, true));
    this.audio.addEventListener('stalled', this.setLoading.bind(this, true));
    this.audio.addEventListener('seeking', this.setLoading.bind(this, true));
    this.audio.addEventListener('loadeddata', this.setLoading.bind(this, false));
    this.audio.addEventListener('canplay', this.setLoading.bind(this, false));
    this.audio.addEventListener('playing', this.setLoading.bind(this, false));
    this.audio.addEventListener('seeked', this.setLoading.bind(this, false));
    this.audio.addEventListener('play', this.setPlaying.bind(this, true));
    this.audio.addEventListener('pause', this.setPlaying.bind(this, false));
    this.audio.addEventListener('timeupdate', this.updateProgress.bind(this));
    this.audio.addEventListener('durationchange', this.updateProgress.bind(this));
    this.audio.addEventListener('ended', this.handleEnded.bind(this));
    this.audio.addEventListener('error', this.handleError.bind(this));
  };

  AudioPlayer.prototype.loadTrack = function (index, autoplay, animateCover) {
    var track = this.tracks[index];

    this.currentIndex = index;
    this.audio.pause();
    this.audio.replaceChildren();
    this.root.classList.remove('error');

    track.sources.forEach(function (sourceData) {
      var source = document.createElement('source');
      source.src = sourceData.src;
      source.type = sourceData.type;
      this.audio.appendChild(source);
    }, this);

    this.songName.textContent = track.name;
    this.updateCover(track.image, animateCover !== false);
    this.resetProgress();
    this.audio.load();

    if (autoplay) {
      this.play();
    }
  };

  AudioPlayer.prototype.updateCover = function (source, animate) {
    var changeSource = function () {
      var removeFade = function () {
        this.cover.classList.remove('fading');
      }.bind(this);

      this.cover.addEventListener('load', removeFade, { once: true });
      this.cover.addEventListener('error', removeFade, { once: true });
      this.cover.src = source;
    }.bind(this);

    window.clearTimeout(this.coverTimer);

    if (!animate || !this.cover.getAttribute('src')) {
      changeSource();
      return;
    }

    this.cover.classList.add('fading');
    this.coverTimer = window.setTimeout(changeSource, COVER_FADE_MS);
  };

  AudioPlayer.prototype.play = function () {
    var playRequest = this.audio.play();

    if (playRequest && typeof playRequest.catch === 'function') {
      playRequest.catch(function (error) {
        this.setPlaying(false);
        console.error('Audio Player: playback could not start', error);
      }.bind(this));
    }
  };

  AudioPlayer.prototype.pause = function () {
    this.audio.pause();
  };

  AudioPlayer.prototype.togglePlayPause = function () {
    if (this.isPlaying()) {
      this.pause();
    } else {
      this.play();
    }
  };

  AudioPlayer.prototype.previous = function () {
    var autoplay = this.isPlaying();
    var previousIndex = (this.currentIndex - 1 + this.tracks.length) % this.tracks.length;
    this.loadTrack(previousIndex, autoplay, true);
  };

  AudioPlayer.prototype.next = function () {
    var autoplay = this.isPlaying();
    var nextIndex = (this.currentIndex + 1) % this.tracks.length;
    this.loadTrack(nextIndex, autoplay, true);
  };

  AudioPlayer.prototype.handleEnded = function () {
    this.setPlaying(false);

    if (this.currentIndex < this.tracks.length - 1) {
      this.loadTrack(this.currentIndex + 1, true, true);
    }
  };

  AudioPlayer.prototype.setPlaying = function (playing) {
    this.playButton.classList.toggle('icon-play', !playing);
    this.playButton.classList.toggle('icon-pause', playing);
    this.playButton.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  };

  AudioPlayer.prototype.setLoading = function (loading) {
    this.progress.classList.toggle('loading', loading);
  };

  AudioPlayer.prototype.handleError = function () {
    var mediaError = this.audio.error;
    var detail = mediaError ? ' (media error ' + mediaError.code + ')' : '';

    this.setLoading(false);
    this.setPlaying(false);
    this.root.classList.add('error');
    console.error('Audio Player: unable to load ' + this.currentTrack().name + detail);
  };

  AudioPlayer.prototype.resetProgress = function () {
    this.progressBar.style.width = '0%';
    this.progress.setAttribute('aria-valuenow', '0');
    this.progress.setAttribute('aria-valuetext', '0:00 of 0:00');
  };

  AudioPlayer.prototype.updateProgress = function () {
    var duration = this.audio.duration;
    var currentTime = this.audio.currentTime;
    var percentage = Number.isFinite(duration) && duration > 0
      ? clamp((currentTime / duration) * 100, 0, 100)
      : 0;

    this.progressBar.style.width = percentage + '%';
    this.progress.setAttribute('aria-valuenow', String(Math.round(percentage)));
    this.progress.setAttribute(
      'aria-valuetext',
      formatTime(currentTime) + ' of ' + formatTime(duration)
    );
  };

  AudioPlayer.prototype.seekTo = function (time) {
    if (!Number.isFinite(this.audio.duration)) {
      return;
    }

    this.audio.currentTime = clamp(time, 0, this.audio.duration);
    this.updateProgress();
  };

  AudioPlayer.prototype.seekFromPointer = function (event) {
    var bounds = this.progress.getBoundingClientRect();
    var ratio = bounds.width > 0 ? (event.clientX - bounds.left) / bounds.width : 0;
    this.seekTo(clamp(ratio, 0, 1) * this.audio.duration);
  };

  AudioPlayer.prototype.seekFromKeyboard = function (event) {
    var nextTime;

    if (event.key === 'ArrowLeft') {
      nextTime = this.audio.currentTime - SEEK_STEP_SECONDS;
    } else if (event.key === 'ArrowRight') {
      nextTime = this.audio.currentTime + SEEK_STEP_SECONDS;
    } else if (event.key === 'Home') {
      nextTime = 0;
    } else if (event.key === 'End') {
      nextTime = this.audio.duration;
    } else {
      return;
    }

    event.preventDefault();
    this.seekTo(nextTime);
  };

  function initialize() {
    var root = document.getElementById('audio-player');
    window.audioPlayer = new AudioPlayer(root, TRACKS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
}());
