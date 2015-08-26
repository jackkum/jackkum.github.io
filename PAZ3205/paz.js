function PAZ3205()
{
	this.object = new THREE.Object3D();
	this.object._physijs = true;
	
	this.wheels = {
		vehicle : null,
		leftback : {
			geometry: null,
			material : null
		},
		righttback : {
			geometry: null,
			material : null
		},
		leftfront : {
			geometry: null,
			material : null
		},
		rightfront : {
			geometry: null,
			material : null
		}
	};
	
	this.input = {
		power: null,
		direction: null,
		steering: 0
	};
	
	this.speed = {
		lastVector : null,
		newVector: null,
		value : 0,
		interval : null
	};
	
	this.collada = function(callback)
	{
	    var loader = new THREE.ColladaLoader();
	    
	    loader.options.convertUpAxis = true;
	    loader.load("/star-war/objects/three.js/alien/planet.dae?v=1.0.1", function(collada){
	    	
			this.object = collada.scene;
			console.log(this.object);
			this.object._physijs = null;
	        this.object.updateMatrix();
	        callback.call(self);
	    });
	};
	
	this.load = function(callback)
	{
		//this.collada(callback);
		//return;
		
		var self = this;
		loader = new THREE.JSONLoader();
		//loader.load( "/PAZ3205/objects/paz3205.js", function(geometry, materials){
		loader.load( "/star-war/objects/three.js/alien/planet.js?v=1.0.9", function(geometry, materials){
			//materials[0].shading = THREE.SmoothShading;
			//materials[0].morphTargets = true;
		    //var material = new THREE.MeshFaceMaterial(materials);
		    var material = new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('/star-war/objects/three.js/alien/planet_Bog1200.png')});
		    self.object = new Physijs.BoxMesh(geometry, material, 0);
			//self.object.position.set(0,0,0);
			
			//self.object.updateMatrix();
			//self.object.overdraw = true;
			/*
			loader.load( "/road-rush/objects/bikes/DUC916/back-wheel.js", function(geometry, materials){
		    	var material = Physijs.createMaterial(new THREE.MeshFaceMaterial(materials), 1, 0.5);
				
				self.wheels.back.geometry = geometry;
				self.wheels.back.material = material;
				
				loader.load( "/road-rush/objects/bikes/DUC916/front-wheel.js", function(geometry, materials){
			    	var material = Physijs.createMaterial(new THREE.MeshFaceMaterial(materials), 1, 0.5);
					
					self.wheels.front.geometry = geometry;
					self.wheels.front.material = material;
					
					// done
					if($.isFunction(callback)){
						callback.call(self);
					}
				});
				
			});
			*/
			
			callback.call(self);
		});
	};
	/*
	this.speed.interval = window.setInterval(
		(function(self){
			return function()
			{
				
				if( ! self.object ) return;
				
				// remember last position
				if(self.speed.lastVector == null){
					self.speed.lastVector = self.object.position.clone();
					return;
				}
				
				// update position
				self.object.updateMatrixWorld();
				
				// current posision
				self.speed.newVector  = self.object.position.clone();
				
				// distance 
				self.speed.value      = self.speed.lastVector.distanceTo(self.speed.newVector);
				
				// changle last vector
				self.speed.lastVector = self.speed.newVector.clone();
			};
		})(this),
		1000
	);
	*/
	this.onKeyDown = function(event)
	{
		switch(event.keyCode){
			case 37: // left
				this.input.direction = 1;
			break;

			case 38: // forward
				this.input.power = true;
			break;

			case 39: // right
				this.input.direction = -1;
			break;

			case 40: // back
				this.input.power = false;
			break;
		}
	};
	
	
	this.onKeyUp = function(event)
	{
		switch(event.keyCode){
			case 37: // left
				this.input.direction = null;
			break;

			case 38: // forward
				this.input.power = null;
			break;

			case 39: // right
				this.input.direction = null;
			break;

			case 40: // back
				this.input.power = null;
			break;
		}
	};
	
	
	this.update = function()
	{
		/*
		if(this.wheels.vehicle){
			if(this.input.direction !== null){
				this.input.steering += this.input.direction / 50;
				if(this.input.steering < -.6 ) this.input.steering = -.6;
				if(this.input.steering > .6 ) this.input.steering = .6;
			}
			
			this.wheels.vehicle.setSteering(this.input.steering, 0);
			this.wheels.vehicle.setSteering(this.input.steering, 1);

			if(this.input.power === true){
				this.wheels.vehicle.applyEngineForce(10000,1);
			} else if(this.input.power === false){
				this.wheels.vehicle.setBrake(200, 0);
				this.wheels.vehicle.setBrake(200, 1);
			} else {
				this.wheels.vehicle.applyEngineForce(0);
				this.wheels.vehicle.setBrake(0, 0);
				this.wheels.vehicle.setBrake(0, 1);
			}
		}*/
	};
	
	
	this.folowCamera = function(camera)
	{
		/*
		if(this.wheels.vehicle){
			var relativeCameraOffset = new THREE.Vector3(0,0,-35);
			var cameraOffset = relativeCameraOffset.applyMatrix4(this.object.matrixWorld);
			
			camera.position.x = cameraOffset.x;
			camera.position.z = cameraOffset.z;
			camera.lookAt(this.object.position);
		}
		*/
	};
	
	
	this.addToScene = function (scene)
	{
		scene.add(this.object);
		/*
		if(this.wheels.vehicle){
			scene.add(this.wheels.leftback);
			scene.add(this.wheels.rightback);
			scene.add(this.wheels.leftfront);
			scene.add(this.wheels.rightfront);
		} 
		*/
		
		var self = this;
		
		document.addEventListener(
			'keydown',
			(function(){
				var self = this;
				return function(event)
				{
					self.onKeyDown(event);
				};
			}).call(this)
		);
		document.addEventListener(
			'keyup', 
			(function(){
				var self = this;
				return function(event)
				{
					self.onKeyUp(event);
				};
			}).call(this)
		);
		
		this.onAddScene.call(this, scene);
	};
	
	this.onAddScene = function(scene)
	{
		
	};
};


