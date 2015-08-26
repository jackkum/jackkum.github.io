


function Bike()
{
	this.object = new THREE.Object3D();
	this.object._physijs = true;
	
	this.wheels = {
		vehicle : null,
		back : {
			geometry: null,
			material : null
		},
		front : {
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
	
	this.speed.interval = window.setInterval(
		(function(self){
			return function()
			{
				
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
	
};

Bike.prototype =
{
	constructor   : Bike,
	object        : null,
	onKeyDown     : function(event)
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
	},
	onKeyUp     : function(event)
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
	},
	update        : function()
	{
		if(this.wheels.vehicle){
			if(this.input.direction !== null){
				this.input.steering += this.input.direction / 100;
				if(this.input.steering < -.6 ) this.input.steering = -.6;
				if(this.input.steering > .6 ) this.input.steering = .6;
			} else {
				if(this.input.steering !== 0){
					this.input.steering = this.input.steering - (this.input.steering < 0 ? -.01 : .01);
				}
			}
			
			window.road.log("str: " + this.input.steering);
			
			this.wheels.vehicle.setSteering(this.input.steering, 0);
			//this.wheels.vehicle.setSteering(this.input.steering, 1);

			if(this.input.power === true){
				this.wheels.vehicle.applyEngineForce(10000,1);
			} else if(this.input.power === false){
				//this.wheels.vehicle.setBrake(20, 1);
				this.wheels.vehicle.setBrake(200, 0);
			} else {
				this.wheels.vehicle.applyEngineForce(0);
				this.wheels.vehicle.setBrake(0, 0);
			}
		}
	},
	folowCamera   : function(camera)
	{
		if(this.wheels.vehicle){
			var relativeCameraOffset = new THREE.Vector3(0,0,-70);
			var cameraOffset = relativeCameraOffset.applyMatrix4(this.object.matrixWorld);
			
			camera.position.x = cameraOffset.x;
			camera.position.z = cameraOffset.z;
			camera.lookAt(this.object.position);
		}
	},
	addToScene    : function (scene)
	{
		scene.add(this.object);
		
		if(this.wheels.back){
			scene.add(this.wheels.back);
		}
		
		if(this.wheels.front){
			scene.add(this.wheels.front);
		}
		
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
	},
	onAddScene   : function(scene)
	{
		
	}
};