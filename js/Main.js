var Main = function(game){

};

Main.prototype = {
  create: function(){

    var me = this;

    //me.game.stage.backgroundcolor = "34495f";

    me.tileTypes = [
      'blue',
      'green',
      'red',
      'yellow',
      'purple'
    ];

    //track of score
    me.score = 0;

    //track of tiles the user is trying to swap
    me.activeTile1 = null;
    me.activeTile2 = null;

    //controls whether the player can make a move or not
    me.canMove = false;

    //grab the width and height of tiles
    me.tileWidth = me.game.cache.getImage('blue').width;
    me.tileHeight = me.game.cache.getImage('blue').height;

    //This will hold all of the tile sprites
    me.tiles = me.game.add.group();

    //The grid for the game, 6/9
    me.tileGrid =[
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
    ];

    //random data generator
    var seed = Date.now();
    me.random = new Phaser.RandomDataGenerator([seed]);

    me.initTiles();

    me.createScore();

  },

  initTiles: function(){

console.log('initTiles');

     var me = this;

     //loop through each column in the grid
     for(var i = 0; i < me.tileGrid.length; i++){
       //loop through each position in a specific column from the top
       for(var j = 0; j < me.tileGrid.length; j++){

         var tile = me.addTile(i,j);

         //keep track of the tiles position
         me.tileGrid[i][j] = tile;
       }
     }

     //check of matches in grid
     me.game.time.events.add(600, function(){
       me.checkMatch();
     });
  },

  addTile: function(x, y){

    var me = this;

    //add a random tile
    var tileToAdd = me.tileTypes[me.random.integerInRange(0, me.tileTypes.length - 1)];

    //add the tile at the correct x position, at the top
    var tile = me.tiles.create((x * me.tileWidth) + me.tileWidth / 2, 0, tileToAdd);

    //Animate the tile into the correct vertical position
    me.game.add.tween(tile).to ({y: y * me.tileHeight + (me.tileHeight / 2)}, 500, Phaser.Easing.Linear.In, true);

    //set the tiles anchor point
    tile.anchor.setTo(0.5, 0.5);

    //Enable input
    tile.inputEnabled = true;

    //keep track of the type of tile that was add
    tile.tileType = tileToAdd;

    //Trigger the tileDown function
    tile.events.onInputDown.add(me.tileDown, me);

    return tile;

  },

  tileDown: function(tile, pointer){

    var me = this;
console.log('TileDown');
    //track where the player clicked
    if (me.canMove){
      me.activeTile1 = tile;
      me.startPosX = (tile.x - me.tileWidth / 2) / me.tileWidth;
      me.startPosY = (tile.y - me.tileHeight / 2) / me.tileHeight;
    }
  },

swapTiles:function(){

console.log('swapTiles');

  var me = this;

  //if two active tiles, swap position
  if(me.activeTile1 && me.activeTile2){

    var tile1Pos = {x: (me.activeTile1.x - me.tileWidth / 2) / me.tileWidth, y:(me.activeTile1.y - me.tileHeight / 2) / me.tileHeight};
    var tile2Pos = {x:(me.activeTile2.x - me.tileWidth / 2) / me.tileWidth, y:(me.activeTile2.y - me.tileHeight / 2) / me.tileHeight};

    //swap them in the grid
    me.tileGrid[tile1Pos.x][tile1Pos.y] = me.activeTile2;
    me.tileGrid[tile2Pos.x][tile2Pos.y] = me.activeTile1;

    //make them move when switch
    me.game.add.tween(me.activeTile1).to({x:tile2Pos.x * me.tileWidth + (me.tileWidth/2), y:tile2Pos.y * me.tileHeight + (me.tileHeight/2)}, 200, Phaser.Easing.Linear.In, true);
    me.game.add.tween(me.activeTile2).to({x:tile1Pos.x * me.tileWidth + (me.tileWidth/2), y:tile1Pos.y * me.tileHeight + (me.tileHeight/2)}, 200, Phaser.Easing.Linear.In, true);

    me.activeTile1 = me.tileGrid[tile1Pos.x][tile1Pos.y];
    me.activeTile2 = me.tileGrid[tile2Pos.x][tile2Pos.y];
  };
},

checkMatch: function(){

  var me = this;

//Call the getMatches function to check for spots where there is
//a run of three or more tiles in a row
var matches = me.getMatches(me.tileGrid);

//If there are matches, remove them
if(matches.length > 0){

    //Remove the tiles
    me.removeTileGroup(matches);

    //Move the tiles currently on the board into their new positions
    me.resetTile();

    //Fill the board with new tiles wherever there is an empty spot
    me.fillTile();

    //Trigger the tileUp event to reset the active tiles
    me.game.time.events.add(500, function(){
        me.tileUp();
    });

    //Check again to see if the repositioning of tiles caused any new matches
    me.game.time.events.add(600, function(){
        me.checkMatch();
    });

}
else {

    //No match so just swap the tiles back to their original position and reset
    me.swapTiles();
    me.game.time.events.add(500, function(){
        me.tileUp();
        me.canMove = true;
    });
}
},

tileUp: function(){

  //Reset the active tiles
  var me = this;

  me.activeTile1 = null;
  me.activeTile2 = null;

},

getMatches: function(tileGrid){

    var matches = [];
    var groups = [];

    //Check for horizontal matches
    for (var i = 0; i < tileGrid.length; i++)
    {
        var tempArr = tileGrid[i];
        groups = [];
        for (var j = 0; j < tempArr.length; j++)
        {
            if(j < tempArr.length - 2)
                if (tileGrid[i][j] && tileGrid[i][j + 1] && tileGrid[i][j + 2])
                {
                    if (tileGrid[i][j].tileType == tileGrid[i][j+1].tileType && tileGrid[i][j+1].tileType == tileGrid[i][j+2].tileType)
                    {
                        if (groups.length > 0)
                        {
                            if (groups.indexOf(tileGrid[i][j]) == -1)
                            {
                                matches.push(groups);
                                groups = [];
                            }
                        }

                        if (groups.indexOf(tileGrid[i][j]) == -1)
                        {
                            groups.push(tileGrid[i][j]);
                        }
                        if (groups.indexOf(tileGrid[i][j+1]) == -1)
                        {
                            groups.push(tileGrid[i][j+1]);
                        }
                        if (groups.indexOf(tileGrid[i][j+2]) == -1)
                        {
                            groups.push(tileGrid[i][j+2]);
                        }
                    }
                }
        }
        if(groups.length > 0) matches.push(groups);
    }

    //Check for vertical matches
    for (j = 0; j < tileGrid.length; j++)
    {
        var tempArr = tileGrid[j];
        groups = [];
        for (i = 0; i < tempArr.length; i++)
        {
            if(i < tempArr.length - 2)
                if (tileGrid[i][j] && tileGrid[i+1][j] && tileGrid[i+2][j])
                {
                    if (tileGrid[i][j].tileType == tileGrid[i+1][j].tileType && tileGrid[i+1][j].tileType == tileGrid[i+2][j].tileType)
                    {
                        if (groups.length > 0)
                        {
                            if (groups.indexOf(tileGrid[i][j]) == -1)
                            {
                                matches.push(groups);
                                groups = [];
                            }
                        }

                        if (groups.indexOf(tileGrid[i][j]) == -1)
                        {
                            groups.push(tileGrid[i][j]);
                        }
                        if (groups.indexOf(tileGrid[i+1][j]) == -1)
                        {
                            groups.push(tileGrid[i+1][j]);
                        }
                        if (groups.indexOf(tileGrid[i+2][j]) == -1)
                        {
                            groups.push(tileGrid[i+2][j]);
                        }
                    }
                }
        }
        if(groups.length > 0) matches.push(groups);
    }

    return matches;

},

getTilePos: function(tileGrid, tile)
{
    var pos = {x:-1, y:-1};

    //Find the position of a specific tile in the grid
    for(var i = 0; i < tileGrid.length ; i++)
    {
        for(var j = 0; j < tileGrid[i].length; j++)
        {
            //There is a match at this position so return the grid coords
            if(tile == tileGrid[i][j])
            {
                pos.x = i;
                pos.y = j;
                break;
            }
        }
    }

    return pos;
},

resetTile: function(){

    var me = this;

    //Loop through each column starting from the left
    for (var i = 0; i < me.tileGrid.length; i++)
    {

        //Loop through each tile in column from bottom to top
        for (var j = me.tileGrid[i].length - 1; j > 0; j--)
        {

            //If this space is blank, but the one above it is not, move the one above down
            if(me.tileGrid[i][j] == null && me.tileGrid[i][j-1] != null)
            {
                //Move the tile above down one
                var tempTile = me.tileGrid[i][j-1];
                me.tileGrid[i][j] = tempTile;
                me.tileGrid[i][j-1] = null;

                me.game.add.tween(tempTile).to({y:(me.tileHeight*j)+(me.tileHeight/2)}, 200, Phaser.Easing.Linear.In, true);

                //The positions have changed so start this process again from the bottom
                //NOTE: This is not set to me.tileGrid[i].length - 1 because it will immediately be decremented as
                //we are at the end of the loop.
                j = me.tileGrid[i].length;
            }
        }
    }

},

fillTile: function(){

    var me = this;

    //Check for blank spaces in the grid and add new tiles at that position
    for(var i = 0; i < me.tileGrid.length; i++){

        for(var j = 0; j < me.tileGrid.length; j++){

            if (me.tileGrid[i][j] == null)
            {
                //Found a blank spot so lets add animate a tile there
                var tile = me.addTile(i, j);

                //And also update our "theoretical" grid
                me.tileGrid[i][j] = tile;
            }

        }
    }

},

createScore: function(){

    var me = this;
    var scoreFont = "100px Arial";

    me.scoreLabel = me.game.add.text((Math.floor(me.tileGrid[0].length / 2) * me.tileWidth), me.tileGrid.length * me.tileHeight, "0", {font: scoreFont, fill: "#fff"});
    me.scoreLabel.anchor.setTo(0.5, 0);
    me.scoreLabel.align = 'center';

},

incrementScore: function(){

    var me = this;

    me.score += 10;
    me.scoreLabel.text = me.score;

},

removeTileGroup: function(matches){
console.log(matches);
debugger;
    var me = this;

    //Loop through all the matches and remove the associated tiles
    for(var i = 0; i < matches.length; i++){
        var tempArr = matches[i];

        for(var j = 0; j < tempArr.length; j++){

            var tile = tempArr[j];
            //Find where this tile lives in the theoretical grid
            var tilePos = me.getTilePos(me.tileGrid, tile);

            //Remove the tile from the screen
            me.tiles.remove(tile);

            //Increase the users score
            me.incrementScore();

            //Remove the tile from the theoretical grid
            if(tilePos.x != -1 && tilePos.y != -1){
                me.tileGrid[tilePos.x][tilePos.y] = null;
            }

        }
    }
},



  update: function(){

    var me = this;

    //check to see where the player dragges tiles
    if(me.activeTile1 && !me.activeTile2){
console.log('1st If');
      //get the location of where the pointer is currently
      var hoverX = me.game.input.x;
      var hoverY = me.game.input.y;

      //what position on the grid that translates to
      var hoverPosX = math.floor(hoverX / me.tileWidth);
      var hoverPosY = math.floor(hoverY / me.tileHeight);

      //check if the player has dragged over another position
      var difX = (hoverPosX - me.startPosX);
      var difY = (hoverPosY - me.startPosY);

      //check to see within the bounds of grid
      if(!(hoverPosY > me.tileGrid[0].length - 1 || hoverPosY < 0 ) && !(hoverPosX > me.tileGrid.length  - 1 || hoverPosX < 0)){
console.log('2ed If');
        //If the user has dragged an entire tiles width or height in the x or y direction
        //trigger a tile swap
        if((Math.ads(difY) == 1 && difX == 0) || (Math.ads(difX) == 1 && difY == 0)){
console.log('3rd If');
          //prevernt the player from making more moves while it's checking
          me.canMove = false;

          //set tje second active tile
          me.activeTile2 = me.tileGrid[hoverPosX][hoverPosY];

          //Swap the two active tiles
          me.swapTiles();

          //check for matches after the swap
          me.game.time.events.add(500, function(){

            me.checkMatch();
          });
        }
      }
    }

  },
  GameOver: function(){
    this.game.state.start("GameOver");
  },
};
