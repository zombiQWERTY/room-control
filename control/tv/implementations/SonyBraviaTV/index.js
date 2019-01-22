const fetch = require('node-fetch');
const InputMap = require('./InputMap.json');
const AppMap = require('./AppMap.json');

const SYSTEM_SERVICE = 'system';
const AUDIO_SERVICE = 'audio';
const AV_CONTENT_SERVICE = 'avContent';
const APP_SERVICE = 'appControl';

class SonyBraviaTV {

  constructor(config) {
    this.ip = config.ip;
    this.psk = config.preSharedKey;
    this.port = config.port || 80;
    this.id = 0;
  }

  turnOn() {
    return this._sendCommand(
      SYSTEM_SERVICE,
      'setPowerStatus',
      [{ status: true }],
    );
  }

  turnOff() {
    return this._sendCommand(
      SYSTEM_SERVICE,
      'setPowerStatus',
      [{ status: false }],
    );
  }

  setVolume(volume) {
    return this._sendCommand(
      AUDIO_SERVICE,
      'setAudioVolume',
      [{ volume: '' + volume, target: 'speaker' }],
    );
  }

  getVolume() {
    return new Promise((resolve, reject) => {
      this._sendCommand(
        AUDIO_SERVICE,
        'getVolumeInformation',
      ).then(result => {
        for (var i in result) {
          if (result[i].target === 'speaker') {
            return resolve(result[i].volume);
          }
        }
        return reject('Speaker not found');
      }).catch(error => {
        reject(error);
      });
    });
  }

  incrementVolume(increment) {
    if (increment >= 0) {
      increment = '+' + increment;
    }
    return this.setVolume(increment);
  }

  getInput() {
    return new Promise((resolve, reject) => {
      this._sendCommand(
        AV_CONTENT_SERVICE,
        'getPlayingContentInfo',
      ).then(result => {
        resolve(result.title.replace(' ', ''));
      }).catch(error => {
        if (error.code === 7) {
          return resolve('Unknown');
        }
        reject(error);
      });
    });
  }

  setInput(inputValue) {
    return this._sendCommand(
      AV_CONTENT_SERVICE,
      'setPlayContent',
      [{ uri: InputMap[inputValue] }],
    )
  }

  startApp(identifier) {
    return this._sendCommand(
      APP_SERVICE,
      'setActiveApp',
      [{ uri: AppMap[identifier] }],
    );
  }

  setMute(value) {
    return this._sendCommand(
      AUDIO_SERVICE,
      'setAudioMute',
      [{ status: value }],
    );
  }

  _sendCommand(service, command, params = []) {
    let body = JSON.stringify({
      method: command,
      id: ++this.id,
      params: params,
      version: "1.0",
    });
    console.log('Sending: ' + body);
    return new Promise((resolve, reject) => {
      fetch('http://' + this.ip + ':' + this.port + '/sony/' + service, {
        method: 'post',
        headers: { 'X-Auth-PSK': this.psk },
        body: body,
      }).then(response => {
        return response.json();
      }).then(response => {
        if (response.error && (!response.result || response.result.length === 0)) {
          reject({ code: response.error[0] });
        } else {
          resolve(response.result[0]);
        }
      }).catch(error => {
        reject(error);
      });
    });
  }
}

module.exports = SonyBraviaTV;
