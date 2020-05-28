;(function($){
	$(function(){
		
		Array.prototype.in_array = function(needle) 
		{
			
			for (var i = 0; i < this.length; i++){
				if (this[i] === needle){
					return true;
				}
			}
			return false;
		};
		
		Array.prototype.unique = function()
		{
			var tmp = new Array();
			for (i = 0; i < this.length; i++) {
				if ( ! tmp.in_array(this[i]) ) {
					tmp.push(this[i]);
				}
			}
			
			return tmp;
		};
					
		if ( ! Detector.webgl){
			$("#frame").hide();
			$("#start").hide();
			$("#showInvite").hide();
			Detector.addGetWebGLMessage();
		}
		
		if(ODKL){
			ODKL.init();
		}
		
		window.cube = {};
		
		;(function(){
			
			/***
			 * container form renderer
			 */
			this.container = null;
			
			/***
			 * camera object
			 */
			this.camera    = null;
			
			/***
			 * Projector
			 */
			this.projector = null;
			
			/***
			 * Scene object
			 */
			this.scene     = null;
			
			/***
			 * Renderer
			 */
			this.renderer  = null;
			
			/***
			 * Matrix for cubes
			 */
			this.matrix    = [];
			
			/***
			 * Active 9 cubes for rotate
			 */
			this.active = null;
			
			/***
			 * array for keep intersect objects
			 */
			this.intersectObjects = [];
			this.intersectCubes   = [];
			
			/***
			 * Controls
			 */
			this.controls = null;
			
			/***
			 * Timer object 
			 */
			this.timer = {
				'handle'   : null,  // handle setInterval
				'time'     : 0,     // timer elapsed
				'callback' : null,  // callback
				'started'  : false  // game is started
			};
			
			/***
			 * Colors sides of cube
			 */
			this.colors = {
				'right'  : 0xee1010,
				'left'   : 0x34ee10,
				'top'    : 0x1cf9f1,
				'bottom' : 0x1020ee,
				'front'  : 0xe610ee,
				'rear'   : 0xee7310
			};
			
			/***
			 * Lightnes
			 */
			this.light = null;
			
			/***
			 * Animate moving function
			 */
			this._moving = null;
			
			/***
			 * Params rotation cubes
			 */
			this.move = {
				'axis'     : null, // axis x,y,z
				'index'    : null, // index line 0,1,2
				'scale'    : null, // scale rotate 90
				'way'      : null, // way rotate 1 or -1
				'callback' : null  // callback for end rotation
			};
			
			/***
			 * Arrows on cube for rotate parts
			 */
			this.controllArrows = [];
			
			/***
			 * Half window size
			 */
			this.windowHalfX = window.innerWidth / 2;
			this.windowHalfY = window.innerHeight / 2;
			
			this.viral_post_to_stream = {};
			
			/***
			 * Initialize function
			 */
			this.init = function()
			{
				// create container
				this.container = $('<div/>');
				$(document.body).append(this.container);
				
				// create camera
				this.createCamera();
				
				// create scene
				this.createScene();
				
				// create matrix of cubes
				this.createMatrix();
				
				// create arrows controll
				this.createArrows();
				
				// create renderer
				this.createRender();
				
				// create active group
				this.active  = new THREE.Object3D();
				this.scene.add(this.active);
				
				// self instance
				var self = this;
				
				// bind resize window
				$(window).on(
					'resize', 
					(function(self){
						return function(event)
						{
							self.resize(event);
						};
					})(self)
				);
				
			};
			
			this.viral_post = function(postText)
			{
				if( ! FAPI){
					return;
				}

				this.viral_post_to_stream = {
					"method"       : "stream.publish",
					"message"      : postText,
					"action_links" : '[{"text":"text.","href":"frompublished"}]',
					//"attachment"   : '{"caption":"text", "media":[{"href":"link","src":"/cube/image.png","type":"image"}]}'
				};
				
				var sig = FAPI.Client.calcSignature(this.viral_post_to_stream);
				FAPI.UI.showConfirmation("stream.publish", postText, sig);
			};
			
			this.API_callback = function(method, status, attributes)
			{
				if( ! FAPI){
					return;
				}

				if(method == 'showConfirmation' && status == 'ok') {
					this.viral_post_to_stream["resig"] = attributes;
					FAPI.UI.call(
						this.viral_post_to_stream,
						function(status2, data2, error2)
						{ 
							console.log(status2, data2, error2);
						},
						attributes
					);
				}
			};
			
			window.API_callback = function(method, status, attributes) 
			{
				window.cube.API_callback(method, status, attributes);
			};
			
			/***
			 * Congratulation winner
			 */
			this.win = function()
			{
				
				window.clearInterval(this.timer.handle);
				var time = this.timer.time;
				
				this.viral_post("Я собрал кубик рубик за " + time + " " + this.Num2Word(time, ["секунду","секунды","секунд"]));
				
				this.timer.started = false;
				
				// show frame
				$('#frame').show().fadeIn();
				$('#congratulation').show();
			};
			
			this.Num2Word = function(num, words)
			{
				num = num % 100;

				if (num>19) { 
					num = num % 10; 
				}

				switch(num){
					case 1: 
						return words[0];
					case 2: 
					case 3: 
					case 4:
						return words[1];
					default: 
						return words[2];
				}
			};
			
			/***
			 * Start game 
			 */
			this.start = function()
			{
				// hide start button
				$('#start').hide();
				
				// self instance
				var self = this;
				
				// set timer callback
				this.timer.callback = function(cube)
				{
					this.time++;
					cube.log("Время: " + this.time + " " + cube.Num2Word(this.time, ["секунда","секунды","секунд"]));
				};
				
				// get random rotation
				(function(){
					
					// 30 steps for rotate
					var steps = 30;
					
					// callback end rotation
					var callback = function()
					{
						// more one step
						steps--;
						
						// have more steps
						if(steps){
							this.random(callback);
						} else {
							// no more steps
							
							// game is started
							this.timer.started = true;
							
							// set handler a game timer
							this.timer.handle = window.setInterval(
								(function(self){
									return function()
									{
										self.timer.callback.call(self.timer, self);
									}
								})(self),
								1000
							);
							
							// hide frame
							$('#frame').fadeOut(500, function(){
								$(this).hide();
							});
				
							// create controls
							this.createControls();
							
							// bind mouse
							$(window)
								.on(
									'mousedown',
									function(event)
									{
										self.onMouseDown.call(self, event);
									}
								)
								.on(
									'mousemove',
									function(event)
									{
										self.onMouseMove.call(self, event);
									}
								)
								.on(
									'mouseup',
									function(event)
									{
										self.onMouseUp.call(self, event);
									}
								);
						}
					};
					
					// call random rotate
					this.random(callback);
					
				}).call(this);
				
			};
			
			/***
			 * On mouse move listener
			 */
			this.onMouseMove = function(event)
			{
				
				var vector = new THREE.Vector3(( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5);
				this.projector.unprojectVector(vector, this.camera);
				var raycaster = new THREE.Raycaster(this.camera.position, vector.sub( this.camera.position ).normalize());
				var intersects = raycaster.intersectObjects(this.intersectObjects);
				
				if(intersects.length){
					var arrow = intersects[0].object;
					arrow.material.opacity = 0.8;
					this.container.addClass('arrow-hover');
				} else {
					
					for(var i = 0; i < this.controllArrows.length; i++){
						// mouse out
						this.controllArrows[i].material.opacity = 0.1;
					}

					this.container.removeClass('arrow-hover');
				}
				
			};
			
			/***
			 * On mouse down listener
			 */
			this.onMouseDown = function(event)
			{
				
				if( ! this.container.hasClass('arrow-hover')){
					this.container.addClass('arrow-cross');
				}
				
				event.preventDefault();

				var vector = new THREE.Vector3(( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5);
				this.projector.unprojectVector(vector, this.camera);
				var raycaster = new THREE.Raycaster(this.camera.position, vector.sub( this.camera.position ).normalize());
				var intersects = raycaster.intersectObjects(this.intersectObjects);
				
				if(intersects.length){
					var arrow = intersects[0].object;
					this.moving(
						arrow.move.axis, 
						arrow.move.index, 
						arrow.move.way,
						this.checkMatrix
					);
				}
			};
			
			/***
			 * On mouse up listener
			 */
			this.onMouseUp = function(event)
			{
				this.container.removeClass('arrow-cross');
			};
			
			/***
			 * Animate function 
			 */ 
			this.animate = function()
			{
				window.requestAnimationFrame(window.animate);
				
				// if controls created
				if(this.controls != null){
					this.controls.update();
				}
				
				// if game is not started, rotate camera
				if(this.timer.started == false){
					
					var r = Date.now() * 0.0005;
	
					this.camera.position.x = 1200 * Math.cos(r);
					this.camera.position.z = 1200 * Math.sin(r);
					this.camera.lookAt(new THREE.Vector3(0,0,0));
				}
				
				// render
				this.render();
			};
			
			/***
			 * Call window.cube.animate method
			 */ 
			window.animate = function()
			{
				window.cube.animate.call(window.cube);
			};
			
			
			/***
			 * Render scene
			 */
			this.render = function()
			{
				if(this.renderer && this.scene && this.camera){
					this.renderer.render(this.scene, this.camera);
				}
			};
			
			/***
			 * Create camera
			 */
			this.createCamera = function()
			{
				this.camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 1, 10000);
				this.camera.position.z = 1200;
				this.camera.position.x = 400;
				this.camera.position.y = 500;
				
				this.camera.lookAt(new THREE.Vector3(0,0,0));
			};
			
			this.createControls = function()
			{
				this.controls = new THREE.OrbitControls(this.camera);
				this.controls.addEventListener('change', this.render);
			};
			
			/***
			 * Create scene
			 */
			this.createScene = function()
			{
				this.projector = new THREE.Projector();
				this.scene = new THREE.Scene();
				//this.scene.fog = new THREE.Fog( 0xCCCCCC, 1000, 3000 );
				
				var ambient = new THREE.AmbientLight(0xFFFFFF);
				this.scene.add(ambient);
				
				this.light = new THREE.SpotLight(0xffffff);
				this.light.position.set(0,500,0);

				this.light.castShadow = true;
				
				this.scene.add(this.light);
				
				
				var geometry = new THREE.PlaneGeometry(1000, 1000);
				var planeMaterial = new THREE.MeshPhongMaterial({color: 0xFFFFFF});
				planeMaterial.ambient = planeMaterial.color;

				var ground = new THREE.Mesh(geometry, planeMaterial);

				ground.position.set( 0, -300, 0 );
				ground.rotation.x = - Math.PI / 2;

				ground.castShadow = true;
				ground.receiveShadow = true;
				
				this.scene.add(ground);
			};
			
			/***
			 * Create renderer
			 */
			this.createRender = function()
			{
				this.renderer = new THREE.WebGLRenderer({antialias: false, alpha: false});
				this.renderer.setSize(window.innerWidth, window.innerHeight);
				this.renderer.setClearColor(0x000000);
				this.container.append(this.renderer.domElement);
				
				this.renderer.shadowMapEnabled = true;
				this.renderer.shadowMapSoft = true;
				
				this.renderer.shadowCameraNear = 3;
				this.renderer.shadowCameraFar = this.camera.far;
				this.renderer.shadowCameraFov = 50;
				
				this.renderer.shadowMapBias = 0.0039;
				this.renderer.shadowMapDarkness = 0.5;
				this.renderer.shadowMapWidth = 1024;
				this.renderer.shadowMapHeight = 1024;
				//this.renderer.gammaInput = true;
				//this.renderer.gammaOutput = true;
				//this.renderer.physicallyBasedShading = true;
			};
			
			/***
			 * Rotate random part of cube
			 */
			this.random = function(callback)
			{
				var axises = {
					0 : 'x',
					1 : 'y',
					2 : 'z'
				};
				
				var index = (Math.floor(Math.random()*2));
				var axis  = (Math.floor(Math.random()*2));
				var way   = (Math.floor(Math.random()*100) > 50 ? 1 : -1);
				
				this.moving(axises[axis], index, way, callback);
			};
			
			/***
			 * Moving part of cube
			 * @param axis (z,y,z)
			 * @param index (0,1,2)
			 * @param way (1,-1)
			 * @param callback end of rotation callback
			 */
			this.moving = function(axis, index, way, callback)
			{
				if(this._moving != null){
					// call letter, now in process
					return;
				}
				
				// if no callback
				if( ! $.isFunction(callback)){
					callback = function(){};
				}
				
				// fill move object
				this.move.axis     = axis;
				this.move.index    = index;
				this.move.way      = way;
				this.move.scale    = 90;
				this.move.callback = callback;
				
				// find cubes for rotate
				(function(){
					
					for(var x = 0; x < 3; x++){
						for(var y = 0; y < 3; y++){
							for(var z = 0; z < 3; z++){
								// cube object from matrix
								var cube  = this.matrix[x][y][z];
								// value of position on axis
								var val   = cube.position[axis];
								// index position
								var pos   = null;
								
								if(val < -100){ // 0 index
									pos = 0;
								} else if(val > 100){ // 1 index
									pos = 2;
								} else { // 2 index
									pos = 1;
								}
								
								// current pos is what need to rotate
								if(pos == index){
									// attach to active group for rotate all
									THREE.SceneUtils.attach(cube, this.scene, this.active);
								}
								
							}
						}
						
					}
					
					var self = this;
					
					// callback function to animate rotation
					this._moving = function()
					{
						// scale
						self.move.scale -= 10;
						
						// need more rotate
						if(self.move.scale >= 0){
							// rotate
							self.active.rotation[self.move.axis] += (10*Math.PI/180) * self.move.way;
							// continue
							window.setTimeout(self._moving, 10);
						} else {
							// end of rotation
							self.active.updateMatrixWorld();
							
							// find childrens in active group
							do {
								// no more childrens
								if(typeof(self.active.children[0]) == 'undefined'){
									break;
								}
								
								// finded children
								var cube = self.active.children[0];
								// update position
								cube.updateMatrixWorld();
								// detach to scene
								THREE.SceneUtils.detach(cube, self.active, self.scene);
							}while(true);
							
							// call callback function after end rotation
							window.setTimeout(
								(function(callback){
									return function()
									{
										callback.call(self);
									}
								})(self.move.callback),
								100
							);
							
							// clear vars
							self._moving           = null;
							self.move.axis         = null;
							self.move.index        = null;
							self.move.scale        = null;
							self.move.callback     = null;
							// restore rotation
							self.active.rotation.set(0,0,0);
							
						}
					};
					
				}).call(this);
				
				// start rotation
				window.setTimeout(this._moving, 10);
				
			};
			
			/***
			 * Check cube colors
			 */
			this.checkMatrix = function()
			{
				var sides = {
					'right'  : [],
					'left'   : [],
					'top'    : [],
					'bottom' : [],
					'front'  : [],
					'rear'   : []
				};
				
				camera = new THREE.Camera();
				
				for(var x = 0; x < 3; x++){
					for(var y = 0; y < 3; y++){
						for(var z = 0; z < 3; z++){
							// cube object from matrix
							var cube  = this.matrix[x][y][z];
							var _x = cube.position.x,
								_y = cube.position.y,
								_z = cube.position.z;
							
							/*
							 0  - right
							 2  - left
							 4  - top
							 6  - bottom
							 8  - front
							 10 - rear
							 
							 this.projector.unprojectVector(vector, this.camera);
							 var raycaster = new THREE.Raycaster(this.camera.position, vector.sub( this.camera.position ).normalize());
							 var intersects = raycaster.intersectObjects(this.intersectObjects); 
							 */
							
							if(_x < -100){
								var projector = new THREE.Projector();
								var vector    = new THREE.Vector3(_x,_y,_z);
								
								camera.position.set(-500,_y,_z);
								camera.lookAt(vector);
								
								projector.unprojectVector(vector, camera);
								var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
								var intersects = raycaster.intersectObjects(this.intersectCubes);
								
								if(intersects.length){
									var obj = intersects[0];
									sides.right.push(obj.face.color.getHex());
								}
							} else if(_x > 100){
								var projector = new THREE.Projector();
								var vector    = new THREE.Vector3(_x,_y,_z);
								
								camera.position.set(500,_y,_z);
								camera.lookAt(vector);
								
								projector.unprojectVector(vector, camera);
								var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
								var intersects = raycaster.intersectObjects(this.intersectCubes);
								
								if(intersects.length){
									var obj = intersects[0];
									sides.left.push(obj.face.color.getHex());
								}
							}
							
							if(_y < -100){
								var projector = new THREE.Projector();
								var vector    = new THREE.Vector3(_x,_y,_z);
								
								camera.position.set(_x,-500,_z);
								camera.lookAt(vector);
								
								projector.unprojectVector(vector, camera);
								var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
								var intersects = raycaster.intersectObjects(this.intersectCubes);
								
								if(intersects.length){
									var obj = intersects[0];
									sides.bottom.push(obj.face.color.getHex());
								}
							} else if(_y > 100){
								var projector = new THREE.Projector();
								var vector    = new THREE.Vector3(_x,_y,_z);
								
								camera.position.set(_x,500,_z);
								camera.lookAt(vector);
								
								projector.unprojectVector(vector, camera);
								var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
								var intersects = raycaster.intersectObjects(this.intersectCubes);
								
								if(intersects.length){
									var obj = intersects[0];
									sides.top.push(obj.face.color.getHex());
								}
							}
							
							if(_z < -100){
								var projector = new THREE.Projector();
								var vector    = new THREE.Vector3(_x,_y,_z);
								
								camera.position.set(_x,_y,-500);
								camera.lookAt(vector);
								
								projector.unprojectVector(vector, camera);
								var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
								var intersects = raycaster.intersectObjects(this.intersectCubes);
								
								if(intersects.length){
									var obj = intersects[0];
									sides.rear.push(obj.face.color.getHex());
								}
							} else if(_z > 100){
								var projector = new THREE.Projector();
								var vector    = new THREE.Vector3(_x,_y,_z);
								
								camera.position.set(_x,_y,500);
								camera.lookAt(vector);
								
								projector.unprojectVector(vector, camera);
								var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
								var intersects = raycaster.intersectObjects(this.intersectCubes);
								
								if(intersects.length){
									var obj = intersects[0];
									sides.front.push(obj.face.color.getHex());
								}
							}
						}
					}
					
				}
				
				camera = null;
				
				var colors = sides.right.unique().length +
							 sides.left.unique().length +
							 sides.top.unique().length +
							 sides.bottom.unique().length +
							 sides.front.unique().length +
							 sides.rear.unique().length;
				
				if(colors > 6){
					return;
				}
				
				this.win();
			};
			
			/***
			 * Create matrix of cubes
			 */
			this.createMatrix = function()
			{
				var self    = this;
				
				for(var x = 0; x < 3; x++){
					for(var y = 0; y < 3; y++){
						for(var z = 0; z < 3; z++){
							
							// create matrix of cubes
							if(typeof(this.matrix[x]) == 'undefined') this.matrix[x] = [];
							if(typeof(this.matrix[x][y]) == 'undefined') this.matrix[x][y] = [];
							this.matrix[x][y][z] = null;
							
							var geometry = new THREE.CubeGeometry(100, 100, 100);
							geometry.faces[0].color.setHex(this.colors.right);
							geometry.faces[1].color.setHex(this.colors.right);
							
							geometry.faces[2].color.setHex(this.colors.left);
							geometry.faces[3].color.setHex(this.colors.left);
							
							geometry.faces[4].color.setHex(this.colors.top);
							geometry.faces[5].color.setHex(this.colors.top);
							
							geometry.faces[6].color.setHex(this.colors.bottom);
							geometry.faces[7].color.setHex(this.colors.bottom);
							
							geometry.faces[8].color.setHex(this.colors.front);
							geometry.faces[9].color.setHex(this.colors.front);
							
							geometry.faces[10].color.setHex(this.colors.rear);
							geometry.faces[11].color.setHex(this.colors.rear);
							
							var material = new THREE.MeshLambertMaterial({vertexColors: THREE.FaceColors} );
			
							var cube = new THREE.Mesh(geometry, material);
							cube.position.x = ((x-1) * 110);
							cube.position.y = ((y-1) * 110);
							cube.position.z = ((z-1) * 110);
							
							cube.castShadow = true;
							cube.receiveShadow = true;
							cube.matrixAutoUpdate = false;
							cube.updateMatrix();
							
							this.scene.add(cube);
							this.intersectCubes.push(cube);
							
							this.matrix[x][y][z] = cube;
							
						}
					}
				}
				
			};
			
			/***
			 * Conver grad to rad
			 */
			this.rad = function(a)
			{
				return (a*Math.PI/180);
			};
			
			/***
			 * Create arrows for rotate parts of cube
			 */
			this.createArrows = function()
			{
				// positions, rotation and move params
				var arrows = [
					
					{p:{ x:-110, y:140,  z:161   },r:{ x:this.rad(0), y:this.rad(0), z:this.rad(90)}, move:{axis:'x',index:0,way:-1}},
					{p:{ x:0,    y:140,  z:161   },r:{ x:this.rad(0), y:this.rad(0), z:this.rad(90)}, move:{axis:'x',index:1,way:-1}},
					{p:{ x:110,  y:140,  z:161   },r:{ x:this.rad(0), y:this.rad(0), z:this.rad(90)}, move:{axis:'x',index:2,way:-1}},
					
					{p:{ x:-140, y:110,  z:161   },r:{ x:this.rad(0), y:this.rad(0), z:this.rad(180)}, move:{axis:'y',index:2,way:-1}},
					{p:{ x:-140, y:0,    z:161   },r:{ x:this.rad(0), y:this.rad(0), z:this.rad(180)}, move:{axis:'y',index:1,way:-1}},
					{p:{ x:-140, y:-110, z:161   },r:{ x:this.rad(0), y:this.rad(0), z:this.rad(180)}, move:{axis:'y',index:0,way:-1}},
					
					{p:{ x:-110, y:-140, z:161   },r:{ x:this.rad(0), y:this.rad(0), z:this.rad(-90)}, move:{axis:'x',index:0,way:1}},
					{p:{ x:0,    y:-140, z:161   },r:{ x:this.rad(0), y:this.rad(0), z:this.rad(-90)}, move:{axis:'x',index:1,way:1}},
					{p:{ x:110,  y:-140, z:161   },r:{ x:this.rad(0), y:this.rad(0), z:this.rad(-90)}, move:{axis:'x',index:2,way:1}},
					
					{p:{ x:140,  y:110,  z:161   },r:{ x:this.rad(0), y:this.rad(0), z:this.rad(0)}, move:{axis:'y',index:2,way:1}},
					{p:{ x:140,  y:0,    z:161   },r:{ x:this.rad(0), y:this.rad(0), z:this.rad(0)}, move:{axis:'y',index:1,way:1}},
					{p:{ x:140,  y:-110, z:161   },r:{ x:this.rad(0), y:this.rad(0), z:this.rad(0)}, move:{axis:'y',index:0,way:1}},
					
					// -------------------------------
					
					{p:{ x:161,  y:140,  z:-110  },r:{ x:this.rad(90), y:this.rad(90), z:this.rad(0)}, move:{axis:'z',index:0,way:1}},
					{p:{ x:161,  y:140,  z:0     },r:{ x:this.rad(90), y:this.rad(90), z:this.rad(0)}, move:{axis:'z',index:1,way:1}},
					{p:{ x:161,  y:140,  z:110   },r:{ x:this.rad(90), y:this.rad(90), z:this.rad(0)}, move:{axis:'z',index:2,way:1}},
					
					{p:{ x:161,  y:-140,  z:-110  },r:{ x:this.rad(-90), y:this.rad(90), z:this.rad(0)}, move:{axis:'z',index:0,way:-1}},
					{p:{ x:161,  y:-140,  z:0     },r:{ x:this.rad(-90), y:this.rad(90), z:this.rad(0)}, move:{axis:'z',index:1,way:-1}},
					{p:{ x:161,  y:-140,  z:110   },r:{ x:this.rad(-90), y:this.rad(90), z:this.rad(0)}, move:{axis:'z',index:2,way:-1}},
					
					{p:{ x:161,  y:-110,  z:140   },r:{ x:this.rad(180), y:this.rad(90), z:this.rad(0)}, move:{axis:'y',index:0,way:-1}},
					{p:{ x:161,  y:0,     z:140   },r:{ x:this.rad(180), y:this.rad(90), z:this.rad(0)}, move:{axis:'y',index:1,way:-1}},
					{p:{ x:161,  y:110,   z:140   },r:{ x:this.rad(180), y:this.rad(90), z:this.rad(0)}, move:{axis:'y',index:2,way:-1}},
					
					{p:{ x:161,  y:-110,  z:-140   },r:{ x:this.rad(0), y:this.rad(90), z:this.rad(0)}, move:{axis:'y',index:0,way:1}},
					{p:{ x:161,  y:0,     z:-140   },r:{ x:this.rad(0), y:this.rad(90), z:this.rad(0)}, move:{axis:'y',index:1,way:1}},
					{p:{ x:161,  y:110,   z:-140   },r:{ x:this.rad(0), y:this.rad(90), z:this.rad(0)}, move:{axis:'y',index:2,way:1}},
					
					// -------------------------------
					
					{p:{ x:-161,  y:140,  z:-110  },r:{ x:this.rad(90), y:this.rad(90), z:this.rad(0)}, move:{axis:'z',index:0,way:-1}},
					{p:{ x:-161,  y:140,  z:0     },r:{ x:this.rad(90), y:this.rad(90), z:this.rad(0)}, move:{axis:'z',index:1,way:-1}},
					{p:{ x:-161,  y:140,  z:110   },r:{ x:this.rad(90), y:this.rad(90), z:this.rad(0)}, move:{axis:'z',index:2,way:-1}},
					
					{p:{ x:-161,  y:-140,  z:-110  },r:{ x:this.rad(-90), y:this.rad(90), z:this.rad(0)}, move:{axis:'z',index:0,way:1}},
					{p:{ x:-161,  y:-140,  z:0     },r:{ x:this.rad(-90), y:this.rad(90), z:this.rad(0)}, move:{axis:'z',index:1,way:1}},
					{p:{ x:-161,  y:-140,  z:110   },r:{ x:this.rad(-90), y:this.rad(90), z:this.rad(0)}, move:{axis:'z',index:2,way:1}},
					
					{p:{ x:-161,  y:-110,  z:140   },r:{ x:this.rad(180), y:this.rad(90), z:this.rad(0)}, move:{axis:'y',index:0,way:1}},
					{p:{ x:-161,  y:0,     z:140   },r:{ x:this.rad(180), y:this.rad(90), z:this.rad(0)}, move:{axis:'y',index:1,way:1}},
					{p:{ x:-161,  y:110,   z:140   },r:{ x:this.rad(180), y:this.rad(90), z:this.rad(0)}, move:{axis:'y',index:2,way:1}},
					
					{p:{ x:-161,  y:-110,  z:-140   },r:{ x:this.rad(0), y:this.rad(90), z:this.rad(0)}, move:{axis:'y',index:0,way:-1}},
					{p:{ x:-161,  y:0,     z:-140   },r:{ x:this.rad(0), y:this.rad(90), z:this.rad(0)}, move:{axis:'y',index:1,way:-1}},
					{p:{ x:-161,  y:110,   z:-140   },r:{ x:this.rad(0), y:this.rad(90), z:this.rad(0)}, move:{axis:'y',index:2,way:-1}},
					
					// -------------------------------
					
					{p:{ x:-110, y:140,  z:-161  },r:{ x:this.rad(0), y:this.rad(0), z:this.rad(90)}, move:{axis:'x',index:0,way:1}},
					{p:{ x:0,    y:140,  z:-161  },r:{ x:this.rad(0), y:this.rad(0), z:this.rad(90)}, move:{axis:'x',index:1,way:1}},
					{p:{ x:110,  y:140,  z:-161  },r:{ x:this.rad(0), y:this.rad(0), z:this.rad(90)}, move:{axis:'x',index:2,way:1}},
					
					{p:{ x:-110, y:-140,  z:-161  },r:{ x:this.rad(0), y:this.rad(0), z:this.rad(-90)}, move:{axis:'x',index:0,way:-1}},
					{p:{ x:0,    y:-140,  z:-161  },r:{ x:this.rad(0), y:this.rad(0), z:this.rad(-90)}, move:{axis:'x',index:1,way:-1}},
					{p:{ x:110,  y:-140,  z:-161  },r:{ x:this.rad(0), y:this.rad(0), z:this.rad(-90)}, move:{axis:'x',index:2,way:-1}},
					
					{p:{ x:-140, y:-110,  z:-161  },r:{ x:this.rad(0), y:this.rad(0), z:this.rad(180)}, move:{axis:'y',index:0,way:1}},
					{p:{ x:-140, y:0,     z:-161  },r:{ x:this.rad(0), y:this.rad(0), z:this.rad(180)}, move:{axis:'y',index:1,way:1}},
					{p:{ x:-140, y:110,   z:-161  },r:{ x:this.rad(0), y:this.rad(0), z:this.rad(180)}, move:{axis:'y',index:2,way:1}},
					
					{p:{ x:140,  y:-110,  z:-161  },r:{ x:this.rad(0), y:this.rad(0), z:this.rad(0)}, move:{axis:'y',index:0,way:-1}},
					{p:{ x:140,  y:0,     z:-161  },r:{ x:this.rad(0), y:this.rad(0), z:this.rad(0)}, move:{axis:'y',index:1,way:-1}},
					{p:{ x:140,  y:110,   z:-161  },r:{ x:this.rad(0), y:this.rad(0), z:this.rad(0)}, move:{axis:'y',index:2,way:-1}},
					
					// -------------------------------
					
					{p:{ x:-110, y:161,  z:140   },r:{ x:this.rad(90), y:this.rad(0), z:this.rad(90)}, move:{axis:'x',index:0,way:1}},
					{p:{ x:0,    y:161,  z:140   },r:{ x:this.rad(90), y:this.rad(0), z:this.rad(90)}, move:{axis:'x',index:1,way:1}},
					{p:{ x:110,  y:161,  z:140   },r:{ x:this.rad(90), y:this.rad(0), z:this.rad(90)}, move:{axis:'x',index:2,way:1}},
					
					{p:{ x:-110, y:161,  z:-140  },r:{ x:this.rad(90), y:this.rad(0), z:this.rad(-90)}, move:{axis:'x',index:0,way:-1}},
					{p:{ x:0,    y:161,  z:-140  },r:{ x:this.rad(90), y:this.rad(0), z:this.rad(-90)}, move:{axis:'x',index:1,way:-1}},
					{p:{ x:110,  y:161,  z:-140  },r:{ x:this.rad(90), y:this.rad(0), z:this.rad(-90)}, move:{axis:'x',index:2,way:-1}},
					
					{p:{ x:140,  y:161,  z:-110  },r:{ x:this.rad(90), y:this.rad(0), z:this.rad(0)}, move:{axis:'z',index:0,way:-1}},
					{p:{ x:140,  y:161,  z:0     },r:{ x:this.rad(90), y:this.rad(0), z:this.rad(0)}, move:{axis:'z',index:1,way:-1}},
					{p:{ x:140,  y:161,  z:110   },r:{ x:this.rad(90), y:this.rad(0), z:this.rad(0)}, move:{axis:'z',index:2,way:-1}},
					
					{p:{ x:-140,  y:161,  z:-110  },r:{ x:this.rad(90), y:this.rad(0), z:this.rad(180)}, move:{axis:'z',index:0,way:1}},
					{p:{ x:-140,  y:161,  z:0     },r:{ x:this.rad(90), y:this.rad(0), z:this.rad(180)}, move:{axis:'z',index:1,way:1}},
					{p:{ x:-140,  y:161,  z:110   },r:{ x:this.rad(90), y:this.rad(0), z:this.rad(180)}, move:{axis:'z',index:2,way:1}},
					
					// -------------------------------
					
					{p:{ x:-110, y:-161,  z:140   },r:{ x:this.rad(90), y:this.rad(0), z:this.rad(90)}, move:{axis:'x',index:0,way:-1}},
					{p:{ x:0,    y:-161,  z:140   },r:{ x:this.rad(90), y:this.rad(0), z:this.rad(90)}, move:{axis:'x',index:1,way:-1}},
					{p:{ x:110,  y:-161,  z:140   },r:{ x:this.rad(90), y:this.rad(0), z:this.rad(90)}, move:{axis:'x',index:2,way:-1}},
					
					{p:{ x:-110, y:-161,  z:-140  },r:{ x:this.rad(90), y:this.rad(0), z:this.rad(-90)}, move:{axis:'x',index:0,way:1}},
					{p:{ x:0,    y:-161,  z:-140  },r:{ x:this.rad(90), y:this.rad(0), z:this.rad(-90)}, move:{axis:'x',index:1,way:1}},
					{p:{ x:110,  y:-161,  z:-140  },r:{ x:this.rad(90), y:this.rad(0), z:this.rad(-90)}, move:{axis:'x',index:2,way:1}},
					
					{p:{ x:140,  y:-161,  z:-110  },r:{ x:this.rad(90), y:this.rad(0), z:this.rad(0)}, move:{axis:'z',index:0,way:1}},
					{p:{ x:140,  y:-161,  z:0     },r:{ x:this.rad(90), y:this.rad(0), z:this.rad(0)}, move:{axis:'z',index:1,way:1}},
					{p:{ x:140,  y:-161,  z:110   },r:{ x:this.rad(90), y:this.rad(0), z:this.rad(0)}, move:{axis:'z',index:2,way:1}},
					
					{p:{ x:-140,  y:-161,  z:-110  },r:{ x:this.rad(90), y:this.rad(0), z:this.rad(180)}, move:{axis:'z',index:0,way:-1}},
					{p:{ x:-140,  y:-161,  z:0     },r:{ x:this.rad(90), y:this.rad(0), z:this.rad(180)}, move:{axis:'z',index:1,way:-1}},
					{p:{ x:-140,  y:-161,  z:110   },r:{ x:this.rad(90), y:this.rad(0), z:this.rad(180)}, move:{axis:'z',index:2,way:-1}},
				];
				
				// triangle points
				var points = [
					new THREE.Vector3(0,20,0),
					new THREE.Vector3(20,0,0),
					new THREE.Vector3(0,-20,0)
				];
				
				// new shape
  					var shape = new THREE.Shape(points);
				var options = {
					amount           : 1, 
					bevelEnabled     : true, 
					bevelSegments    : 1, 
					steps            : 1, 
					bevelThickness   : 0, 
					material         : 0, 
					extrudeMaterial  : 1
				};
				
				// geometry and material
				var geometry = new THREE.ExtrudeGeometry(shape, options);
				var material = new THREE.MeshBasicMaterial({vertexColors: THREE.FaceColors, transparent:true, opacity:0.1});
				
				for(var i = 0; i < arrows.length; i++){
					
					// current params
					var attr = arrows[i];
					
					// white arrow
					for(var x = 0; x < geometry.faces.length; x++){
						geometry.faces[x].color.setHex(0xFFFFFF);
					}
					
					// arrow mesh
					var arrow = new THREE.Mesh(geometry.clone(),material.clone());
					
					// set position and rotation arrow
					arrow.position.set(attr.p.x, attr.p.y, attr.p.z);
					arrow.rotation.set(attr.r.x, attr.r.y, attr.r.z);
					
					// move params
					arrow.move = attr.move;
					
					// for listen click
					this.intersectObjects.push(arrow);
					
					// add on scene
					this.scene.add(arrow);
					
					// for mouseout listener
					this.controllArrows.push(arrow);
				}
				
			};
			
			/***
			 * calback on resize window
			 */
			this.resize = function(event)
			{
				this.windowHalfX = window.innerWidth / 2;
				this.windowHalfY = window.innerHeight / 2;

				this.camera.aspect = window.innerWidth / window.innerHeight;
				this.camera.updateProjectionMatrix();

				this.renderer.setSize(window.innerWidth, window.innerHeight);
				
			};
			
			/***
			 * Debug message
			 */
			this.log = function(text)
			{
				$('#log').html(text);
			};
			
			/***
			 * Start game
			 */
			this.init();
			this.animate();
			
			if(FAPI){
				var FAPI_Params = Object(FAPI.Util.getRequestParameters());
			
				FAPI.init(
					FAPI_Params['api_server'], 
					FAPI_Params['apiconnection'], 
					function()
					{
						//FAPI.UI.setWindowSize(717, 1400);  [b]// Пример вызова метода расширить размеры окна как только произойдет инициализация API[/b]
						//FAPI.UI.initialize();
					}, 
					function()
					{
						
					}
				);
			}
			
		}).call(window.cube);
	});
})(jQuery);