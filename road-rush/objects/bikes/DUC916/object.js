/* * * * * * * * * * * * * * * * * * * * *
 * Bike object
 * 
 * 
 * * * * * * * * * * * * * * * * * * * * */

function Bike_DUC916()
{
	Bike.call(this);
	
	/*
	from example:
	10.88,
	1.83,
	0.28,
	500,
	10.5,
	6000
	*/
	
	this.guiParams = {
		suspension_stiffness 	 : typeof(post_suspension_stiffness) != 'undefined' ? post_suspension_stiffness : 15.88,
		suspension_compression 	 : typeof(post_suspension_compression) != 'undefined' ? post_suspension_compression : 1.83,
		suspension_damping		 : typeof(post_suspension_damping) != 'undefined' ? post_suspension_damping : 0.28,
		max_suspension_travel 	 : typeof(post_max_suspension_travel) != 'undefined' ? post_max_suspension_travel : 80,
		friction_slip 			 : typeof(post_friction_slip) != 'undefined' ? post_friction_slip : 10.5,
		max_suspension_force 	 : typeof(post_max_suspension_force) != 'undefined' ? post_max_suspension_force : 5000,
		wheel_radius             : typeof(post_wheel_radius) != 'undefined' ? post_wheel_radius : 3.2,
		suspension_rest_length   : typeof(post_suspension_rest_length) != 'undefined' ? post_suspension_rest_length : 2.2,
		connection_point_front_x : typeof(post_connection_point_front_x) != 'undefined' ? post_connection_point_front_x : 0, 
		connection_point_front_y : typeof(post_connection_point_front_y) != 'undefined' ? post_connection_point_front_y : 0.8, 
		connection_point_front_z : typeof(post_connection_point_front_z) != 'undefined' ? post_connection_point_front_z : 4.6,
		connection_point_back_x  : typeof(post_connection_point_back_x) != 'undefined' ? post_connection_point_back_x : 0, 
		connection_point_back_y  : typeof(post_connection_point_back_y) != 'undefined' ? post_connection_point_back_y : 1, 
		connection_point_back_z  : typeof(post_connection_point_back_z) != 'undefined' ? post_connection_point_back_z : -4.8
	};
	
};


Bike_DUC916.prototype = {constructor: Bike_DUC916};
_inherit(Bike_DUC916, Bike);


Bike_DUC916.prototype.load = function(callback)
{
	var self = this;
	loader = new THREE.JSONLoader();
	loader.load( "/road-rush/objects/bikes/DUC916/bike.js?v=1.0.2", function(geometry, materials){
	    var material = new THREE.MeshFaceMaterial(materials);
	    self.object = new Physijs.BoxMesh(geometry, material, 500);
		self.object.position.set(0,25,0);
		
		loader.load( "/road-rush/objects/bikes/DUC916/back-wheel.js?v=1.0.2", function(geometry, materials){
	    	var material = Physijs.createMaterial(new THREE.MeshFaceMaterial(materials), 1, 0.5);
			//self.wheels.back.mesh = new Physijs.BoxMesh(geometry, material);
			//self.wheels.back.mesh.position.set(0,5,0);
			
			self.wheels.back.geometry = geometry;
			self.wheels.back.material = material;
			
			loader.load( "/road-rush/objects/bikes/DUC916/front-wheel.js?v=1.0.2", function(geometry, materials){
		    	var material = Physijs.createMaterial(new THREE.MeshFaceMaterial(materials), 1, 0.5);
				//self.wheels.front.mesh = new Physijs.BoxMesh(geometry, material);
				//self.wheels.front.mesh.position.set(0,5,0);
				
				self.wheels.front.geometry = geometry;
				self.wheels.front.material = material;
				
				// done
				if($.isFunction(callback)){
					callback.call(self);
				}
			});
			
		});
		
	});
};

Bike_DUC916.prototype.onAddScene = function(scene)
{
	this.wheels.vehicle = new Physijs.Vehicle(
		this.object, 
		new Physijs.VehicleTuning(
			this.guiParams.suspension_stiffness,     // жёсткость подвески
			this.guiParams.suspension_compression,   // сжатия подвески
			this.guiParams.suspension_damping,  // подвеска демпфирование
			this.guiParams.max_suspension_travel,   // макс ход подвески см
			this.guiParams.friction_slip,  // фрикционная втулка
			this.guiParams.max_suspension_force   // макс подвеска сила
		)
	);
	
	scene.add(this.wheels.vehicle);
	
	this.wheels.vehicle.addWheel(
		this.wheels.front.geometry, 	// wheel_geometry
		this.wheels.front.material,		// wheel_material
		new THREE.Vector3(
			this.guiParams.connection_point_front_x, 
			this.guiParams.connection_point_front_y, 
			this.guiParams.connection_point_front_z
		),  // connection_point
		new THREE.Vector3(0, -1, 0),	// wheel_direction
		new THREE.Vector3(-1, 0, 0),	// wheel_axle
		this.guiParams.suspension_rest_length,	// suspension_rest_length
		this.guiParams.wheel_radius,							    // wheel_radius
		true							// is_front_wheel
										// tuning
	);
	
	this.wheels.vehicle.addWheel(
		this.wheels.back.geometry, 		// wheel_geometry
		this.wheels.back.material,		// wheel_material
		new THREE.Vector3(
			this.guiParams.connection_point_back_x, 
			this.guiParams.connection_point_back_y, 
			this.guiParams.connection_point_back_z
		), // connection_point
		new THREE.Vector3(0, -1, 0),	// wheel_direction
		new THREE.Vector3(-1, 0, 0),	// wheel_axle
		this.guiParams.suspension_rest_length,	// suspension_rest_length
		this.guiParams.wheel_radius,							// wheel_radius
		false							// is_front_wheel
										// tuning
	);
	
	//this.object.matrixAutoUpdate = false;
	//this.object.updateMatrix();
	//this.wheels.vehicle.applyEngineForce(5000,1);
};
