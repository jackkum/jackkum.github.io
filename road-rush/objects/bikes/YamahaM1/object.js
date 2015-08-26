/* * * * * * * * * * * * * * * * * * * * *
 * Bike object
 * 
 * 
 * * * * * * * * * * * * * * * * * * * * */


function Bike_YamahaM1()
{
	Bike.call(this);
};


Bike_YamahaM1.prototype = {constructor: Bike_YamahaM1};
_inherit(Bike_YamahaM1, Bike);


Bike_YamahaM1.prototype.load = function(callback)
{
	var self = this;
	loader = new THREE.JSONLoader();
	loader.load( "/road-rush/objects/bikes/YamahaM1/bike.js", function(geometry, materials){
	    var material = Physijs.createMaterial(new THREE.MeshFaceMaterial(materials), 0.4, 0.8);
	    self.object = new Physijs.BoxMesh(geometry, material);
	    
	    if($.isFunction(callback)){
	    	callback.call(self);
	   }
	});
};