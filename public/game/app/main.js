var assets={
    floorImg : 'assests/forest-floor-terrain_0040_03_S_enl.jpg',
    floorObj : 'assests/unitfloor.obj',
    wallImg : 'assests/BrickOldOvergrown256.jpg',
    wallObj : 'assests/unitwall.obj',
    barkImg : 'assests/bark_sqr.png',
    leafImg : 'assests/leaf.jpg',
    trunkObj : 'assests/trunk.obj',
    branchObj : 'assests/branchSimple.obj',
    branchLeafObj : 'assests/branch_leavesSimple.obj',
    smallBranchObj : 'assests/small_branch.obj',
    treeTopperObj : 'assests/tree_topper.obj',
    graveImg : 'assests/grave.jpg',
    graveOnImg : 'assests/grave-bright.jpg',
    graveObj : 'assests/grave.obj',
    ghostImg : 'assests/cloth_text.png',
    ghostObj : 'assests/wraith_text.obj',
    ghostSoundUp : 'assests/Monster Growl-SoundBible.com-344645592.mp3',
    ghostSoundDown : 'assests/Zombie Moan-SoundBible.com-565291980.wav',
    tripImg : 'assests/violetCrayon.png',
    tripObj : 'assests/circle.obj',
    goalImg : 'assests/marble_texture.jpg',
    goalObj : 'assests/goal.obj',
    goalSound : 'assests/Japanese Temple Bell Small-SoundBible.com-113624364.mp3',
    mapBg : 'assests/map.png',
    mapBlank : 'assests/mapBlank.png',
    mapGrave : 'assests/graveIcon.png',
    mapGhost : 'assests/ghostIcon.png',
    levels : ['0.level','2.level','rand.level']
}

assets.preload = function() {
    loadOBJ(this.floorObj); loadOBJ(this.wallObj);
    loadOBJ(this.trunkObj); loadOBJ(this.branchObj);
    loadOBJ(this.branchLeafObj); loadOBJ(this.smallBranchObj);
    loadOBJ(this.treeTopperObj); loadOBJ(this.graveObj);
    loadOBJ(this.ghostObj); loadOBJ(this.tripObj);
    loadTexture(this.graveImg); loadTexture(this.ghostImg);
    loadTexture(this.graveOnImg); loadTexture(this.goalImg);
}

//var logger=200;



var myGL = require('myGL');

///////////////////////////


//We have objects to store textures and OBJs by name, so we only load them once.




function degToRad(degrees) {
    return degrees * Math.PI / 180;
}


var controller = require('Controller');

var gameState={};
gameState.killed = function() {this.dying=0; console.log("kkkiiiillllllleeeedddd!!!");};
gameState.dying = -1;
gameState.dying_time = 50.0;
gameState.changingLevel = -1;
gameState.changingLevel_time = 50.0;
gameState.invincible=true;
gameState.sceneElements = {};
gameState.solidObjects = {};
gameState.collidableObjects = [];
gameState.levels = assets.levels;
gameState.currentLevel = -1;
gameState.currentLevelFile = 'none';


gameState.camera = new SolidObject(null,null,0.3,1,new Vec([0,0,0.3]));
    
gameState.camera.fieldOfView= 45;
gameState.camera.lookingAt= new Vec([0,1,0]);
gameState.camera.lookingFrom= new Vec([0,1,0.3]);
gameState.camera.up= new Vec([0,1,0]);
gameState.camera.moveSpeed= 5;
gameState.camera.rotSpeed= degToRad(0.7);

gameState.playerLocation = function() {return this.camera.lookingFrom;};

gameState.mapX=2;
gameState.mapY=2;
gameState.mapSize=80;
gameState.mapImageUI=new Image();
gameState.mapImageUI.src = assets.mapBg;
gameState.mapImageBUI=new Image();
gameState.mapImageBUI.src = assets.mapBlank;
gameState.graveImageUI=new Image();
gameState.graveImageUI.src = assets.mapGrave;
gameState.ghostImageUI=new Image();
gameState.ghostImageUI.src = assets.mapGhost;


    

gameState.store = function(sceneElements,world) {
    world['StartingLocation']=this.startingLoc.flat();
    world['StartingLooking']=this.startingLook.flat();
    for (var ele in sceneElements) {
        if (sceneElements.hasOwnProperty(ele)) {
            
            if (sceneElements[ele]==null || sceneElements[ele] instanceof Trip)
                continue;
            world[ele] = {};
            world[ele].location = sceneElements[ele].position.posVec().flat();
            world[ele].scale = sceneElements[ele].scale;
            if (sceneElements[ele] instanceof FloorObject)
                world[ele].type="Floor";
            else if (sceneElements[ele] instanceof TreeObject) {
                world[ele].type="Tree";
                world[ele].density = sceneElements[ele].density;
            }
            else if (sceneElements[ele] instanceof Goal)
                world[ele].type="Goal";
            else if (sceneElements[ele] instanceof Wall) {
                world[ele].type="Wall";
                world[ele].rotationAngle = sceneElements[ele].rotationAngle;
            }
            else if (sceneElements[ele] instanceof Grave) {
                world[ele].type="Grave";
                world[ele].trips = sceneElements[ele].getTrips();
                world[ele].inFront = sceneElements[ele].inFront;
            }
            
        }
    }
}

gameState.saveLevel = function() {
    var json = {};
    this.store(this.sceneElements, json);
    this.store(this.solidObjects, json);
    this.store(this.collidableObjects, json);
    
    //json.assets = gameState.assests; 
    
    window.open('data:text/json;charset=utf-8,' + escape(JSON.stringify(json)));
}

gameState.makeGoal = function(spacing) {
	if (spacing == undefined) spacing=1.4;
    for (var ele in gameState.sceneElements) {
        if (gameState.sceneElements.hasOwnProperty(ele)) {
            var obj=gameState.sceneElements[ele];
            if (obj instanceof FloorObject)
            {
	
				var minX=obj.position.posVec()[0]+spacing/2.0;
				var minY=obj.position.posVec()[2]+spacing/2.0;
				var maxX = minX+obj.scale-spacing;
				var maxY = minY+obj.scale-spacing;
				if (spacing == undefined) spacing=1.4;
				for(var i=0; i<100; i++) {
					var x = Math.random()*(maxX-minX) + minX;
					var y = Math.random()*(maxY-minY) + minY;
					var goodPos=true;
					for (var ele in gameState.solidObjects) {
						if (gameState.solidObjects.hasOwnProperty(ele)) {
							var obj=gameState.solidObjects[ele];
							if (obj!=null && Math.sqrt(Math.pow(x-obj.position.posVec()[0],2) + Math.pow(y-obj.position.posVec()[2],2))<spacing) {
								goodPos=false;
								break;
							}
							if (Math.sqrt(Math.pow(x-gameState.camera.position.posVec()[0],2) + Math.pow(y-gameState.camera.position.posVec()[2],2))<25) {
								goodPos=false;
								break;
							}
						}
					}
					if (goodPos) {
						this.addGoal('genGoal',[x,0,y]);
						return true;
					}
				}
				return false;
			}
		}
	}
}

gameState.randomTreeCount=0;
gameState.makeTree = function(obj,spacing) {
    var minX=obj.position.posVec()[0]+spacing/2.0;
    var minY=obj.position.posVec()[2]+spacing/2.0;
    var maxX = minX+obj.scale-spacing;
    var maxY = minY+obj.scale-spacing;
    if (spacing == undefined) spacing=1.4;
    for(var i=0; i<100; i++) {
        var x = Math.random()*(maxX-minX) + minX;
        var y = Math.random()*(maxY-minY) + minY;
        var goodPos=true;
        for (var ele in gameState.solidObjects) {
            if (gameState.solidObjects.hasOwnProperty(ele)) {
                var obj=gameState.solidObjects[ele];
                if (obj!=null && Math.sqrt(Math.pow(x-obj.position.posVec()[0],2) + Math.pow(y-obj.position.posVec()[2],2))<spacing) {
                    goodPos=false;
                    break;
                }
            }
        }
        if (goodPos) {
            this.addTree('genTree'+(gameState.randomTreeCount++),[x,0,y]);
            return true;
        }
    }
    return false;
}

gameState.makeTrees = function(density,spacing) {
    if (spacing == undefined) spacing=1.4;
    for (var ele in gameState.sceneElements) {
        if (gameState.sceneElements.hasOwnProperty(ele)) {
            var obj=gameState.sceneElements[ele];
            if (obj instanceof FloorObject)
            {
                var minX=obj.position.posVec()[0]+spacing/2.0;
                var minY=obj.position.posVec()[2]+spacing/2.0;
                var maxX = minX+obj.scale-spacing;
                var maxY = minY+obj.scale-spacing;
                var n = density*((maxX-minX)*(maxY-minY));
                for (var i=0; i<n; i++) {
                    this.makeTree(obj,spacing);
                }
            }
        }
    }
}

gameState.removeTrees = function() {
    for (var ele in gameState.solidObjects) {
        if (gameState.solidObjects.hasOwnProperty(ele)) {
            var obj=gameState.solidObjects[ele];
            if (obj instanceof TreeObject) {
                gameState.solidObjects[ele]=null;
            }
        }
    }
}

gameState.removeNearestTree = function() {
    var minDist=99999999;
    var minEle='';
    for (var ele in gameState.solidObjects) {
        if (gameState.solidObjects.hasOwnProperty(ele)) {
            var obj=gameState.solidObjects[ele];
            if (obj instanceof TreeObject) {
                var dist = Math.sqrt(Math.pow(gameState.playerLocation()[0]-obj.position.posVec()[0],2) + Math.pow(gameState.playerLocation()[2]-obj.position.posVec()[2],2));
                if (dist<minDist) {
                    minDist=dist;
                    minEle=ele;
                }
            }
        }
    }
    gameState.solidObjects[minEle]=null;
}

gameState.randomGraveCount=0;
gameState.makeGrave = function(obj,spacing,density) {
    var minX=obj.position.posVec()[0]+spacing/2.0;
    var minY=obj.position.posVec()[2]+spacing/2.0;
    var maxX = minX+obj.scale-spacing;
    var maxY = minY+obj.scale-spacing;
    if (spacing == undefined) spacing=1.4;
    for(var i=0; i<100; i++) {
        var x = Math.random()*(maxX-minX) + minX;
        var y = Math.random()*(maxY-minY) + minY;
        var goodPos=true;
        for (var ele in gameState.solidObjects) {
            if (gameState.solidObjects.hasOwnProperty(ele)) {
                var obj=gameState.solidObjects[ele];
				if (obj!=null && Math.sqrt(Math.pow(x-obj.position.posVec()[0],2) + Math.pow(y-obj.position.posVec()[2],2))<spacing) {
					goodPos=false;
					break;
				}
            }
            
        }
        if (goodPos) {
			var inFront = Math.random()>.5;
			var s = Math.min(0.005*(spacing/density)*(Math.random()*(15-9)+9),20);
			//console.log(s)
            this.addGrave('genGrave'+(gameState.randomGraveCount++),[x,0,y],inFront,[{scale:s, loc:[x,0,y]}]);
            return true;
        }
    }
    return false;
}

gameState.removeNearestGrave = function() {
    var minDist=99999999;
    var minEle='';
    for (var ele in gameState.solidObjects) {
        if (gameState.solidObjects.hasOwnProperty(ele)) {
            var obj=gameState.solidObjects[ele];
            if (obj instanceof Grave) {
                var dist = Math.sqrt(Math.pow(gameState.playerLocation()[0]-obj.position.posVec()[0],2) + Math.pow(gameState.playerLocation()[2]-obj.position.posVec()[2],2));
                if (dist<minDist) {
                    minDist=dist;
                    minEle=ele;
                }
            }
        }
    }
    gameState.solidObjects[minEle]=null;
}

gameState.makeGraves = function(density,spacing) {
    if (spacing == undefined) spacing=5.0;
    for (var ele in gameState.sceneElements) {
        if (gameState.sceneElements.hasOwnProperty(ele)) {
            var obj=gameState.sceneElements[ele];
            if (obj instanceof FloorObject)
            {
                var minX=obj.position.posVec()[0]+spacing/2.0;
                var minY=obj.position.posVec()[2]+spacing/2.0;
                var maxX = minX+obj.scale-spacing;
                var maxY = minY+obj.scale-spacing;
                var n = density*((maxX-minX)*(maxY-minY));
                for (var i=0; i<n; i++) {
                    this.makeGrave(obj,spacing,density);
                }
            }
        }
    }
}


//These act as handles for level building
gameState.addFloor = function(name,scale,location) {
    this.sceneElements[name] = (new FloorObject(assets.floorImg,assets.floorObj,scale,location));              
}
gameState.addWall = function(name,rotation,scale,location) {
    this.solidObjects[name] = (new Wall(assets.wallImg,assets.wallObj,rotation,scale,location));              
}

gameState.addTree = function(name,location,density) {
    if (density === undefined) density=0.3;
    this.solidObjects[name] = (new TreeObject(density,assets.barkImg,assets.leafImg,assets.trunkObj,assets.branchObj,assets.branchLeafObj,assets.smallBranchObj,assets.treeTopperObj,1.0,location));              
}

gameState.addGoal = function(name,location) {
    this.solidObjects[name] = (new Goal(this,assets.goalImg,assets.goalObj,assets.goalSound,0.6,location));              
}

gameState.addGrave = function(name,location,inFront,trips) {
    this.solidObjects[name] = (new Grave(gameState,inFront,assets.graveImg,assets.graveOnImg,assets.graveObj,assets.ghostImg,assets.ghostObj,assets.ghostSoundUp,assets.ghostSoundDown,0.4,location));
    var tripCount=0;
    if (trips !== undefined)
		for (var trip of trips) {
			var tripObj = new Trip(gameState.solidObjects[name],assets.tripImg,assets.tripObj,trip.scale,trip.loc);
			if( null==tripObj.collisionCheck(gameState.camera,[3.5,0,0],false) &&
				null==tripObj.collisionCheck(gameState.camera,[-3.5,0,0],false) &&
				null==tripObj.collisionCheck(gameState.camera,[0,0,3.5],false) &&
				null==tripObj.collisionCheck(gameState.camera,[0,0,-3.5],false))
				this.collidableObjects.push(tripObj);
			else
				this.solidObjects[name]=null;
			
		}          
}

gameState.addTrip = function(name,scale,location) {
	this.collidableObjects.push(new Trip(gameState.solidObjects[name],assets.tripImg,assets.tripObj,scale,location)); 
    
}

gameState.loadLevel = function(loc) {
    this.changingLevel=-2;
    var path = window.location.pathname.substring(1)+'levels/';
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/"+path+loc, true);
    var myself=this;
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            var jsonText=xhr.responseText;
            var loaded = JSON.parse(jsonText);
            
            //clear current scene
            myself.sceneElements = {};
            myself.solidObjects = {};
            myself.collidableObjects = [];
            myself.dying = -1;
            myself.changingLevel=-1;
            for (var name in loaded) {
                if (loaded[name].type=="Floor") 
                    myself.addFloor(name,loaded[name].scale,loaded[name].location);
                else if (loaded[name].type=="Tree") 
                    myself.addTree(name,loaded[name].location,loaded[name].density);
                else if (loaded[name].type=="Goal") 
                    myself.addGoal(name,loaded[name].location);
                else if (loaded[name].type=="Wall") 
                    myself.addWall(name,loaded[name].rotationAngle,loaded[name].scale,loaded[name].location);
                else if (loaded[name].type=="Grave") 
                    myself.addGrave(name,loaded[name].location,loaded[name].inFront,loaded[name].trips);
                else if (name==="StartingLocation") 
                    myself.startingLoc= new Vec(loaded[name]);
                else if (name==="StartingLooking") 
                    myself.startingLook= new Vec(loaded[name]);
                
            }
            myself.startingLoc[1]=1;
            myself.startingLook[1]=1;
            myself.startingLook = myself.startingLook.minus(myself.startingLoc).normalize().scale(0.01).plus(myself.startingLoc);
            myself.camera.lookingAt= new Vec(myself.startingLook);
            myself.camera.lookingFrom= new Vec(myself.startingLoc);
            myself.camera.position = (new Mat4()).translate([myself.startingLoc[0],0,myself.startingLoc[2]]);
            
            if (loc == 'rand.level') {
				myself.makeGoal();
				myself.makeGraves(myself.currentLevel/1000.0);
				myself.makeTrees(myself.currentLevel/50.0);
			}
          } else {
            console.error(xhr.statusText);
          }
        }
    };
    xhr.onerror = function (e) {
        console.error(xhr.statusText);
    };
    xhr.send(null);
}

gameState.restartLevel = function() {
    this.loadLevel(this.currentLevelFile);
}

gameState.nextLevel = function() {
	if (++this.currentLevel < this.levels.length)
		this.currentLevelFile = this.levels[this.currentLevel]
    this.changingLevel=0;
    //this.loadLevel(this.currentLevelFile);
}


//New
function drawTexturedObject(texturedObject,perspectiveMat,objectsToDraw) {
    //check if it's loaded
    if (texturedObject==null) return;
    for (var part of texturedObject.getParts()) {
        drawTexturedObject(part,perspectiveMat,objectsToDraw);
    }
    if (texturedObject.obj === null ||
        texturedObject.obj.vertexPositionBuffer === null ||
        myGL.shaderProgram.textureCoordAttribute === null ||
        texturedObject.obj.vertexIndexBuffer === null)
        return;
    
    
    if (texturedObject instanceof Trip) {
		if (gameState.invincible)
			myGL.drawTexturedObjectPart(texturedObject,perspectiveMat.translate([0,-0.1*texturedObject.scale,0]));
	}
	else if (texturedObject instanceof TreePart) {
	    if (objectsToDraw[texturedObject.type] == undefined)
	        objectsToDraw[texturedObject.type] = [texturedObject];
        else
            objectsToDraw[texturedObject.type].push(texturedObject);
	}
    else
        myGL.drawTexturedObjectPart(texturedObject,perspectiveMat);
    
}

function drawTexturedObjects(objectsToDraw,perspectiveMat) {
    for (var objType in objectsToDraw) {
        if (objectsToDraw.hasOwnProperty(objType)) {
            var objs=objectsToDraw[objType];
            myGL.drawTexturedObjects(objs,perspectiveMat);
        }
    }
}

function drawMap() {
    var drawing=false;
    var d;
    var orth;
    for (var ele in gameState.solidObjects) {
        if (gameState.solidObjects.hasOwnProperty(ele)) {
            var obj=gameState.solidObjects[ele];
            if (obj instanceof Grave)
            {
                if (obj.state==1) {
                    if (!drawing) {
                        myGL.drawUI(gameState.mapImageUI,gameState.mapX,gameState.mapY,gameState.mapSize,gameState.mapSize);
                        drawing=true;
                        d = gameState.camera.lookingFrom.minus(gameState.camera.lookingAt);
                        d[1]=0;//ignore y
                        orth = d.cross(gameState.camera.up);
                        d = d.normalize();
                        orth = orth.normalize();
                        
                    }
                    var relPos = obj.position.posVec().minus(gameState.playerLocation());
                    var dist=relPos.mag();
                    relPos = relPos.normalize().scale((Math.min(14,dist)/15)*gameState.mapSize/2);
                    var proX = -relPos.dot(orth);
                    var proY = relPos.dot(d);
                    
                    myGL.drawUI(gameState.graveImageUI,
                                gameState.mapX+proX+gameState.mapSize/2,
                                gameState.mapY+proY+gameState.mapSize/2,
                                gameState.mapSize/6,gameState.mapSize/6);
                }
            }
        }
    }
    if (drawing) {
        
        for (var obj of gameState.collidableObjects) {
            if (obj instanceof Ghost) {
                var relPos = obj.position.posVec().minus(gameState.playerLocation());
                var dist=relPos.mag();
                relPos = relPos.normalize().scale((Math.min(14,dist)/15)*gameState.mapSize/2);
                var proX = -relPos.dot(orth);
                var proY = relPos.dot(d);
                
                myGL.drawUI(gameState.ghostImageUI,
                            gameState.mapX+proX+gameState.mapSize/2,
                            gameState.mapY+proY+gameState.mapSize/2,
                            gameState.mapSize/6,gameState.mapSize/6);
            }
        }
    }
    else {
		myGL.drawUI(gameState.mapImageBUI,gameState.mapX,gameState.mapY,gameState.mapSize,gameState.mapSize);
	}
    myGL.drawText("Level: "+(gameState.currentLevel+1));
    //myGL.drawText("mouse: "+(controller.mouseX)+', '+(controller.mouseX));
}
    

var lastTime = 0;
function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;
        
        if (gameState.changingLevel==-2) {
            myGL.setLighting([0.5*3,0.5*3,0.5*3], 
                             [-0.3,1,0], 
                             [0.3,0.24,0.3]);
        }
        else if (gameState.changingLevel>=0 && (gameState.changingLevel+=(elapsed/16.0)) < gameState.changingLevel_time) {
            var mult = 1+ 2*(gameState.changingLevel)/(gameState.changingLevel_time)
            myGL.setLighting([0.5*mult,0.5*mult,0.5*mult], 
                             [-0.3,1,0], 
                             [0.3,0.24,0.3]);
        }
        else if (gameState.changingLevel >= gameState.changingLevel_time) {
            gameState.loadLevel(gameState.currentLevelFile);
        }
        else if (gameState.dying >=0 && (gameState.dying+=(elapsed/16.0)) < gameState.dying_time) {
            myGL.setLighting([0.5*(gameState.dying_time-gameState.dying)/gameState.dying_time,0.5*(gameState.dying_time-gameState.dying)/gameState.dying_time,0.5*(gameState.dying_time-gameState.dying)/gameState.dying_time], 
                             [-0.3,1,0], 
                             [0.3,0.24*(gameState.dying_time-gameState.dying)/gameState.dying_time,0.3*(gameState.dying_time-gameState.dying)/gameState.dying_time]);
           
        }
        else if (gameState.dying >= gameState.dying_time) {
            gameState.restartLevel();
        }
        else {
            
            myGL.setLighting([0.5,0.5,0.5], 
                             [-0.3,1,0], 
                             [0.3,0.24,0.3]);
                             
                             
            controller.onTick(elapsed);
            for (var ele in gameState.sceneElements) 
                if (gameState.sceneElements.hasOwnProperty(ele))
                    gameState.sceneElements[ele].animate(elapsed);
            for (var ele in gameState.solidObjects) 
                if (gameState.solidObjects.hasOwnProperty(ele) && gameState.solidObjects[ele]!=null)
                    gameState.solidObjects[ele].animate(elapsed);
            for (var ele in gameState.collidableObjects) 
                if (gameState.collidableObjects.hasOwnProperty(ele))
                    gameState.collidableObjects[ele].animate(elapsed);
        }
        
        
        
        
        /*if (logger++>200) {
             logger=0;
             console.log('FROM: x=' + gameState.camera.lookingFrom[0] + ', y=' + gameState.camera.lookingFrom[1] + ', z=' + gameState.camera.lookingFrom[2]);
             console.log('AT:   x=' + gameState.camera.lookingAt[0] + ', y=' + gameState.camera.lookingAt[1] + ', z=' + gameState.camera.lookingAt[2]);
        }*/
    }

    lastTime = timeNow;
}

function TexturedObject(imgName, objName, location, scale) {
    initTexturedObject(imgName,objName,this);
    this.location = location;
    this.scale = scale;
}




//var globalDepth;


var tick;
function webGLStart() {
    assets.preload();

    myGL.initGL(document.getElementById("it-is-a-canvas"),document.getElementById("flat"));
    gameState.nextLevel();
    
    function movement(elapsed,stick1x,stick1y,stick2x,stick2y) {
        var d = gameState.camera.lookingFrom.minus(gameState.camera.lookingAt);
        var horzViewAxis = d.cross(gameState.camera.up);
        var vertViewAxis = horzViewAxis.cross(d);
        var dmag = d.mag();
        
        d[1]=0;//ignore y
        var orth = d.cross(gameState.camera.up);
        d = d.normalize();
        orth = orth.normalize();
        
        var moveVec = d.scale(stick1y).plus(orth.scale(stick1x)).scale((gameState.camera.moveSpeed * elapsed) / 1000.0);
        

        for (var ele in gameState.solidObjects)
        {
            if (gameState.solidObjects.hasOwnProperty(ele) && gameState.solidObjects[ele]!=null) {
                var vec = gameState.camera.collisionCheck(gameState.solidObjects[ele],moveVec);
                if (vec != null && !gameState.invincible) {
                    moveVec = (vec.cross(gameState.camera.up)).scale(moveVec.dot(vec.cross(gameState.camera.up)));
                }
            }
        }
        for (var ele in gameState.collidableObjects)
        {
            if (gameState.collidableObjects.hasOwnProperty(ele)) 
                gameState.camera.collisionCheck(gameState.collidableObjects[ele],moveVec);
        }
        
        //if (moveVec.mag() < 0.05) moveVec = new Vec();
        gameState.camera.lookingAt = gameState.camera.lookingAt.plus(moveVec);
        gameState.camera.lookingFrom = gameState.camera.lookingFrom.plus(moveVec);
        gameState.camera.position=gameState.camera.position.translate(moveVec);
        
        
        //rotation (aiming)
        var mHorz = elapsed*dmag*Math.sin(gameState.camera.rotSpeed*stick2x)/7.0;
        var mVert = elapsed*dmag*Math.sin(gameState.camera.rotSpeed*stick2y)/7.0;
        var dirHorz = horzViewAxis.normalize().scale(mHorz);
        var dirVert = vertViewAxis.normalize().scale(mVert);
        gameState.camera.lookingAt = gameState.camera.lookingAt.plus(dirHorz.plus(dirVert));
    }

    controller.stickLR.push(movement);
    
    controller.keyboard[68].push( function(elapsed,pressed) {//d
        if (pressed) {
            
            movement(elapsed,-1,0,0,0);
	    }
	});
	
	controller.keyboard[65].push( function(elapsed,pressed) {//a
	    if (pressed) {
            movement(elapsed,1,0,0,0);
	    }
	});
	
	controller.keyboard[83].push( function(elapsed,pressed) {//s
	    if (pressed) {
            movement(elapsed,0,1,0,0);
	    }
	});
	
	controller.keyboard[87].push( function(elapsed,pressed) {//w
	    if (pressed) {
            movement(elapsed,0,-1,0,0);
	    }
	});
	
	controller.keyboard[82].push( function(elapsed,pressed) {//r
	    if (pressed) {
            gameState.camera.lookingAt[1] += (gameState.camera.moveSpeed * elapsed) / 1000.0;
	        gameState.camera.lookingFrom[1] += (gameState.camera.moveSpeed * elapsed) / 1000.0;
	    }
	});
	
	controller.keyboard[70].push( function(elapsed,pressed) {//f
	    if (pressed) {
            gameState.camera.lookingAt[1] += (-1* gameState.camera.moveSpeed * elapsed) / 1000.0;
	        gameState.camera.lookingFrom[1] += (-1* gameState.camera.moveSpeed * elapsed) / 1000.0;
	    }
	    
	});
	
	controller.keyboard[81].push( function(elapsed,pressed) {//q
	    if (pressed) {
            movement(elapsed,0,0,1,0);
	    }
	});
	
	controller.keyboard[69].push( function(elapsed,pressed) {//e
	    if (pressed) {
            movement(elapsed,0,0,-1,0);
        }
	});

    
    
    controller.showGamePadMessage = function() {
        var cind = document.getElementById("cind");
        cind.innerHTML="No controller detected. Press any button.";
    }
    controller.hideGamePadMessage = function(padid) {
        var cind = document.getElementById("cind");
        cind.innerHTML="Controller connected: "+padid;
    }
    
    /////debug
    controller.keyboardUp[55].push( function(elapsed,pressed) {//7
        gameState.removeNearestTree();
    });
    controller.keyboardUp[56].push( function(elapsed,pressed) {//8
		gameState.invincible= !gameState.invincible;
    });
    controller.keyboardUp[57].push( function(elapsed) {//9
		gameState.removeNearestGrave();
    });
    controller.keyboardUp[80].push( function(elapsed) {//p
            gameState.saveLevel();
    });
    controller.keyboardUp[79].push( function(elapsed) {//o
            gameState.loadLevel('levels/test.level');
    });
    controller.keyboardUp[78].push( function(elapsed) {//n
            gameState.nextLevel();
    });
    
    controller.keyboardUp[67].push( function(elapsed) {//c
        var car= new CarObject('assests/car.bmp', 'assests/car.obj','assests/tire.bmp', 'assests/tire.obj',1.25,[-2.58, 0.015, -7.66]);
        car.rotation = car.rotation.rotateYAxis(-120)
        gameState.sceneElements['car']=(car);
        
        controller.keyboard[49].push( function(elapsed,pressed) {//1
        if (pressed) {car.turnLeft();}
        });
        controller.keyboard[50].push( function(elapsed,pressed) {//2
            if (pressed) {car.turnRight();}
        });
        
        controller.dPad.push(function(elapsed,u,d,l,r) {
            if (l) car.turnLeft();
            if (r) car.turnRight();
        });
        controller.keyboard[53].push( function(elapsed,pressed) {//5
            if (pressed) {car.driveForwards();}
        });
        controller.keyboard[54].push( function(elapsed,pressed) {//6
            if (pressed) {car.driveBackwards();}
        });
        controller.buttonW.push( function(elapsed,pressed) {
        if (pressed) {car.driveForwards();}
        });
        controller.buttonS.push( function(elapsed,pressed) {
            if (pressed) {car.driveBackwards();}
        });
        
        var axis1 = new GenericObject('assests/violetCrayon.png', 'assests/violet_crayon.obj',0.2,[0,0,0]);
        axis1.rotation = axis1.rotation.rotateZAxis(-90);
        var axis2 = new GenericObject('assests/violetCrayon.png', 'assests/violet_crayon.obj',0.1,[0,0,0]);
        axis2.rotation = axis2.rotation.rotateXAxis(90);
        gameState.sceneElements['axis1']=(axis1);
        gameState.sceneElements['axis2']=(axis2);
    });
    
    var testo = new GenericObject(assets.wallImg,assets.wallObj,1,[0,0,0.5]);
    
    tick = function() {
        requestAnimFrame(tick);
        //console.log('dying: '+gameState.dying)
        //console.log('changingLevel: '+gameState.changingLevel)
        
        if (gameState.invincible) gameState.dying=-1;
        
        
        animate();
        myGL.clearScene();
        
        
        var perspectiveMat = (new Mat4()).perspective(gameState.camera.fieldOfView,gameState.camera.lookingAt,gameState.camera.lookingFrom,gameState.camera.up);
        
        
        var objectsToDraw={}
        for (var ele in gameState.sceneElements) {
            if (gameState.sceneElements.hasOwnProperty(ele))
        	    drawTexturedObject(gameState.sceneElements[ele],perspectiveMat,objectsToDraw);
    	    
        }
        
        for (var ele in gameState.solidObjects) {
            if (gameState.solidObjects.hasOwnProperty(ele))
        	    drawTexturedObject(gameState.solidObjects[ele],perspectiveMat,objectsToDraw);
        }
        
        for (var ele in gameState.collidableObjects) {
            if (gameState.collidableObjects.hasOwnProperty(ele))
        	    drawTexturedObject(gameState.collidableObjects[ele],perspectiveMat,objectsToDraw);
        }
        drawTexturedObjects(objectsToDraw,perspectiveMat);
        
        drawMap();
        
        //globalDepth = myGL.getDepth();
    }
    tick();
}


