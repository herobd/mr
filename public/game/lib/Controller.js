define( function() {
    
    var controller =  {
        player : 0,
        stickL : [],//array of functions(elapsed,x,y)
        stickR : [],//array of functions(elapsed,x,y)
        stickLR : [],//array of functions(elapsed,xL,yL,xR,yR)
        dPad : [],//array of functions(elapsed,u,d,l,r)
        buttonN : [],//array of functions(elapsed,b)
        buttonS : [],//array of functions(elapsed,b)
        buttonE : [],//array of functions(elapsed,b)
        buttonW : [],//array of functions(elapsed,b)
        buttonS : [],//array of functions(elapsed,b)
        triggerL : [],//array of functions(elapsed,b)
        triggerR : [],//array of functions(elapsed,b)
        triggerL_top : [],//array of functions(elapsed,b)
        triggerR_top : [],//array of functions(elapsed,b)
        start : [],//array of functions(elapsed,b)
        keyboard : {},//map, where key value is key code and value is function(b)
        keyboardUp : {},//map, where key value is key code and value is function(b)
        
        hideGamePadMessage : function(){},
        showGamePadMessage : function(){},
        
        currentlyPressedKeys : {},
        currentlyReleasedKeys : {},
        
        stickLx : 0,
        stickLy : 0,
        stickRx : 0,
        stickRy : 0,
        
        windowWidth : 500,
        windowHeight : 500,
        mouseX : -9999,
        mouseY : -9999,
        handleMouseMove : function (event) {
            this.mouseX = event.clientX;
            this.mouseY = event.clientY;
        },
        
        onTick : function(elapsed) {
			var gamePads=navigator.getGamepads();
            var gamepad = undefined;
            for (var i=0; i< gamePads.length; i++) {
				gamepad = gamePads[i];
				//console.log(gamepad)
				if (gamepad !== undefined) break;
			}
    
            var cind = document.getElementById("cind");
            
            this.stickLx=0;
            this.stickLy = 0;
            this.stickRx = 0;
            this.stickRy = 0;
            var noiseThresh = 0.09;
            
            for (var key=0; key<256; key++) {
                //console.log(this.keyboard[key]);
                for ( var todo of this.keyboard[key]) {todo(elapsed,this.currentlyPressedKeys[key]);}
                for ( var todo of this.keyboardUp[key]) {if (this.currentlyReleasedKeys[key]) todo(elapsed);
                                                         this.currentlyReleasedKeys[key] = false;}
            }
            
            if (gamepad !== undefined && gamepad !== null) {
                this.hideGamePadMessage(gamepad.id);
                
                
                
                var dPadU = false;
                var dPadD = false;
                var dPadL = false;
                var dPadR = false;
                
                var buttonN = false;
                var buttonS = false;
                var buttonE = false;
                var buttonW = false;

                
                
                /*for (var i=0; i<gamepad.axes.length; i++) {
	                if (gamepad.axes[i] !== 0 && Math.abs(gamepad.axes[i]) < 0.1) {
	                
	                    gamepad.axes[i]=0;
	                }
	            }*/
                if (gamepad.id.substring(0,17) === "Holtek Controller"  || gamepad.id.search(/[Xx]box/)!=-1 || gamepad.id.search(/[Mm]icrosoft/)!=-1) {//xbox
                    this.stickLx = -gamepad.axes[0];
                    this.stickLy = gamepad.axes[1];
                    this.stickRx = -gamepad.axes[2];
                    this.stickRy = -gamepad.axes[3];
                    
                    if (this.stickLx !== 0 && Math.abs(this.stickLx) < noiseThresh) {
	                    this.stickLx=0;
	                }
	                if (this.stickLy !== 0 && Math.abs(this.stickLy) < noiseThresh) {
	                    this.stickLy=0;
	                }
	                if (this.stickRx !== 0 && Math.abs(this.stickRx) < noiseThresh) {
	                    this.stickRx=0;
	                }
	                if (this.stickRy !== 0 && Math.abs(this.stickRy) < noiseThresh) {
	                    this.stickRy=0;
	                }
                    
                    dPadU = (gamepad.buttons[12].pressed || gamepad.buttons[12].value !== 0);
                    dPadD = (gamepad.buttons[13].pressed || gamepad.buttons[13].value !== 0);
                    dPadL = (gamepad.buttons[14].pressed || gamepad.buttons[14].value !== 0);
                    dPadR = (gamepad.buttons[15].pressed || gamepad.buttons[15].value !== 0);
                    
                    buttonN = (gamepad.buttons[3].pressed || gamepad.buttons[3].value !== 0);
                    buttonS = (gamepad.buttons[0].pressed || gamepad.buttons[0].value !== 0);
                    buttonE = (gamepad.buttons[1].pressed || gamepad.buttons[1].value !== 0);
                    buttonW = (gamepad.buttons[2].pressed || gamepad.buttons[2].value !== 0);
                    
                    //TODO
                    //normalize this.stick vector
                    //
                    //
                
                } else if (gamepad.id.search(/[Gg]ravis/)!=-1) {//??
                    this.stickLx = -gamepad.axes[0];
                    this.stickLy = gamepad.axes[1];
                    this.stickRx = -gamepad.axes[4];
                    this.stickRy = -gamepad.axes[2];
                    
                    if (this.stickLx !== 0 && Math.abs(this.stickLx) < noiseThresh) {
	                    this.stickLx=0;
	                }
	                if (this.stickLy !== 0 && Math.abs(this.stickLy) < noiseThresh) {
	                    this.stickLy=0;
	                }
	                if (this.stickRx !== 0 && Math.abs(this.stickRx) < noiseThresh) {
	                    this.stickRx=0;
	                }
	                if (this.stickRy !== 0 && Math.abs(this.stickRy) < noiseThresh) {
	                    this.stickRy=0;
	                }
                    
                    dPadU = (gamepad.axes[3] < 0);
                    dPadD = (gamepad.axes[3] > 0);
                    dPadL = (gamepad.axes[5] < 0);
                    dPadR = (gamepad.axes[5] > 0);
                    
                    buttonN = (gamepad.buttons[3].pressed || gamepad.buttons[3].value !== 0);
                    buttonS = (gamepad.buttons[1].pressed || gamepad.buttons[1].value !== 0);
                    buttonE = (gamepad.buttons[2].pressed || gamepad.buttons[2].value !== 0);
                    buttonW = (gamepad.buttons[0].pressed || gamepad.buttons[0].value !== 0);
                    
                } else {//if (gamepad.id.substring(0,17) === "Logitech Logitech") {//PS
                    this.stickLx = -gamepad.axes[0];
                    this.stickLy = gamepad.axes[1];
                    this.stickRx = -gamepad.axes[2];
                    this.stickRy = -gamepad.axes[3];
                    
                    if (this.stickLx !== 0 && Math.abs(this.stickLx) < noiseThresh) {
	                    this.stickLx=0;
	                }
	                if (this.stickLy !== 0 && Math.abs(this.stickLy) < noiseThresh) {
	                    this.stickLy=0;
	                }
	                if (this.stickRx !== 0 && Math.abs(this.stickRx) < noiseThresh) {
	                    this.stickRx=0;
	                }
	                if (this.stickRy !== 0 && Math.abs(this.stickRy) < noiseThresh) {
	                    this.stickRy=0;
	                }
                    
                    dPadU = (gamepad.axes[5] < 0);
                    dPadD = (gamepad.axes[5] > 0);
                    dPadL = (gamepad.axes[4] < 0);
                    dPadR = (gamepad.axes[4] > 0);
                    
                    buttonN = (gamepad.buttons[3].pressed || gamepad.buttons[3].value !== 0);
                    buttonS = (gamepad.buttons[1].pressed || gamepad.buttons[1].value !== 0);
                    buttonE = (gamepad.buttons[2].pressed || gamepad.buttons[2].value !== 0);
                    buttonW = (gamepad.buttons[0].pressed || gamepad.buttons[0].value !== 0);
                    
                    //TODO
                    //normalize stick vector
                    //
                    //
                
                }
                /////////////////////////
                
                
                for (var todo of this.dPad) {todo(elapsed,dPadU,dPadD,dPadL,dPadR);}
                for (var todo of this.buttonN) {todo(elapsed,buttonN);}
                for (var todo of this.buttonS) {todo(elapsed,buttonS);}
                for (var todo of this.buttonE) {todo(elapsed,buttonE);}
                for (var todo of this.buttonW) {todo(elapsed,buttonW);}
                
	            //test script
	            /*for (var i=0; i<gamepad.axes.length; i++) {
	                if (gamepad.axes[i] !== 0) {
	                    console.log('stick['+i+'] = '+gamepad.axes[i]);
	                }
	            }
	            for (var i=0; i<gamepad.buttons.length; i++) {
	                if (gamepad.buttons[i].pressed || gamepad.buttons[i].value !== 0) {
	                    console.log('button['+i+'] pressed='+gamepad.buttons[i].pressed+'  value='+gamepad.buttons[i].value);
	                }
	            }*/
	

            } else {
                this.showGamePadMessage();
                this.stickRx = -((this.mouseX-30)-(this.windowWidth-60)/2.0)/((this.windowWidth-60)/2.0);
                this.stickRy = -((this.mouseY-30)-(this.windowWidth-60)/2.0)/((this.windowWidth-60)/2.0);
                //this.mouseX = this.mouseY = 250;
                //if (this.stickRx>1 || this.stickRx<-1 || this.stickRy>1 || this.stickRy<-1) {
                //    this.stickRx = this.stickRy =0;
                //}
                if (this.stickRx>1) this.stickRx=1;
                if (this.stickRy>1) this.stickRy=1;
                if (this.stickRx<-1) this.stickRx=-1;
                if (this.stickRy<-1) this.stickRy=-1;
                
                
                if (this.stickRx !== 0 && Math.abs(this.stickRx) < noiseThresh*3) {
                    this.stickRx=0;
                }
                else {
                    this.stickRx = 2*((this.stickRx+1)-noiseThresh*2.5)/(2-noiseThresh*2.5) -1;
                }
                if (this.stickRy !== 0 && Math.abs(this.stickRy) < noiseThresh*7) {
                    this.stickRy=0;
                }
                else {
                    this.stickRy = 2*((this.stickRy+1)-noiseThresh*7)/(2-noiseThresh*7) -1;
                }
            }
            for (var todo of this.stickL) {todo(elapsed,this.stickLx,this.stickLy);}
            for (var todo of this.stickR) {todo(elapsed,this.stickRx,this.stickRy);}
            for (var todo of this.stickLR) {todo(elapsed,this.stickLx,this.stickLy,this.stickRx,this.stickRy);}
            
            
        }
    };    
    
    for (var i=0; i<256; i++) {controller.keyboard[i]=[]; controller.keyboardUp[i]=[];}
    
    handleKeyDown = function (event) {
        controller.currentlyPressedKeys[event.keyCode] = true;
    }

    handleKeyUp = function (event) {
      controller.currentlyPressedKeys[event.keyCode] = false;
      controller.currentlyReleasedKeys[event.keyCode] = true;
    }
    handleMouseMove = function (event) {
      controller.handleMouseMove(event);
    }
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    document.onmousemove = handleMouseMove;
    
    return controller
});
