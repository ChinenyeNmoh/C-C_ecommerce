const express = require('express');
const passport = require('../passport');
const { getConnect, getDisconnect } = require('../controllers/AuthController');
const { postNew, getMe } = require('../controllers/UsersController');

const router = express.Router();

// router.get('/status', getStatus);
// router.get('/stats', getStats);
router.post('/users', postNew);
router.get('/users/me', getMe);
router.get('/connect', getConnect);
router.get('/disconnect', getDisconnect);
// router.post('/files', postUpload);
// router.get('/files', getIndex);
// router.get('/files/:id', getShow);
// router.put('/files/:id/publish', putPublish);
// router.put('/files/:id/unpublish', putUnpublish);
// router.get('/files/:id/data', getFile);

/** *********** Authentication *******************/
router.get('/auth/google', passport.authenticate('google', {

  scope: ['profile', 'email']
}
));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/');
});

module.exports = router;
