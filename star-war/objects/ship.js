function Ship()
{
	this.object = null;
	this.input = {
		power: null,
		direction: null,
		steering: 0,
		speed: 0
	};
	
	this.v0 = new THREE.Vector3();
	this.v1 = new THREE.Vector3();
};


Ship.prototype.load = function(callback)
{
	var self = this;
	loader = new THREE.JSONLoader();
	loader.load( "/star-war/objects/three.js/ship.js?v=1.0.5", function(geometry, materials){
		var material = new THREE.MeshFaceMaterial(materials);
		self.object = new Physijs.BoxMesh(geometry, material, 0);
		self.object.position.set(500,0,5000);
		self.object.lookAt(new THREE.Vector3(-500,0,500));
		callback.call();
	});
};


Ship.prototype.addToScene = function(scene)
{
	scene.add(this.object);
};

Ship.prototype.update = function()
{
	if(this.object){
		//velocity
		if(this.input.power === true){
			this.input.speed = (this.input.speed >= 5 ? 5 : this.input.speed+0.005);
		} else {
			this.input.speed = (this.input.speed < 0.05 ? 0 : this.input.speed-0.001);
		}
		
		var vec1 = new THREE.Vector3(0,0,this.input.speed);
		var move = vec1.applyMatrix4(this.object.matrixWorld);
		
		this.object.rotation.y += (this.input.direction == null ? 0 : this.input.direction);
		this.object.position = move;
		this.object.__dirtyPosition = true;
		this.object.__dirtyRotation = true;
		
		window.starwar.log("speed: " + this.input.speed);
		
	}
};

Ship.prototype.folowCamera = function(camera)
{
	if(this.object){
		var vec  = new THREE.Vector3(0,5,-40);
		var move = vec.applyMatrix4(this.object.matrixWorld);
		camera.position = move;
		camera.lookAt(this.object.position);
	}
};

Ship.prototype.onKeyDown = function(event)
{
	
	switch(event.keyCode){
		case 37: // left
			this.input.direction = -0.005;
		break;

		case 38: // forward
			this.input.power = true;
		break;

		case 39: // right
			this.input.direction = 0.005;
		break;

		case 40: // back
			this.input.power = false;
		break;
	}
};

Ship.prototype.onKeyUp = function(event)
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