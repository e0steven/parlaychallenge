var register = function(Handlebars) {
    
    var helpers = {
    spread: function(type, game, snapShot, active, options) {
        var output= "";
        var locked = 0;
        
        if (snapShot[0]!== undefined){
            locked = snapShot[0].locked;
        }
        output += type + "<br/>";
        output += "<img src='";
        output += (type === "Home") ? Handlebars.escapeExpression(game.HomeTeam.logo) : Handlebars.escapeExpression(game.AwayTeam.logo);
        output += "' style='height: 70px; width: 70px;' />";  
        output += "<br/><small>";    
        output += (type ==="Home") ? Handlebars.escapeExpression(game.HomeTeam.name) : Handlebars.escapeExpression(game.AwayTeam.name);
        output += "</small><br />";
        output += "<div style='padding:5px 20px 10px 20px; margin-bottom:30px;'>";
        output += "<button type='button' class='btn ";
        output += ((type==="Home" && game.favored === 1)|| (type==="Away" && game.favored===2)) ? "btn-arrow-right btn-success'>+" : "btn-arrow-left btn-danger'>-";
        output += game.spread;
        output += "</div>";
        if (game.HomeTeam.Bets.length || game.AwayTeam.Bets.length){
            if (type ==='Home'){

                game.HomeTeam.Bets.map( bet => {
                    output += "<a href=";
                    if (locked){
                        output += "'#' class='btn btn-primary btn-sm'> $" + bet.amount + "</a>"
                    }else{
                        output +="'./betEdit/";
                        output += game.timeSlotId + "/";
                        output += bet.id;
                        output += "/false' data-remote='false' data-toggle='modal' data-target='#myModal' class='btn btn-primary btn-sm'>";
                        output += "Edit ";
                        output += "$"+bet.amount;
                        output += " Bet</a>";
                    }
                })   
            }else{
                game.AwayTeam.Bets.map( bet => {
                    output += "<a href=";
                    if (locked){
                        output += "'#' class='btn btn-primary btn-sm'> $" + bet.amount + "</a>"
                    }else{
                        output +="'./betEdit/";
                        output += game.timeSlotId + "/";
                        output += bet.id;
                        output += "/false' data-remote='false' data-toggle='modal' data-target='#myModal' class='btn btn-primary btn-sm'>";
                        output += "Edit ";
                        output += "$"+bet.amount;
                        output += " Bet</a>";
                    }
                })   
            }
        }else{
            if (locked || !active){
                
            }else{
                output += "<a href='./betEdit/" + game.timeSlotId + "/false/";
                output += (type ==="Home") ? game.HomeTeam.id : game.AwayTeam.id;
                output += "' data-remote='false' data-toggle='modal' data-target='#myModal' class='btn btn-primary btn-sm'>";
                output += "Bet!</a>";
            }
        }
        
        return output;
    },
    concat: function(){
        return (...args) => args.slice(0, -1).join('');
    },
    add: function(a, b){
        return parseFloat(a || 0) + parseFloat(b || 0);
    },
    lock: function(games, snapShot){
        var totalBets = 0;

        var start = snapShot[0].bankroll;
        var locked = snapShot[0].locked;

        games.forEach(game =>{
            game.AwayTeam.Bets.forEach(gameBet =>{
                totalBets += parseFloat(gameBet.amount);
            });
            game.HomeTeam.Bets.forEach(gameBet =>{
                totalBets += parseFloat(gameBet.amount);
          })  
        })
        
        if (parseFloat(totalBets) >= parseFloat((parseFloat(start)/2))){
            if(locked){
                return "<a class='btn btn-sm btn-success'><i class='fas fa-lock'></i> Locked</a>";
            }else{
                return "<a class='btn btn-sm btn-warning lock' data-id='"+snapShot[0].id+"'><i class='fas fa-lock-open'></i> Unlocked</a>";
            }
        }else{
        return "<button class='btn btn-sm btn-danger' disabled='disabled'>Under Minimum</button>";
        }
    },
    debug: function(optionalValue) {
        var output="";
        output+= "Current Context <br/>";
        
        output+="====================";
      
        output+=JSON.stringify(this);
      
       
      
        if (optionalValue) {
      
          console.log("Value");
      
          console.log("====================");
      
          console.log(optionalValue);
      
        }
        return output;
    }
};

if (Handlebars && typeof Handlebars.registerHelper === "function") {
    for (var prop in helpers) {
        Handlebars.registerHelper(prop, helpers[prop]);
    }
} else {
    return helpers;
}

};

module.exports.register = register;
module.exports.helpers = register(null); 