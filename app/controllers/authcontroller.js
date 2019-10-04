var exports = module.exports = {};
var db = require("../../app/models");

const nodemailer = require('nodemailer');
const mailgunTransport = require('nodemailer-mailgun-transport');
var bCrypt = require('bcrypt-nodejs');

const mailgunOptions = {
    auth: {
      api_key: process.env.MAILGUN_ACTIVE_API_KEY,
      domain: process.env.MAILGUN_DOMAIN,
    }
};

const fromEmail = process.env.fromEmail;

const transport = mailgunTransport(mailgunOptions);
const emailClient = nodemailer.createTransport(transport);

exports.signup = function(req, res) {
    res.render('signup');
}

exports.signin = function(req, res) {
    if (req.params.loginFailure){
        req.flash('error', 'Login Failed');
    }
    res.render('signin');
}

exports.dashboard = function(req, res) {
    let viewObject={};
    db.Timeslot.findAll({
        include: 
            [
                {
                    model: db.Game, 
                    include: [
                        {
                            model: db.Team, 
                            as: 'HomeTeam', 
                            include: [{
                                model:db.Bet, 
                                where: {userId: req.user.id},
                                required: false
                            }]
                        }, 
                        {
                            model: db.Team, 
                            as: 'AwayTeam',
                            include: [{
                                model: db.Bet,
                                where: {userId: req.user.id},
                                required: false
                            }]
                        }
                        
                    ]
                },
                {
                    model: db.Snapshot,
                    required: false,
                    where: {userId: req.user.id}  
                }
            ],
            order: ['id',[db.Game,'gameTime','asc']]
    }).then(allTimeSlots =>{ 
        viewObject.slots = allTimeSlots;
        return allTimeSlots;
    }).then(()=>{
        db.Bet.findAll({
            attributes: [[db.sequelize.fn('COUNT', 'id'),'BetCount'], [db.sequelize.fn('SUM',db.sequelize.col('amount')),'BetAmount']],
            where: {userId: req.user.id}
    }).then(allBets =>{
            viewObject.bets = allBets;
            res.render('dashboard', viewObject);
        })    
        
    })
}

exports.lockSave = function(req,res){
    db.Snapshot.findOne({
        where: {
            id: req.params.snapshotId,
            userId: req.user.id
        }
    }).then(snapshot =>{
        return snapshot.update({
            locked: 1
        })
    }).then(()=>{
        res.redirect('/dashboard');
    })
}

exports.hall = function(req,res){
    db.Hall.findAll().then(hall =>{
        res.render('hall',{hall: hall})
    })
}

exports.teamEdit = function(req,res){
    db.Team.findByPk(req.params.teamId).then(singleTeam => {
      res.render('teamEdit', {team: singleTeam});
    })

}

exports.teamSave = function(req,res){
    if (req.body.teamId){
        db.Team.findByPk(req.body.teamId).then(team =>{
            return team.update(req.body);
        }).then(() => {
            res.redirect('back');
        })
    }else{
        db.Team.create(req.body).then(newTeam =>{
            res.redirect('/teamEdit/'+newTeam.id);
        })
    }
}

exports.betEdit = function(req,res){
    if (req.params.teamId != "false"){
        db.Team.findByPk(req.params.teamId).then(singleTeam =>{
            res.render('betEdit', {team: singleTeam, timeSlotId: req.params.timeslotId, layout:false});
        })
    } else {
        db.Bet.findOne({where:{id: req.params.betId}, include: db.Team}).then(singleBet =>{
            res.render('betEdit', {bet: singleBet, timeSlotId: req.params.timeslotId, layout:false});
        })
    }
}

exports.betSave = function(req,res){
    if(req.body.betId){

        let oldBet;

        db.Bet.findByPk(req.body.betId)
            .then(foundBet =>{
                oldBet = foundBet.amount;
                return foundBet.update(req.body);
            })
            .then(() =>{
                let newBankroll = parseFloat(req.user.bankroll) + parseFloat(oldBet) - parseFloat(req.body.amount);
                
                return db.User.update(
                    {bankroll: newBankroll},
                    {where: {id: req.user.id}}
                )
            })
            .then(()=>{
                res.redirect('/dashboard');
            });
        
    }else{
        req.body.userId= req.user.id;
        db.Bet.create(req.body).then(newBet =>{
            return newBet;
        }).then(()=>{
            let newBankroll = parseFloat(req.user.bankroll) - parseFloat(req.body.amount);
            return db.User.update(
                {bankroll: newBankroll},
                {where: {id: req.user.id}}
            )
        })
        .then(()=>{
            res.redirect('/dashboard');
        })
    }
}

exports.betDelete = function(req,res){
    let betAmount;
    db.Bet.findOne({
        where: {userId: req.user.id, id: req.body.betId}
    }).then(bet =>{
        betAmount = bet.amount;
        bet.destroy();
    }).then(()=>{
        let newBankroll = parseFloat(betAmount) + parseFloat(req.user.bankroll);
        return db.User.update(
            {bankroll: newBankroll},
            {where: {id: req.user.id}}
        )
    }).then(()=>{
        res.redirect('/dashboard');
    })
}

exports.myBets = function(req, res){
    db.Bet.findAll({
        where: {userId: req.user.id},
        include: [{
            model: db.Team
        }]
    }).then(allBets=>{
        res.render('myBets',{bets: allBets});
    })
}

exports.timeslotEdit = function(req,res){
    db.Timeslot.findByPk(req.params.timeslotId).then(singleTimeslot => {
      res.render('timeslotEdit', {timeslot: singleTimeslot});
    })
}

exports.timeslotSave = function(req,res){
    if (req.body.timeslotId){
        req.body.active = Boolean(req.body.active);
        db.Timeslot.findByPk(req.body.timeslotId).then(timeslot =>{
            return timeslot.update(req.body);
        }).then(() => {
            res.redirect('back');
        })
    }else{
        db.Timeslot.create(req.body).then(newTimeslot =>{
            res.redirect('/timeslotEdit/'+newTimeslot.id);
        })
    }
}

exports.admin = function(req,res){
    let routeData = {};
    db.Snapshot.findAll({
        include:[
            {
                model: db.User
            },
            {
                model: db.Timeslot,
                where: {
                    active: 1
                }
            }
        ]
    }).then(allSnapshots =>{
        routeData.snapshots = allSnapshots;
        return allSnapshots;
    }).then(()=>{
        db.Bet.findAll({
            include:[
                {
                    model: db.Team
                },
                {
                    model: db.Timeslot,
                    where: {
                        active: 1
                    }
                }
            ],
            attributes: [[db.sequelize.fn('sum',db.sequelize.col('Bet.amount')), 'betTotal']],
            group: ['Team.id']
            
        }).then(allBets =>{
            res.render('admin',{snapshots: routeData.snapshots, bets: allBets});
        })
    })
}

exports.forgotPassword = function(req, res){
    res.render('forgotPassword');
}

exports.updatePassword = function(req,res){
    if (req.body.password){
        console.log(req)
        db.User.findOne({
            where: {
                resetPasswordToken: req.params.token
            }
        }).then(user =>{
            var passwordHash = bCrypt.hashSync(req.body.password, bCrypt.genSaltSync(8), null);
            return user.update({
                password: passwordHash,
                resetPasswordToken: null
            })
        }).then(()=>{
            req.flash("success", 'Password Reset');
            res.redirect('/');
        })
        
    }else{
        res.redirect('/');
    }
    
}

exports.forgotPasswordSend = function(req, res){
    
    if (req.body.email){
        
        req.flash('success', 'Reset Email Sent');
        var token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        db.User.findOne({
            where: {
                email: req.body.email
            }
        }).then(user=>{
            if (user){
                    return user.update(
                        {
                            resetPasswordToken: token,
                            resetPasswordExpires: Date.now() + 3600000
                        }
                    ).then(updatedUser =>{
                        emailClient.sendMail({
                            from: fromEmail,
                            to: updatedUser.email,
                            subject: 'Password Reset',
                            text: 
                                'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                                'https://' + req.headers.host + '/reset/' + token + '\n\n' +
                                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                        });
                    });
            };
        });
    };

    res.redirect('/');
    
};

exports.resetPassword = function(req, res){    
    db.User.findOne({
        where: {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: {[db.Sequelize.Op.gt]: Date.now()}
        }
    }).then(user =>{
        if (user){
            res.render('reset', {user: user, token: req.params.token});
        }else{
            req.flash('error', 'Invalid Token');
            res.redirect('/');
        }
    });
}

exports

exports.advanceLock = function(req,res){
    var currentTimeslot = 0;
    db.Timeslot.findOne({
        where: {
            active: 1
        }
    }).then(timeSlot =>{
        if (timeSlot.nextTimeslot !== 0){
            currentTimeslot = timeSlot.nextTimeslot;
            
            return timeSlot.update({
                active : 0
            }).then(updatedTimeslot=>{
                return db.Timeslot.update({
                    active: 1
                },
                {
                    where: {
                        id : updatedTimeslot.nextTimeslot 
                    }
                })
            })
        }else{
            return timeSlot.update({
                active :1
            })
        }
    }).then(
    Promise.all(req.body.teams.map(teamBet =>{
        return db.Bet.findAll({
            where:{
                teamId: teamBet.teamId
            }
        }).then(allBets=>{
            return Promise.all(allBets.map(bet=>{
                return bet.update({
                    win: parseFloat(teamBet.winning) * (parseFloat(bet.amount)/parseFloat(teamBet.betTotal))
                }).then(savedBet =>{
                    return db.User.update({
                        bankroll: db.sequelize.literal("bankroll + " + savedBet.win.toString())
                    },
                    {
                        where:{
                           id: savedBet.userId
                        }
                    })
                })
            }))
        })
    })).then(()=>{

        return db.User.findAll().then(allUsers =>{
            return Promise.all(allUsers.map(currentUser =>{
                return db.Snapshot.create({
                    bankroll: currentUser.bankroll,
                    locked: 0,
                    userId: currentUser.id,
                    timeSlotId: currentTimeslot
                })
                

            }))
        })
    })  
    )
    
    res.redirect('admin');
}

exports.rank = function(req,res){
    db.Snapshot.findAll({
        include:[
            {
            model: db.User
            },
            {
                model: db.Timeslot,
                where: {
                active: 1  
                }
            }
        ],
        order:[
            ['bankroll','DESC'], 'userId'
        ]
    }).then(allSnapshots =>{
        res.render('rank',{snapshots: allSnapshots});
    })
}

exports.gameEdit = function(req,res){
    let routeData = {};
    db.Game.findByPk(req.params.gameId).then(singleGame =>{
       routeData.game = singleGame;
    }).then(()=>{
        db.Team.findAll({
            attributes:[['id','value'], ['name','text']]
        }).map(el => el.get({ plain: true })).then(allTeams=>{
            routeData.allTeams = allTeams;
        }).then(()=>{
            db.Timeslot.findAll({
                attributes:[['id','value'],['name','text']]
            }).map(el=>el.get({plain: true})).then(allSlots =>{
                let favorValues = [{value: 1 , text:'Home'},{value: 2,text:'Away'}];
                res.render('gameEdit', {teams: routeData.allTeams, game: routeData.game, timeSlots: allSlots,favorValues:favorValues});
            })
        }
    )})
}

exports.gameSave = function(req,res){
    if (req.body.gameId){
        db.Game.findByPk(req.body.gameId).then(game =>{
            return game.update(req.body);
        }).then(()=>{
            res.redirect('back');
        })
    }else{
        db.Game.create(req.body).then(newGame =>{
            res.redirect('/gameEdit/'+newGame.id);
        })
    }
}

exports.teamList = function(req,res){
  db.Team.findAll().then(allTeams =>{
    res.render('allTeams', {teams: allTeams});
  })
}

exports.logout = function(req, res) {
    req.session.destroy(function(err) {
        res.redirect('/');
    });
}
