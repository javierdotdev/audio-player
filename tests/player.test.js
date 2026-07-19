const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const projectRoot = path.resolve(__dirname, '..');
const html = readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
const playerScript = readFileSync(
  path.join(projectRoot, 'javascripts', 'all.js'),
  'utf8'
);
const playerStyles = readFileSync(
  path.join(projectRoot, 'stylesheets', 'style.css'),
  'utf8'
);

function createPlayerDom() {
  const dom = new JSDOM(html, {
    runScripts: 'outside-only',
    url: 'http://localhost/'
  });
  const { window } = dom;
  const mediaState = new WeakMap();
  const mediaPrototype = window.HTMLMediaElement.prototype;

  function stateFor(media) {
    if (!mediaState.has(media)) {
      mediaState.set(media, {
        currentTime: 0,
        duration: 120,
        ended: false,
        paused: true
      });
    }
    return mediaState.get(media);
  }

  Object.defineProperties(mediaPrototype, {
    currentTime: {
      configurable: true,
      get() {
        return stateFor(this).currentTime;
      },
      set(value) {
        stateFor(this).currentTime = value;
      }
    },
    duration: {
      configurable: true,
      get() {
        return stateFor(this).duration;
      }
    },
    ended: {
      configurable: true,
      get() {
        return stateFor(this).ended;
      }
    },
    paused: {
      configurable: true,
      get() {
        return stateFor(this).paused;
      }
    }
  });

  mediaPrototype.load = function load() {
    const state = stateFor(this);
    state.currentTime = 0;
    state.ended = false;
    this.dispatchEvent(new window.Event('loadstart'));
    this.dispatchEvent(new window.Event('loadeddata'));
  };

  mediaPrototype.play = function play() {
    const state = stateFor(this);
    state.paused = false;
    state.ended = false;
    this.dispatchEvent(new window.Event('play'));
    this.dispatchEvent(new window.Event('playing'));
    return Promise.resolve();
  };

  mediaPrototype.pause = function pause() {
    stateFor(this).paused = true;
    this.dispatchEvent(new window.Event('pause'));
  };

  window.eval(playerScript);
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

  return dom;
}

test('initializes the first track with valid local sources', () => {
  const dom = createPlayerDom();
  const { document, audioPlayer } = dom.window;
  const sources = [...document.querySelectorAll('audio source')];

  assert.ok(audioPlayer);
  assert.equal(
    document.querySelector('.audio-player-song-name').textContent,
    'Sunhawk - She Snake Shuffle'
  );
  assert.deepEqual(
    sources.map((source) => source.getAttribute('src')),
    ['audio/she-snake.mp3']
  );

  dom.window.close();
});

test('plays, pauses and changes tracks without jQuery', async () => {
  const dom = createPlayerDom();
  const { document } = dom.window;
  const playButton = document.querySelector('.audio-player-place-pause-button');
  const nextButton = document.querySelector('.icon-forward');

  playButton.click();
  await Promise.resolve();
  assert.ok(playButton.classList.contains('icon-pause'));

  nextButton.click();
  assert.equal(
    document.querySelector('.audio-player-song-name').textContent,
    'Sunhawk - Shotgun Love'
  );
  assert.deepEqual(
    [...document.querySelectorAll('audio source')].map((source) => source.getAttribute('src')),
    ['audio/shotgun-love.mp3', 'audio/shotgun-love.m4a']
  );
  assert.ok(playButton.classList.contains('icon-pause'));

  playButton.click();
  assert.ok(playButton.classList.contains('icon-play'));

  dom.window.close();
});

test('seeks with the keyboard and updates accessibility state', () => {
  const dom = createPlayerDom();
  const { document, KeyboardEvent } = dom.window;
  const audio = document.querySelector('audio');
  const progress = document.querySelector('.audio-player-progress');

  progress.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
  audio.dispatchEvent(new dom.window.Event('timeupdate'));

  assert.equal(audio.currentTime, 5);
  assert.equal(progress.getAttribute('aria-valuenow'), '4');
  assert.equal(progress.getAttribute('aria-valuetext'), '0:05 of 2:00');

  dom.window.close();
});

test('preserves Font Awesome on the control buttons', () => {
  const buttonRule = playerStyles.match(/\.audio-player-button\s*\{[^}]+\}/);

  assert.ok(buttonRule, 'the control-button CSS rule must exist');
  assert.match(buttonRule[0], /font-family:\s*FontAwesome/);
  assert.doesNotMatch(buttonRule[0], /font:\s*inherit/);
});
