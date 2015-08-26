/* * * * * * * * * * * * * * * * * * * * *
 * Bike object
 * 
 * 
 * * * * * * * * * * * * * * * * * * * * */


function Bike_M1030()
{
	Bike.call(this);
};


Bike_M1030.prototype = {constructor: Bike_M1030};
_inherit(Bike_M1030, Bike);


Bike_M1030.prototype.load = function(callback)
{
	var self = this;
	loader = new THREE.JSONLoader();
	loader.load( "/road-rush/objects/bikes/M1030/bike.js", function(geometry, materials){
	    var material = Physijs.createMaterial(new THREE.MeshFaceMaterial(materials), 0.4, 0.8);
	    self.object = new Physijs.BoxMesh(geometry, material);
	    
	    if($.isFunction(callback)){
	    	callback.call(self);
	   }
	});
};