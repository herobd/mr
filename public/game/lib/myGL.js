define( function() {

function validateNoneOfTheArgsAreUndefined(functionName, args) {
  for (var ii = 0; ii < args.length; ++ii) {
    if (args[ii] === undefined) {
      console.error("undefined passed to gl." + functionName + "(" +
                     WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
    }
  }
} 

    return {
        shaderProgram : null,
        framebuffer : null,
        colorTexture : null,
        depthTexture : null,

        initGL : function (canvas,flatCanvas) {
            try {
                this.gl=canvas.getContext("experimental-webgl");
                //var depthTextureExt = this.gl.getExtension("WEBKIT_WEBGL_depth_texture"); // Or browser-appropriate prefix
                //if(!depthTextureExt) { console.log('ERROR, no depth textures');}
                //this.gl = WebGLDebugUtils.makeDebugContext(this.gl, undefined, validateNoneOfTheArgsAreUndefined);
                this.viewportWidth = canvas.width;
                this.viewportHeight = canvas.height;
                
                this.flat = flatCanvas.getContext("2d");
            }
            catch (e) {
            }

            if (!this.gl) {
                alert("Could not initialise WebGL, sorry :-(");
            } else {
                this.initShaders();
                
                this.gl.clearColor(0.2, 0.2, 0.2, 1.0);//gray background
                this.gl.clearDepth(1.0);
                this.gl.enable(this.gl.DEPTH_TEST);
                this.gl.depthFunc(this.gl.LEQUAL);
                
                var pMatrix = mat4.create();
                mat4.perspective(45, this.viewportWidth / this.viewportHeight, 0.1, 30.0, pMatrix);
                this.gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, pMatrix);
                
                /*this.framebuffer = this.gl.createFramebuffer();
                this.colorTexture = this.gl.createTexture();
                this.depthTexture = this.gl.createTexture();
                // Create a color texture
                
                this.gl.bindTexture(this.gl.TEXTURE_2D, this.colorTexture);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
                //this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 0, 0, this.viewportWidth, this.viewportHeight, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);

                // Create the depth texture
                
                this.gl.bindTexture(this.gl.TEXTURE_2D, this.depthTexture);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.DEPTH_COMPONENT, this.gl.DEPTH_COMPONENT, this.gl.UNSIGNED_SHORT, null);
                //this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.DEPTH_COMPONENT, 0, 0, this.viewportWidth, this.viewportHeight, 0, this.gl.DEPTH_COMPONENT, this.gl.UNSIGNED_SHORT, null);
                */
            }

        },
        
        getShader : function (id) {
            var shaderScript = document.getElementById(id);
            if (!shaderScript) {
                return null;
            }

            var str = "";
            var k = shaderScript.firstChild;
            while (k) {
                if (k.nodeType == 3) {
                    str += k.textContent;
                }

                k = k.nextSibling;
            }

            var shader;
            if (shaderScript.type == "x-shader/x-fragment") {
                shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
            } else if (shaderScript.type == "x-shader/x-vertex") {
                shader = this.gl.createShader(this.gl.VERTEX_SHADER);
            } else {
                return null;
            }

            this.gl.shaderSource(shader, str);
            this.gl.compileShader(shader);
            if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
                alert(this.gl.getShaderInfoLog(shader));
                return null;
            }

            return shader;
        },
        
        initShaders : function () {
            var fragmentShader = this.getShader("shader-fs");
            var vertexShader = this.getShader("shader-vs");
            this.shaderProgram = this.gl.createProgram();
            this.gl.attachShader(this.shaderProgram, vertexShader);
            this.gl.attachShader(this.shaderProgram, fragmentShader);
            this.gl.linkProgram(this.shaderProgram);
            if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
                alert("Could not initialise shaders");
            }

            this.gl.useProgram(this.shaderProgram);
            this.shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
            this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);
            
            this.shaderProgram.vertexNormalAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexNormal");
            this.gl.enableVertexAttribArray(this.shaderProgram.vertexNormalAttribute);
            
            this.shaderProgram.textureCoordAttribute = this.gl.getAttribLocation(this.shaderProgram, "aTextureCoord");
            this.gl.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);
            
            this.shaderProgram.pMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uPMatrix");
            this.shaderProgram.mvMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uMVMatrix");
            this.shaderProgram.samplerUniform = this.gl.getUniformLocation(this.shaderProgram, "uSampler");
            this.shaderProgram.nMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uNMatrix");
            
            this.shaderProgram.ambientColorUniform = this.gl.getUniformLocation(this.shaderProgram, "uAmbientColor");
            this.shaderProgram.lightingDirectionUniform = this.gl.getUniformLocation(this.shaderProgram, "uLightingDirection");
            this.shaderProgram.directionalColorUniform = this.gl.getUniformLocation(this.shaderProgram, "uDirectionalColor");
            
            //////////////////////////////
            /*
            var fragmentShaderFlat = this.getShader("shader-fs-flat");
            var vertexShaderFlat = this.getShader("shader-vs-flat");
            this.shaderProgramFlat = this.gl.createProgram();
            this.gl.attachShader(this.shaderProgramFlat, vertexShaderFlat);
            this.gl.attachShader(this.shaderProgramFlat, fragmentShaderFlat);
            this.gl.linkProgram(this.shaderProgramFlat);
            if (!this.gl.getProgramParameter(this.shaderProgramFlat, this.gl.LINK_STATUS)) {
                alert("Could not initialise shadersFlat");
            }

            this.gl.useProgram(this.shaderProgramFlat);
            this.shaderProgramFlat.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgramFlat, "aVertexPosition");
            this.gl.enableVertexAttribArray(this.shaderProgramFlat.vertexPositionAttribute);
            
            
            this.shaderProgramFlat.textureCoordAttribute = this.gl.getAttribLocation(this.shaderProgramFlat, "aTextureCoord");
            this.gl.enableVertexAttribArray(this.shaderProgramFlat.textureCoordAttribute);*/
        },
        
        switchMainShader : function() {
            if (this.shader!='main') {
                this.gl.useProgram(this.shaderProgram);
                this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);
                this.gl.enableVertexAttribArray(this.shaderProgram.vertexNormalAttribute);
                this.gl.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);
                this.currentShader='main';
            }
        },
        switchFlatShader : function() {
            if (this.shader!='flat') {
                this.gl.useProgram(this.shaderProgramFlat);
                this.gl.enableVertexAttribArray(this.shaderProgramFlat.vertexPositionAttribute);
                this.gl.enableVertexAttribArray(this.shaderProgramFlat.textureCoordAttribute);
                this.currentShader='flat';
            }
        },
        
        //JS is single threaded, so I think this doesn't have a race condition
        handleLoadedTexture : function (texture) {
            
            //console.log("setting up texture " + texture.imgName);
            texture.glTexture = this.gl.createTexture();
            
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture.glTexture);
            this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, texture.image);
            
            //These parameters supposedly allow NPOT texture sizes (which my box image is)
            //http://stackoverflow.com/questions/3792027/webgl-and-the-power-of-two-image-size
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);//gl.CLAMP_TO_EDGE
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
            //this.gl.texEnvf()?
            
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        },
        
        initBuffer : function (toFill,verticesFlat,normalsFlat,textureCordsFlat,vertexIndices,count) {
            toFill.vertexPositionBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, toFill.vertexPositionBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(verticesFlat), this.gl.STATIC_DRAW);
            toFill.vertexPositionBuffer.itemSize = 3;
            toFill.vertexPositionBuffer.numItems = count;//They all have the same number of references
            
            toFill.vertexTextureCordBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, toFill.vertexTextureCordBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(textureCordsFlat), this.gl.STATIC_DRAW);
            toFill.vertexTextureCordBuffer.itemSize = 2;
            toFill.vertexTextureCordBuffer.numItems = count;
            
            toFill.vertexNormalBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, toFill.vertexNormalBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(normalsFlat), this.gl.STATIC_DRAW);
            toFill.vertexNormalBuffer.itemSize = 3;
            toFill.vertexNormalBuffer.numItems = count;
            
            toFill.vertexIndexBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, toFill.vertexIndexBuffer);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), this.gl.STATIC_DRAW);
            toFill.vertexIndexBuffer.itemSize = 1;
            toFill.vertexIndexBuffer.numItems = count;
        },
        
        //Assumes my Mat4 objects
        setMatrixUniforms : function (perspectiveMat,moveMat) {
            this.gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, perspectiveMat.multiply(moveMat).flat());
            //this.gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, (moveMat.translate([0.0,-1,0.0])).flat());
            
            
            
            //??
            var nmMatrixFlat = moveMat.toInverseMat3x3_flat();
            this.gl.uniformMatrix3fv(this.shaderProgram.nMatrixUniform, false, nmMatrixFlat)
            //this.gl.uniformMatrix3fv(this.shaderProgram.nMatrixUniform, false, moveMat.flat());
            //this.gl.uniformMatrix3fv(this.shaderProgram.nMatrixUniform, false, [1,0,0,0,1,0,0,0,1]);
        },
        
        drawTexturedObjectPart : function  (texturedObject,perspectiveMat) {
            this.switchMainShader()
            //console.log(texturedObject);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texturedObject.obj.vertexPositionBuffer);
            this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, texturedObject.obj.vertexPositionBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
            
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texturedObject.obj.vertexTextureCordBuffer);
            this.gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, texturedObject.obj.vertexTextureCordBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
            
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texturedObject.obj.vertexNormalBuffer);
            this.gl.vertexAttribPointer(this.shaderProgram.vertexNormalAttribute, texturedObject.obj.vertexNormalBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
            
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, texturedObject.texture.glTexture);
            this.gl.uniform1i(this.shaderProgram.samplerUniform, 0);
            
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, texturedObject.obj.vertexIndexBuffer);
            this.setMatrixUniforms(perspectiveMat,texturedObject.getDrawMatrix());
            this.gl.drawElements(this.gl.TRIANGLES, texturedObject.obj.vertexIndexBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);
        },
        
        drawTexturedObjects : function  (texturedObjects,perspectiveMat) {
            this.switchMainShader();
            //var pMatrix = mat4.create();
            //mat4.perspective(45, this.viewportWidth / this.viewportHeight, 0.1, 20.0, pMatrix);
            //this.gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, pMatrix);
            
            
            
            
            //console.log(texturedObject);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texturedObjects[0].obj.vertexPositionBuffer);
            this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, texturedObjects[0].obj.vertexPositionBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
            
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texturedObjects[0].obj.vertexTextureCordBuffer);
            this.gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, texturedObjects[0].obj.vertexTextureCordBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
            
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texturedObjects[0].obj.vertexNormalBuffer);
            this.gl.vertexAttribPointer(this.shaderProgram.vertexNormalAttribute, texturedObjects[0].obj.vertexNormalBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
            
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, texturedObjects[0].texture.glTexture);
            this.gl.uniform1i(this.shaderProgram.samplerUniform, 0);
            
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, texturedObjects[0].obj.vertexIndexBuffer);
            for (texturedObject of texturedObjects) {
                var nmMatrixFlat = texturedObject.getDrawMatrix().toInverseMat3x3_flat();
                this.gl.uniformMatrix3fv(this.shaderProgram.nMatrixUniform, false, nmMatrixFlat)
                this.gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, perspectiveMat.multiply(texturedObject.getDrawMatrix()).flat());
                this.gl.drawElements(this.gl.TRIANGLES, texturedObjects[0].obj.vertexIndexBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);
            }
        },
        
        drawFlatTexture : function  (texturedObject) {
            this.switchFlatShader()
            //console.log(texturedObject);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texturedObject.obj.vertexPositionBuffer);
            this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, texturedObject.obj.vertexPositionBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
            
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texturedObject.obj.vertexTextureCordBuffer);
            this.gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, texturedObject.obj.vertexTextureCordBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
            
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texturedObject.obj.vertexNormalBuffer);
            this.gl.vertexAttribPointer(this.shaderProgram.vertexNormalAttribute, texturedObject.obj.vertexNormalBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
            
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, texturedObject.texture.glTexture);
            this.gl.uniform1i(this.shaderProgram.samplerUniform, 0);
            
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, texturedObject.obj.vertexIndexBuffer);
            
            this.gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, texturedObject.getDrawMatrix().flat());
            
            this.gl.drawElements(this.gl.TRIANGLES, texturedObject.obj.vertexIndexBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);
        },
        
        drawUI : function(image,x,y,width,height) {
            this.flat.drawImage(image,x,y,width,height);
            //this.flat.fillText('Hello World!!!!!!!!!!', 200, 200);
        },
        drawText : function(text) {
            this.flat.font = "20px monospace";
            this.flat.textAlign = "center";
            this.flat.textBaseline = "middle";
            this.flat.fillStyle = "white";
            this.flat.fillText(text, 430, 20);
        },
        
        clearScene : function () {
            this.gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
            
            this.flat.clearRect(0, 0, this.viewportWidth, this.viewportHeight);
        },
        
        setLighting : function(ambientColor,lightingDir,lightingColor) {
            this.gl.uniform3f(
                this.shaderProgram.ambientColorUniform,
                ambientColor[0],ambientColor[1],ambientColor[2]
            );
            var lightingDirection = (new Vec(lightingDir)).normalize();//scale(-1);
            this.gl.uniform3f(
                this.shaderProgram.lightingDirectionUniform, 
                lightingDirection[0],lightingDirection[1],lightingDirection[2]
            );
            this.gl.uniform3f(
                this.shaderProgram.directionalColorUniform,
                lightingColor[0],lightingColor[1],lightingColor[2]
            );
        },
        
        getDepthPre : function (points) {
            console.log('getDepthPre() not implemented')
            

            
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
            this.gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
            this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.colorTexture, 0);
            this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.TEXTURE_2D, this.depthTexture, 0);
            
            //this.gl.drawBuffer(this.gl.NONE);
            
            //this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
            //this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
            //this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
            //this.gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
        },
        
        getDepthPost : function (points) {
        
        
            var pixels=null;
            if (this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER) == this.gl.FRAMEBUFFER_COMPLETE) {
                
                  pixels = new Uint8Array(this.width * this.height);
                  var format = this.gl.getParameter(this.gl.IMPLEMENTATION_COLOR_READ_FORMAT);
                  var type =  this.gl.getParameter(this.gl.IMPLEMENTATION_COLOR_READ_TYPE);
                  console.log(format);
                  console.log(type);
                  console.log(this.gl.DEPTH_COMPONENT);
                  console.log(this.gl.UNSIGNED_SHORT);
                  console.log(this.gl.RGBA);
                  console.log(this.gl.UNSIGNED_BYTE);//this.gl.DEPTH_COMPONENT, this.gl.UNSIGNED_SHORT
                  this.gl.readPixels(0, 0, this.width, this.height, format, type, pixels);
                  console.log(pixels);
            }
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
            this.gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
            /*for (point of points) {
                texPos.xyz = (gl_Position.xyz / gl_Position.w) * 0.5 + 0.5;
                float depthFromZBuffer = texture2D(uTexDepthBuffer, texPos.xy).x;
            }*/
            
            return pixels;
        }
    };
});
