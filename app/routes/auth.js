var authController = require('../controllers/authcontroller.js');

module.exports = function(app, passport) {

    app.route('/signup')
      .get(authController.signup)
      .post(isCoded, passport.authenticate('local-signup', {
              successRedirect: '/dashboard',
              failureRedirect: '/signup'
          }

      ));

    app.route('/signin/:loginFailure?')
      .get(authController.signin)
      .post(passport.authenticate('local-signin', {
              successRedirect: '/dashboard',
              failureRedirect: '/signin/true'
          }
      ));
    
    app.route('/forgotPassword')
      .get(authController.forgotPassword)
      .post(authController.forgotPasswordSend);
    
    app.route('/reset/:token')
     .get(authController.resetPassword)
     .post(authController.updatePassword);

    app.route('/hall')
      .get(isLoggedIn, authController.hall);

    app.route('/teamEdit/:teamId?')
      .get(isAdmin, authController.teamEdit)
      .post(isAdmin, authController.teamSave);
    
    app.route('/gameEdit/:gameId?')
      .get(isAdmin, authController.gameEdit)
      .post(isAdmin, authController.gameSave);

    app.route('/teamList')
      .get(isAdmin, authController.teamList);

    app.route ('/')
      .get(authController.signin);

    app.route('/dashboard')
      .get(isLoggedIn, authController.dashboard);

    app.route('/logout')
      .get(authController.logout);
    
    app.route('/timeslotEdit/:timeslotId?')
      .get(isAdmin, authController.timeslotEdit)
      .post(isAdmin, authController.timeslotSave);

    app.route('/betEdit/:timeslotId?/:betId?/:teamId?')
      .get(isLoggedIn, authController.betEdit)
      .post(isLoggedIn, authController.betSave);
    
    app.route('/betDelete')
      .post(isLoggedIn, authController.betDelete);
    
    app.route('/lockSave/:snapshotId')
      .post(isLoggedIn, authController.lockSave);

    app.route('/myBets')
      .get(isLoggedIn, authController.myBets);

    app.route('/rank')
      .get(isLoggedIn, authController.rank);

    app.route('/admin')
      .get(isAdmin, authController.admin);

    app.route('/advanceLock')
      .post(isAdmin, authController.advanceLock);

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();
        res.redirect('/signin');
    }

    function isAdmin(req,res,next) {
      if(req.isAuthenticated() && req.user.isAdmin === true)
        return next();
      res.redirect('/dashboard');
    }

    function isCoded(req,res,next) {
        if(req.body.keycode ==='magicman')
          return next();
        res.redirect('/signup');
    }
}
