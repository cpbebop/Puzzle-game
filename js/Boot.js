var Boot = function(game){

};

Boot.prototype = {

  preload: function(){

  },

  create: function(){
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  //  this.scale.setScaleSize(true);
    this.game.state.start("Preload");
  }
};
