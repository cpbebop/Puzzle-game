var Preload = function(game){};

    Preload.prototype = {

      preload: function(){
        this.game.load.image('blue', 'assets/blueBadge.png');
        this.game.load.image('green', 'assets/greenBadge.png');
        this.game.load.image('red', 'assets/redBadge.png');
        this.game.load.image('yellow', 'assets/yellowBadge.png');
        this.game.load.image('purple', 'assets/PurpleBadge.png');
        this.game.load.image('beige', 'assets/beigeBadge.png');

      },

      create: function(){
        this.game.state.start("Main");
      }
    };
