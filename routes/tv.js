const express = require('express');
const router = express.Router();

const tvImpl = require(__basedir + '/control/tv');

function wrapCommand(res, commandPromise) {
  return commandPromise.then(value => {
    if (!value) {
      res.sendStatus(200);
    } else {
      res.send({ value: value });
    }
  }).catch(error => {
    console.error('Error during request: ' + JSON.stringify(error));
    res.status(500).send(JSON.stringify(error));
  });
}

router.post('/turnOn', function(req, res, next) {
  return wrapCommand(res, tvImpl.turnOn());
});

router.post('/turnOff', function(req, res, next) {
  return wrapCommand(res, tvImpl.turnOff());
});

router.get('/volume', function(req, res, next) {
  return wrapCommand(res, tvImpl.getVolume());
});

router.post('/volume/:value', function(req, res, next) {
  return wrapCommand(res, tvImpl.setVolume(parseInt(req.params.value)));
});

router.post('/incrementVolume/:value', function(req, res, next) {
  return wrapCommand(res, tvImpl.incrementVolume(parseInt(req.params.value)));
});

router.get('/input', function(req, res, next) {
  return wrapCommand(res, tvImpl.getInput());
});

router.post('/input/:input', function(req, res, next) {
  return wrapCommand(res, tvImpl.setInput(req.params.input));
});

router.post('/apps/:app/start', function(req, res, next) {
  return wrapCommand(res, tvImpl.startApp(req.params.app));
});

router.post('/mute', function(req, res, next) {
  return wrapCommand(res, tvImpl.setMute(true));
});

router.post('/unmute', function(req, res, next) {
  return wrapCommand(res, tvImpl.setMute(false));
});

router.post('/remote/:command', function(req, res, next) {
  return wrapCommand(res, tvImpl.sendRemoteCommand(req.params.command));
});

router.post('/ircc/:code', function(req, res, next) {
  return wrapCommand(res, tvImpl._sendIRCCCommand(req.params.code));
});

module.exports = router;
