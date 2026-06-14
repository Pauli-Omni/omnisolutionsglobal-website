(function () {
  'use strict';

  window.OSGVoiceTracks = {
    resolveTrack: function () {
      return (window.OSG_VOICE_CONFIG && OSG_VOICE_CONFIG.brandVoiceMp3) ||
        'assets/audio/omni-homepage-voice.mp3';
    }
  };
})();
