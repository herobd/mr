    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain
    //This has a realy confusing exampel I'm basing my inheritance off of
    
    var Origin = {mat: new Mat4(), getDrawMatrix: function() {return this.mat;}};
    
    function GenericObject(img,obj,scale,positionMatrix,owner) {
        this.init(scale,positionMatrix,owner);
        this.initTexture(img);
        this.initOBJ(obj);
    }
    GenericObject.prototype.init = function(scale,positionMatrix,owner) {
        if (owner !== undefined) {
            this.owner  = owner;
        } else {
            this.owner = Origin;
        }
        
        if (positionMatrix !== undefined) {
            this.position = (new Mat4()).translate(positionMatrix);//This is relative to owner
            //this.location = positionMatrix;
        } else {
            this.position = new Mat4();//This is relative to owner
            //this.location = [0,0,0];
        }
        
        this.scale=scale;
        this.scaleM = (new Mat4()).scale([scale,scale,scale]);
        
        this.rotation = new Mat4();
        this.parts = [];
        this.drawMatrix=null;
    };
    GenericObject.prototype.getDrawMatrix = function() {
        if (this.drawMatrix===null){
        	 this.drawMatrix = this.owner.getDrawMatrix().multiply(this.position).multiply(this.rotation).multiply(this.scaleM);
    	}
        return this.drawMatrix;
    };
    GenericObject.prototype.move = function(vec) {
        	 this.position = this.position.translate(vec);
        	 this.drawMatrix=null;
    };
    GenericObject.prototype.setRotation = function(mat) {
        	 this.rotation = mat;
        	 this.drawMatrix=null;
    };
    GenericObject.prototype.setPosition = function(mat) {
        	 this.position = mat;
        	 this.drawMatrix=null;
    };
    GenericObject.prototype.getParts = function() {
        	 return this.parts;
    };
    GenericObject.prototype.getPosVec = function() {
        	 return this.getDrawMatrix().posVec();
    };
    GenericObject.prototype.animate = function() {
        	 //no animation
    };
    
    function setUpOBJ(toFill, file, textureScaleX, textureScaleY) {
        textureScaleX = typeof textureScaleX !== 'undefined' ? textureScaleX : 1;
        textureScaleY = typeof textureScaleY !== 'undefined' ? textureScaleY : textureScaleX;
		
        var lines = file.split('\n');
        var countVertices;
        var vertices = [];
        var textureCoords = [];
        var faces = [];
        var normals = [];
        
        //parse obj file
        for (var line of lines) {
        	var tokens = line.split(' ');
        	if (tokens[0] === 'v') {
        	    vertices.push([parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])]);
        	    //console.log("vertex: " + vertices[vertices.length-1][0] + "," + vertices[vertices.length-1][1] + "," + vertices[vertices.length-1][2]);
        	    countVertices++;
        	} else if (tokens[0] === 'vt') {
        	    textureCoords.push([textureScaleX*parseFloat(tokens[1]), textureScaleY*parseFloat(tokens[2])]);
        	    //console.log("textureCord: " + textureCoords[textureCoords.length-1][0] + "," + textureCoords[textureCoords.length-1][1]);
    	    } else if (tokens[0] === 'vn') {
        	    normals.push([parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])]);
        	    //console.log("textureCord: " + textureCoords[textureCoords.length-1][0] + "," + textureCoords[textureCoords.length-1][1]);
        	} else if (tokens[0] === 'f') {
        	    tokens.shift();
        	    //console.log(tokens);
        	    var face=[];
        	    
        	    for (var vertex of tokens) {
        	        face.push(vertex);
        	        //console.log("vertex: ".concat(vertex));
        	    }
        	    faces.push(face);
        	    //console.log("face: " + faces[faces.length-1][0]);
        	}
        }
        
        //Next we recreate the vertexes for each one in each triangle we draw.
        
        var verticesFlat=[];
        var normalsFlat=[];
        var textureCordsFlat=[];
        var vertexIndices=[];
        var count=0;
        
        for (face of faces) {
            
            var keyVert=null;
            var keyNorm=null;
            var keyTextureCord=null;
            var prevVert=null;
            var prevNorm=null;
            var prevTextureCord=null;
            
            
            //For each polygon, we assume the points are in a clockwise/counterclockwise order
            //Thus we draw triangles, all sharing the first vertex listed in the obj file
            for (vertex of face) {
                var pieces = vertex.split('/');
                if (keyVert==null) {//first vertex, all triangles share this
                    keyVert = vertices[parseInt(pieces[0])-1];
                    keyNorm = normals[parseInt(pieces[2])-1];
                    keyTextureCord = textureCoords[parseInt(pieces[1])-1];
                } else if (prevVert==null) {//set up the "previous" for our first triangle
                    prevVert = vertices[parseInt(pieces[0])-1];
                    prevNorm = normals[parseInt(pieces[2])-1];
                    prevTextureCord = textureCoords[parseInt(pieces[1])-1];
                } else {
                    var thisVert = vertices[parseInt(pieces[0])-1];
                    var thisNorm = normals[parseInt(pieces[2])-1];
                    var thisTextureCord = textureCoords[parseInt(pieces[1])-1];
                    //if (thisNorm === undefined)
                        //console.log(normals)
                    //var logger="";
                    //logger = logger.concat("face: (");
                    
                    for (n of keyVert) {
                        verticesFlat.push(n);
                        //logger = logger.concat(n + ",");
                    }
                    vertexIndices.push(count++);
                    //logger = logger.concat(")(");
                    for (n of prevVert) {
                        verticesFlat.push(n);
                        //logger = logger.concat(n + ",");
                    }
                    vertexIndices.push(count++);
                    //logger = logger.concat(")(");
                    for (n of thisVert) {
                        verticesFlat.push(n);
                        //logger = logger.concat(n + ",");
                    }
                    vertexIndices.push(count++);
                    //logger = logger.concat(")  [");
                    
                    for (n of keyTextureCord) {
                        textureCordsFlat.push(n);
                        //logger = logger.concat(n + ",");
                    }
                    //logger = logger.concat("][");
                    for (n of prevTextureCord) {
                        textureCordsFlat.push(n);
                        //logger = logger.concat(n + ",");
                    }
                    //logger = logger.concat("][");
                    for (n of thisTextureCord) {
                        textureCordsFlat.push(n);
                        //logger = logger.concat(n + ",");
                    }
                    //logger = logger.concat("] ... " + verticesFlat.length + "\n");
                    
                    for (n of keyNorm) {
                        normalsFlat.push(n);
                        //logger = logger.concat(n + ",");
                    }
                    //logger = logger.concat("][");
                    for (n of prevNorm) {
                        normalsFlat.push(n);
                        //logger = logger.concat(n + ",");
                    }
                    //logger = logger.concat("][");
                    for (n of thisNorm) {
                        normalsFlat.push(n);
                        //logger = logger.concat(n + ",");
                    }
                    
                    /*for (n of [0,1,0]) {
                        normalsFlat.push(n);
                        //logger = logger.concat(n + ",");
                    }
                    //logger = logger.concat("][");
                    for (n of [0,1,0]) {
                        normalsFlat.push(n);
                        //logger = logger.concat(n + ",");
                    }
                    //logger = logger.concat("][");
                    for (n of [0,1,0]) {
                        normalsFlat.push(n);
                        //logger = logger.concat(n + ",");
                    }*/
                    
                    
                    //console.log(logger);
                    
                    //This is similar to stripping, but for each polygon
                    prevVert=thisVert;
                    prevTextureCord=thisTextureCord;
                    
                }
                
                
            }
        }
        //console.log(count);
        //if (count <100)
        //{
        //console.log(count);
        //console.log(verticesFlat);
        //console.log(textureCordsFlat);
        //console.log(vertexIndices);
        //}
        
        myGL.initBuffer(toFill,verticesFlat,normalsFlat,textureCordsFlat,vertexIndices,count);
    };
    
    var loadedTextures = {};
    var loadedOBJs = {};
    function loadTexture(imgName) {
        if (!loadedTextures.hasOwnProperty(imgName)) {
	      loadedTextures[imgName] = {};
	      loadedTextures[imgName].image = new Image();
	      loadedTextures[imgName].imgName = imgName;
	      loadedTextures[imgName].image.onload = function () {
	          myGL.handleLoadedTexture(loadedTextures[imgName])
	      }
	      
	      loadedTextures[imgName].image.src = imgName;
        }
    }
    function loadOBJ(objName,textureScaleX,textureScaleY) {
        var path = window.location.pathname.substring(1);
        textureScaleX = typeof textureScaleX !== 'undefined' ? textureScaleX : 1;
        textureScaleY = typeof textureScaleX !== 'undefined' ? textureScaleY : textureScaleX;
        var refOBJName = objName + textureScaleX+'_'+textureScaleY;
        if (!loadedOBJs.hasOwnProperty(refOBJName)) {
              loadedOBJs[refOBJName]={};
              loadedOBJs[refOBJName].vertexPositionBuffer=null;
              loadedOBJs[refOBJName].vertexTextureCordBuffer=null;
              loadedOBJs[refOBJName].vertexIndexBuffer=null;
        
          
	          var xhr = new XMLHttpRequest();
	          xhr.open("GET", "/"+path+objName, true);
	          xhr.onload = function (e) {
	            if (xhr.readyState === 4) {
	              if (xhr.status === 200) {
	                //console.log(xhr.responseText);
	                var objFile=xhr.responseText;
	                setUpOBJ(loadedOBJs[refOBJName],objFile,textureScaleX,textureScaleY);
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
    }
    
    GenericObject.prototype.initTexture = function (imgName) {
        
        if (imgName === null) {
            this.texture = null;
            return;
        }
        
        //Get the texture
        loadTexture(imgName);
     
        this.texture = loadedTextures[imgName];

              
    }
    
    GenericObject.prototype.initOBJ = function (objName,textureScaleX,textureScaleY) {
        if (objName === null) {
            this.obj = null;
            return;
        }
        textureScaleX = typeof textureScaleX !== 'undefined' ? textureScaleX : 1;
        textureScaleY = typeof textureScaleX !== 'undefined' ? textureScaleY : textureScaleX;
        var refOBJName = objName + textureScaleX+'_'+textureScaleY;
        //Get the OBJ file
        loadOBJ(objName,textureScaleX,textureScaleY);
        this.obj=loadedOBJs[refOBJName]
              
    }


//////////////////////////////////
    
    function WheelObject(wheelImg,wheelObj,scale,positionMatrix,owner) {
        GenericObject.call(this,wheelImg,wheelObj,scale,positionMatrix,owner);
        this.steerRotation = new Mat4();
        this.spinRotation = new Mat4();
        
        
    }
    WheelObject.prototype = Object.create(GenericObject.prototype);
    WheelObject.prototype.constructor = WheelObject;
    WheelObject.prototype.setSteerRotation = function(angle) {
            this.steerRotation = (new Mat4()).rotateYAxis(angle);
    };
        
    WheelObject.prototype.getDrawMatrix = function() {
    	return this.owner.getDrawMatrix().multiply(this.position).multiply(this.steerRotation).multiply(this.spinRotation).multiply(this.rotation).multiply(this.scaleM);
    };
    
////////////////////////////////
    
    function CarObject(chasisImg,chasisObj,wheelImg,wheelObj,scale,positionMatrix,owner) {
        GenericObject.call(this,null,null,scale,positionMatrix,owner);
        var centerOffset = -0.4;
        this.chasis = new GenericObject(chasisImg,chasisObj,1,[0,0,centerOffset],this);
        this.FRWheel = new WheelObject(wheelImg,wheelObj,0.25,[0.37,0.15,centerOffset-0.535],this);
        this.FLWheel = new WheelObject(wheelImg,wheelObj,0.25,[-0.37,0.15,centerOffset-0.535],this);
        this.FLWheel.rotation = (new Mat4()).rotateYAxis(180);
        
        this.BRWheel = new WheelObject(wheelImg,wheelObj,0.25,[0.37,0.15,centerOffset+0.48],this);
        this.BLWheel = new WheelObject(wheelImg,wheelObj,0.25,[-0.37,0.15,centerOffset+0.48],this);
        this.BLWheel.rotation = (new Mat4()).rotateYAxis(180);
        
        this.parts = [this.chasis,this.FRWheel,this.FLWheel,this.BRWheel,this.BLWheel];
        this.turning = 0;
        this.turnSpeed=6.0;
        this.turned=0.0;
        
        this.driving = 0;
        this.rotateConstant = 0.075;
        this.spinConstant = 3;
        this.driveSpeed=0.1;
        this.movement = new Mat4();
    }
    CarObject.prototype = Object.create(GenericObject.prototype);
    
    CarObject.prototype.constructor = CarObject;
    CarObject.prototype.steerWheels = function(angle) {
            this.FRWheel.setSteerRotation(angle);
            this.FLWheel.setSteeRotation(angle);
    };
    CarObject.prototype.getDrawMatrix = function() {
        	 
        	 return this.owner.getDrawMatrix().multiply(this.position).multiply(this.rotation).multiply(this.scaleM);
    };
    CarObject.prototype.animate = function(elapsed) {
            if ((this.turning<0 && this.turned > -55) || (this.turning==0 && this.turned>0)) {
        	    this.FRWheel.steerRotation = this.FRWheel.steerRotation.rotateYAxis(-this.turnSpeed * (elapsed/16.0));
        	    this.FLWheel.steerRotation = this.FLWheel.steerRotation.rotateYAxis(-this.turnSpeed * (elapsed/16.0));
        	    this.turned += -this.turnSpeed;
        	}
    	    else if ((this.turning>0 && this.turned < 55) || (this.turning==0 && this.turned<0)) {
        	    this.FRWheel.steerRotation = this.FRWheel.steerRotation.rotateYAxis(this.turnSpeed * (elapsed/16.0));
        	    this.FLWheel.steerRotation = this.FLWheel.steerRotation.rotateYAxis(this.turnSpeed * (elapsed/16.0));
        	    this.turned += this.turnSpeed;
        	}
        	
        	//Allow easy alignment for striaght
        	if (Math.abs(this.turned)<30 && this.turning==0) {
        	    this.turned=0;
        	    this.FRWheel.steerRotation = new Mat4();
        	    this.FLWheel.steerRotation = new Mat4();
        	}
        	
        	this.turning=0;
        	
        	
        	if (this.driving != 0) {
        	    this.rotation = this.rotation.rotateYAxis(this.rotateConstant * this.turned * (elapsed/16.0));
        	    var transPoint  = (this.rotation).multiply((new Mat4()).translate([0,0,this.driving*-this.driveSpeed * (elapsed/16.0)]))
        	    this.position = this.position.translate([transPoint.get(0,3), transPoint.get(1,3), transPoint.get(2,3)]);
        	    //console.log(this.position);
        	    //this.movement = this.movement.multiply((new Mat4()).translate([0,0,-this.driveSpeed]));//this.rotation
        	    
        	    this.FRWheel.spinRotation = this.FRWheel.spinRotation.rotateXAxis(this.driving*-this.turnSpeed * this.spinConstant * (elapsed/16.0));
        	    this.FLWheel.spinRotation = this.FRWheel.spinRotation.rotateXAxis(this.driving*-this.turnSpeed * this.spinConstant * (elapsed/16.0));
        	    this.BRWheel.spinRotation = this.FRWheel.spinRotation.rotateXAxis(this.driving*-this.turnSpeed * this.spinConstant * (elapsed/16.0));
        	    this.BLWheel.spinRotation = this.FRWheel.spinRotation.rotateXAxis(this.driving*-this.turnSpeed * this.spinConstant * (elapsed/16.0));
        	}
        	this.driving=0;
    };
    CarObject.prototype.turnLeft = function() {
    	 this.turning=1;
    };
    CarObject.prototype.turnRight = function() {
    	 this.turning=-1;
    };
    CarObject.prototype.driveForwards = function() {
    	 this.driving=1;
    };
    CarObject.prototype.driveBackwards = function() {
    	 this.driving=-1;
    };
//////////////////////////////////

function SolidObject(img,obj,radius,scale,positionMatrix,owner) {
    GenericObject.call(this,img,obj,scale,positionMatrix,owner);
    this.boundingRadius = radius*scale;
    this.plane=false;
}
SolidObject.prototype = Object.create(GenericObject.prototype);
SolidObject.prototype.constructor = SolidObject;
SolidObject.prototype.activate = function() {};
SolidObject.prototype.collisionCheck = function(otherSolidObject,myMoveVec,activate)
{
    if (activate==undefined) activate=true;
    
    var futurePos = this.position.translate(myMoveVec);
    var curDist = Math.sqrt( Math.pow(this.position.get(0,3)-otherSolidObject.position.get(0,3),2) + 
                      // Math.pow(this.position.get(1,3)-otherSolidObject.position.get(1,3),2) + 
                       Math.pow(this.position.get(2,3)-otherSolidObject.position.get(2,3),2) ) ;
    var futDist = Math.sqrt( Math.pow(futurePos.get(0,3)-otherSolidObject.position.get(0,3),2) + 
                      // Math.pow(futurePos.get(1,3)-otherSolidObject.position.get(1,3),2) + 
                       Math.pow(futurePos.get(2,3)-otherSolidObject.position.get(2,3),2) ) ;
    //console.log(dist);
    if (futDist-(this.boundingRadius+otherSolidObject.boundingRadius) <= 0 && futDist<=curDist) {
        
        if (otherSolidObject.plane)
            return otherSolidObject.collisionCheckPlane(this,myMoveVec.scale(-1),activate);
        if (this.plane)
            return this.collisionCheckPlane(otherSolidObject,myMoveVec,activate);
        
        if (activate) {
			this.activate();
			otherSolidObject.activate();
		}
        return (new Vec([otherSolidObject.position.get(0,3)-this.position.get(0,3),
                       0,
                       otherSolidObject.position.get(2,3)-this.position.get(2,3)])).normalize();
    }
    else if (futDist-(this.boundingRadius+otherSolidObject.boundingRadius) <= 0) {
        if (otherSolidObject.plane)
            return otherSolidObject.collisionCheckPlane(this,myMoveVec.scale(-1),activate);
        if (this.plane)
            return this.collisionCheckPlane(otherSolidObject,myMoveVec,activate);
    }
    return null;
}
SolidObject.prototype.collisionCheckPlane = function(otherSolidObject,myMoveVec,activate)
{
	if (activate==undefined) activate=true;
    var futurePos = this.position.translate(myMoveVec).posVec();
    var thisNormal = this.rotation.multiplyPoint([0,0,1]);//we assum this is standard orientation for walls
    var d = -1*this.getPosVec().dot(thisNormal);
    var d_future = -1*futurePos.dot(thisNormal);
    var curDist = otherSolidObject.getPosVec().dot(thisNormal)+d;
    var futDist = otherSolidObject.getPosVec().dot(thisNormal)+d_future;
    //console.log("cur = "+curDist);
    //console.log("fut = "+futDist);
    if ((curDist>this.thickness||Math.abs(futDist)<Math.abs(curDist)) && (curDist*futDist<=0 || Math.abs(futDist)<this.thickness)) {
        if (activate) {
			this.activate();
			otherSolidObject.activate();
		}
        if (curDist>0)
            return thisNormal;
        else
            return thisNormal.scale(-1);
    }
    else
        return null;
}
/*SolidObject.prototype.collisionCheckPlane = function(otherSolidObject,myMoveVec,activate)
{
	if (activate==undefined) activate=true;
    var futurePos = this.position.translate(myMoveVec).posVec();
    var thisNormal = this.rotation.multiplyPoint([0,0,1]);//we assum this is standard orientation for walls
    var d = -1*this.position.posVec().dot(thisNormal);
    var d_future = -1*futurePos.dot(thisNormal);
    var curDist = otherSolidObject.position.posVec().dot(thisNormal)+d;
    var futDist = otherSolidObject.position.posVec().dot(thisNormal)+d_future;
    //console.log("cur = "+curDist);
    //console.log("fut = "+futDist);
    if ((curDist>this.thickness||Math.abs(futDist)<Math.abs(curDist)) && (curDist*futDist<=0 || Math.abs(futDist)<this.thickness)) {
        if (activate) {
			this.activate();
			otherSolidObject.activate();
		}
        if (curDist>0)
            return thisNormal;
        else
            return thisNormal.scale(-1);
    }
    else
        return null;
}*/
/////////////////////	
function Wall(img,obj,rotation,scale,positionMatrix,owner) {
    this.init(scale,positionMatrix,owner);
    this.initTexture(img);
    //var tex_width = 
    var setScale=2;
    this.initOBJ(obj,scale/2,setScale/2);
    this.rotationAngle=rotation;
    this.rotation = (new Mat4()).rotateYAxis(rotation);
    this.plane=true;
    this.thickness=0.5;
    this.boundingRadius = 0.5*scale;
    this.scaleM = (new Mat4()).scale([scale,setScale,setScale]);
}
Wall.prototype = Object.create(SolidObject.prototype);
Wall.prototype.constructor = Wall;

//////////////////////////////////
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

 
function TreeObject(density,barkImg,leafImg,trunkObj,branchObj,branchLeafObj,smallBranchObj,treeTopperObj,scale,positionMatrix,owner) {
    SolidObject.call(this,null,null,0.2,scale,positionMatrix,owner);
    this.trunk = new TreePart('trunk',barkImg,trunkObj,15,0.3,[0,0,0],this);
    this.trunk.rotation = (new Mat4()).rotateYAxis(360*Math.random());
    this.parts = [this.trunk];
    this.parts.push(new TreePart('top',leafImg,treeTopperObj,5,0.3,[0,0,0],this));
    this.density=density;
    var maxN=1.2/density;//2.0
    var minN=0.7/density;//1.2
    var numBranches = Math.random()*(maxN-minN)+minN;
    var spacingH =[];
    var spacingR =[];
    for (var p=0.0; p<1.0; p+=1.0/numBranches) {
		spacingH.push(p + (Math.random()*0.2-0.1));
		spacingR.push(p + (Math.random()*0.2-0.1));
	}
	spacingR = shuffle(spacingR);
	
    for (var i=0; i<numBranches; i++) {
		var height = spacingH[i]*4.5 -2
		if (height<0) {
			this.parts.push(new TreePart('branch',barkImg,branchObj,15,0.3,[0,height,0],this));
			this.parts[this.parts.length-1].setRotation((new Mat4()).rotateYAxis(360*spacingR[i]));
			this.parts.push(new TreePart('leaf',leafImg,branchLeafObj,5,0.3,[0,height,0],this));
			this.parts[this.parts.length-1].setRotation( (new Mat4()).rotateYAxis(360*spacingR[i]));
		}
		else {
			this.parts.push(new TreePart('small',leafImg,smallBranchObj,5,0.3,[0,height-0.5,0],this));
			this.parts[this.parts.length-1].setRotation( (new Mat4()).rotateYAxis(360*spacingR[i]));
		}
        
    }
}
TreeObject.prototype = Object.create(SolidObject.prototype);
TreeObject.prototype.constructor = TreeObject;


function TreePart(type,barkImg,trunkObj,textureScale,scale,positionMatrix,owner) {
    this.init(scale,positionMatrix,owner);
    this.initTexture(barkImg);
    this.initOBJ(trunkObj,textureScale);
    this.type=type;
}
TreePart.prototype = Object.create(GenericObject.prototype);
TreePart.prototype.constructor = TreePart;


//////////////////////////////////
function Ghost(gameState,moveSpeed,isSlow,ghostImg,ghostObj,scale,positionMatrix,owner) {
    SolidObject.call(this,ghostImg,ghostObj,0.5,scale,positionMatrix,owner);
    this.gameStateRef = gameState;
    this.moveSpeed=moveSpeed;
    this.isSlow=isSlow;
    var loner=Math.random();
    if (loner>0.8)
        this.spacing=4.0+100*(loner-0.8);
}
Ghost.prototype = Object.create(SolidObject.prototype);
Ghost.prototype.constructor = Ghost;
Ghost.prototype.spacing=3.0;
Ghost.prototype.activate = function() {
        this.gameStateRef.killed();
}
Ghost.prototype.animate = function(elapsed) {
    var toPlayer = (this.gameStateRef.playerLocation().minus(this.getPosVec())).normalize();
    var up = new Vec([0,1,0]);
    var orth = toPlayer.cross(up);
    
    var angleToPlayer = Math.atan2(toPlayer[2],toPlayer[0]);
    this.setRotation ( (new Mat4()).rotateYAxis(-180.0*angleToPlayer/Math.PI));
    
    var myPos = this.getPosVec();
    var closestPos=null;
    var closestNeg=null;
    for (obj of this.gameStateRef.collidableObjects) {
        if (obj!=this && obj instanceof Ghost && obj.getPosVec().distance(myPos)<this.spacing) {
            var orthDist = obj.getPosVec().minus(myPos).dot(orth);
            if (orthDist>=0 && (orthDist<closestPos || closestPos==null)) {
                closestPos=orthDist;
            }
            else if (orthDist<0 && (orthDist>closestNeg || closestNeg==null)) {
                closestNeg=orthDist;
            }
        }
    }
    var move = toPlayer;
    if (closestPos!=null && closestNeg!=null)
        move = move.plus(orth.scale((closestPos+closestNeg)/4.0));
    else if (closestPos!=null)
        move = move.plus(orth.scale((-closestPos)/3.0));
    else if (closestNeg!=null)
        move = move.plus(orth.scale((-closestNeg)/3.0));
        
    
    this.setPosition ( this.position.translate(move.normalize().scale(elapsed*this.moveSpeed)));
    this.collisionCheck(this.gameStateRef.camera,toPlayer.scale(elapsed*this.moveSpeed));
    
}
////////////////////////////
function Grave(gameState,inFront,graveImg,graveOnImg,graveObj,ghostImg,ghostObj,soundUp,soundDown,scale,positionMatrix,owner) {
    SolidObject.call(this,graveOnImg,graveObj,0.6,scale,positionMatrix,owner);
    this.gameStateRef = gameState;
    this.inFront = inFront;
    this.ghostImg=ghostImg;
    this.ghostObj=ghostObj;
    this.state=0;
    this.trips = [];
    
    this.onTexture = this.texture;
    this.initTexture(graveImg);
    this.offTexture = this.texture;
    this.touch = new Trip(this,ghostImg,ghostObj,1.1,positionMatrix);
    this.gameStateRef.collidableObjects.push(this.touch);
    this.sndDown = soundDown;
    this.sndUp = soundUp;
}
Grave.prototype = Object.create(SolidObject.prototype);
Grave.prototype.constructor = Grave;
Grave.prototype.seen = function(calling) {
    if (calling == this.touch) {
        console.log('trip')
        this.activate();
        for (var i=0; i<this.gameStateRef.collidableObjects.length; i++) {
            //console.log(obj.spawner);
            if (this.gameStateRef.collidableObjects[i]===calling) {
                this.gameStateRef.collidableObjects.splice(i,1);
                break;
            }
        }
        return;
    } 
    
    
    if (this.state ==0) {
        this.state=1;
        var moveSpeed;
        var location;
        var thisPos = this.getPosVec();
        thisPos[1]=1.0;
        if (this.inFront) {
            moveSpeed=0.0028;
            location = (this.gameStateRef.playerLocation().minus(thisPos).scale(0.4).plus(thisPos));
            if (this.gameStateRef.currentLevel==1) {
                moveSpeed=0.0009;
                location = (this.gameStateRef.playerLocation().minus(thisPos).scale(0.2).plus(thisPos));
            }
        }
        else {
            moveSpeed=0.005;
            location = (this.gameStateRef.playerLocation().minus(thisPos).scale(3.0).plus(thisPos));
        }
        var chaser= new Ghost(this.gameStateRef,moveSpeed,this.inFront,this.ghostImg, this.ghostObj,0.2,location);
        chaser.spawner=this;
        this.gameStateRef.collidableObjects.push(chaser);
        for (var i=0; i<this.gameStateRef.collidableObjects.length; i++) {
            //console.log(obj.spawner);
            if (this.gameStateRef.collidableObjects[i]===calling) {
                this.gameStateRef.collidableObjects.splice(i,1);
                break;
            }
        }
        this.texture=this.onTexture;
        if (!this.gameStateRef.mute) {
            this.gameStateRef.sing();
            this.sndUp.currentTime=0;
            this.sndUp.play();
        }
    }
}
Grave.prototype.activate = function() {
    if (this.state<2) {
        this.state=2;
        for (var i=0; i<this.gameStateRef.collidableObjects.length; i++) {
            //console.log(obj.spawner);
            if (this.gameStateRef.collidableObjects[i].spawner===this) {
                this.gameStateRef.collidableObjects.splice(i,1);
                this.gameStateRef.ghostsCountOnLevel[this.gameStateRef.ghostsCountOnLevel.length-1]++;
                break;
            }
        }
        this.texture=this.offTexture;
        if (!this.gameStateRef.mute) {
            this.gameStateRef.sing();
            this.sndDown.currentTime=0;
            this.sndDown.play();
        }
        
    }
}
Grave.prototype.setTripLoc = function(trip) {
    if (trip != this.touch)
        this.trips.push( trip );
}
Grave.prototype.getTrips = function() {
    var ret = [];
    for (trip of this.trips) {
        ret.push({scale:trip.scale, loc:trip.getPosVec().flat()});
    }
    return ret;
}

////////////////
function Trip(grave,blankImg,circleObj,scale,positionMatrix,owner) {
    //SolidObject.call(this,blankImg,circleObj,1.0,scale,positionMatrix,owner);
    this.init(scale,positionMatrix,owner);
    this.initTexture(blankImg);
    //var tex_width = 
    var setScale=1;
    this.initOBJ(circleObj,scale/2,setScale/2);
    this.boundingRadius = 1.0*scale;
    this.plane=false;
    this.grave = grave;
    grave.setTripLoc(this);
}
Trip.prototype = Object.create(SolidObject.prototype);
Trip.prototype.constructor = Trip;
Trip.prototype.activate = function() {
    this.grave.seen(this);
}
////////////////
function Goal(gameStateRef,goalImg,goalObj,sound,scale,positionMatrix,owner) {
    SolidObject.call(this,goalImg,goalObj,1.0,scale,positionMatrix,owner);
    this.gameStateRef=gameStateRef;
    this.sound=sound;
}
Goal.prototype = Object.create(SolidObject.prototype);
Goal.prototype.constructor = Goal;
Goal.prototype.activate = function() {
    if (!this.gameStateRef.mute) 
        this.sound.play();
    this.gameStateRef.nextLevel();
}
Goal.prototype.animate = function(elapsed) {
    //console.log(this.gameStateRef.playerLocation().distance(this.position.posVec()))
    var spinSpeed = 0.1+0.6*(8-Math.min(8,this.gameStateRef.playerLocation().distance(this.getPosVec())));
    this.setRotation ( this.rotation.rotateYAxis(spinSpeed*elapsed));
}
////////////////////////////////
function Hut(name,gameStateRef,wallImg,wallObj,rotation,scale,positionMatrix,owner) {
    GenericObject.call(this,null,null,scale,positionMatrix,owner);
    this.setRotation((new Mat4()).rotateYAxis(rotation));
    var myself=undefined;
    //Wall(img,obj,rotation,scale,positionMatrix,owner)
    /*var parts = [new Wall(wallImg,wallObj,0,scale*3,[0,0,-1.5],myself),//back out
                  new Wall(wallImg,wallObj,90,scale*3,[-1.5,0,0],myself),//right out
                  new Wall(wallImg,wallObj,90,scale*3,[1.5,0,0],myself),//left out
                  new Wall(wallImg,wallObj,0,scale*0.5,[-1.25,0,1.5],myself),//rightfront out
                  new Wall(wallImg,wallObj,0,scale*0.5,[1.25,0,1.5],myself),//leftfront out
                  new Wall(wallImg,wallObj,0,scale*2,[0,0,-1],myself),//back in
                  new Wall(wallImg,wallObj,90,scale*2.5,[-1,0,0.25],myself),//right out
                  new Wall(wallImg,wallObj,90,scale*2.5,[1,0,0.25],myself)//left out
                 ];*/
    var transfMat=this.getDrawMatrix();//(new Mat4()).scale([scale,scale,scale]).rotateYAxis(rotation).translate(positionMatrix);
    var parts = [new Wall(wallImg,wallObj,0+rotation,scale*3,transfMat.multiplyPoint([0,0,-1.5]),myself),//back out
                  new Wall(wallImg,wallObj,90+rotation,scale*3,transfMat.multiplyPoint([-1.5,0,0]),myself),//right out
                  new Wall(wallImg,wallObj,90+rotation,scale*3,transfMat.multiplyPoint([1.5,0,0]),myself),//left out
                  new Wall(wallImg,wallObj,0+rotation,scale*0.5,transfMat.multiplyPoint([-1.25,0,1.5]),myself),//rightfront out
                  new Wall(wallImg,wallObj,0+rotation,scale*0.5,transfMat.multiplyPoint([1.25,0,1.5]),myself),//leftfront out
                  new Wall(wallImg,wallObj,0+rotation,scale*2,transfMat.multiplyPoint([0,0,-1]),myself),//back in
                  new Wall(wallImg,wallObj,90+rotation,scale*2.5,transfMat.multiplyPoint([-1,0,0.25]),myself),//right out
                  new Wall(wallImg,wallObj,90+rotation,scale*2.5,transfMat.multiplyPoint([1,0,0.25]),myself)//left out
                 ];
    for (var i=0; i<parts.length; i++) {
        gameStateRef.solidObjects[name+i]=parts[i];
    }
}
Hut.prototype = Object.create(GenericObject.prototype);
Hut.prototype.constructor = Hut;
////////////////////////////////
function FloorObject(img,obj,scale,positionMatrix,owner) {
    this.init(scale,positionMatrix,owner);
    this.initTexture(img);
    //var tex_width = 
    this.initOBJ(obj,scale/2);
}
FloorObject.prototype = Object.create(GenericObject.prototype);
FloorObject.prototype.constructor = FloorObject;
        
