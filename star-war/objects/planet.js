function Planet(name, texture, version, position)
{
	this.object   = null;
	this.name     = name;
	this.texture  = typeof(texture)  == 'undefined' ? 'texture.jpg' : texture;
	this.version  = typeof(version)  == 'undefined' ? '1.0.1'       : version;
	this.position = typeof(position) == 'undefined' ? {x:0,y:0,z:0} : position;
};


Planet.prototype.load = function(callback)
{
	
	var self = this;
	loader = new THREE.JSONLoader();
	var url = "/star-war/objects/three.js/" + this.name + "/planet.js?v=" + this.version;
	console.log(url);
	
	loader.load(url, function(geometry, materials){
		//var material = new THREE.MeshFaceMaterial(materials);
		var url = '/star-war/objects/three.js/' + self.name + '/' + self.texture + '?v=' + self.version;
		console.log(url);
		
		var material = new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture(url)});
		self.object = new Physijs.BoxMesh(geometry, material, 0);
		self.object.position.set(self.position.x,self.position.y,self.position.z);
		self.object.scale.set(30,30,30);
		callback.call();
	});
};


Planet.prototype.addToScene = function(scene)
{
	scene.add(this.object);
};

Planet.prototype.update = function()
{
	if(this.object){
		
	}
};

