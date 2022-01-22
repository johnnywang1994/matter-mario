import { Howl } from 'howler';

const getAudioUrl = (filename) => `/cdn/audio/${filename}`;

const audioConfigs = {
  bgm: {
    loop: true,
    path: {
      mpeg: getAudioUrl("music/mario_theme.mp3"),
    },
  },
  level_complete: {
    path: {
      mpeg: getAudioUrl("music/level_complete.mp3"),
    },
  },
  mario_death: {
    path: {
      wav: getAudioUrl("sounds/mario_death.wav"),
    }
  },
  powerup: {
    path: {
      wav: getAudioUrl("sounds/powerup.wav"),
    }
  },
  powerdown: {
    path: {
      wav: getAudioUrl("sounds/powerdown.wav"),
    }
  },
  powerup_spawn: {
    path: {
      wav: getAudioUrl("sounds/powerup_spawn.wav"),
    }
  },
  extra_life: {
    path: {
      mpeg: getAudioUrl("sounds/extra_life.mp3"),
    }
  },
  superstar: {
    path: {
      mpeg: getAudioUrl("sounds/superstar.mp3"),
    }
  },
  break_block: {
    path: {
      wav: getAudioUrl("sounds/break_block.wav"),
    }
  },
  stomp: {
    path: {
      wav: getAudioUrl("sounds/stomp.wav"),
    }
  },
  bump: {
    path: {
      wav: getAudioUrl("sounds/bump.wav"),
    }
  },
  jump: {
    path: {
      wav: getAudioUrl("sounds/jump.wav"),
    }
  },
  coin: {
    path: {
      wav: getAudioUrl("sounds/coin.wav"),
    }
  }
};

const audio = {};

Object.entries(audioConfigs).forEach(([audioKey, audioConfig]) => {
  audio[audioKey] = new Howl({
    loop: audioConfig.loop || false,
    src: [audioConfig.path.mpeg, audioConfig.path.wav],
  });
});

export default audio;
