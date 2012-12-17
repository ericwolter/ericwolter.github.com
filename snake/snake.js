$(document).ready(function() {
	// var human = '10R2-10L2-8L2-7R2-5R2-5L2-2R2';
	var map = {
		'1R' : 0,
		'2L' : 1,
		'2R' : 2,
		'3L' : 3,
		'3R' : 4,
		'4L' : 5,
		'4R' : 6,
		'5L' : 7,
		'5R' : 8,
		'6L' : 9,
		'6R' : 10,
		'7L' : 11,
		'7R' : 12,
		'8L' : 13,
		'8R' : 14,
		'9L' : 15,
		'9R' : 16,
		'10L' : 17,
		'10R' : 18,
		'11L' : 19,
		'11R' : 20,
		'12L' : 21,
		'12R' : 22,
	};
	
	var camera, scene, renderer;
	var geometryEven, geometryOdd, materialEven, materialOdd;
	var pieces = [];

	init();
	var notation = parseNotation('10R2-10L2-8L2-7R2-5R2-5L2-2R2');
	build(notation);
	setupCamera();
	animate();
	
	function parseNotation(human) {
		var planes = human.split(/-/g);

		var computer = [];
		for(var i = 0; i < 24; i++) {
		    computer.push(0);
		}
		planes.forEach(function(plane) {
			var split_index = plane.search(/R|L/);
	
			var position = plane.substring(0,split_index+1);
			var orientation = parseInt(plane.substring(split_index+1, plane.length));
	
			computer[map[position]] = orientation;
		});
		
		return computer;
	}
	
	function connect(left, right) {
		var a1 = new THREE.Vector3(0,0,0);
		a1.copy(left.geometry.right);
		left.matrix.multiplyVector3(a1);
		
		var a2 = new THREE.Vector3(0,0,0);
		a2.copy(right.geometry.left);
		right.matrix.multiplyVector3(a2);
		
		var diff = new THREE.Vector3(0,0,0);
		diff.sub(a1,a2);
		
		right.position.addSelf(diff);
		right.updateMatrix();
	}
	
	function computeRotationAxis(mesh) {
		var inverseTransposeM = new THREE.Matrix4();
		inverseTransposeM.getInverse(mesh.matrix);
		inverseTransposeM.transpose();
		
		var n1 = new THREE.Vector3(0,0,0);
		n1.copy(mesh.geometry.rightNormal);
		inverseTransposeM.multiplyVector3(n1);
		n1.normalize();
		n1.x = Math.round(n1.x);
		n1.y = Math.round(n1.y);
		n1.z = Math.round(n1.z);
		
		console.log('x: ' + n1.x);
		console.log('y: ' + n1.y);
		console.log('z: ' + n1.z);
		console.log('*****');
		
		if(Math.abs(n1.x)) {
			return ['x', n1.x];
		} else if (Math.abs(n1.y)) {
			return ['y', n1.y];
		} else if (Math.abs(n1.z)) {
			return ['z', n1.z];
		}
	}
	
	function build(notation) {
	    scene = new THREE.Scene();
		pieces = [];
		
		var R = new THREE.Vector3(0,0,0);
		
		var previous = null;
		for(var i = 0; i < notation.length; i++) {
			if(i % 2) {
				var mesh = new THREE.Mesh(geometryOdd, materialOdd);
			} else {
				var mesh = new THREE.Mesh(geometryEven, materialEven);
			}
			scene.add(mesh);
			pieces.push(mesh);
			
			mesh.rotation.copy(R);
			mesh.updateMatrix();
			
			var axis = computeRotationAxis(mesh);
			R[axis[0]] += axis[1] * notation[i] * Math.PI/2;
			
			// if (R[axis[0]] > 2*Math.PI) {
			// 	R[axis[0]] -= 2*Math.PI;
			// } else if (R[axis[0]] < -2*Math.PI) {
			// 	R[axis[0]] += 2*Math.PI;
			// }
			console.log('x: ' + R.x);
			console.log('y: ' + R.y);
			console.log('z: ' + R.z);
			console.log('-----');
			
			if(previous !== null) {
				connect(previous, mesh);
			}
			previous = mesh;
		}
	}
	
	function init() {
		geometryEven = new THREE.Geometry();
		geometryEven.vertices.push(new THREE.Vector3(0,-1,0));
		geometryEven.vertices.push(new THREE.Vector3(0,0,0));
		geometryEven.vertices.push(new THREE.Vector3(1,0,0));
		geometryEven.vertices.push(new THREE.Vector3(0,-1,-1));
		geometryEven.vertices.push(new THREE.Vector3(0,0,-1));
		geometryEven.vertices.push(new THREE.Vector3(1,0,-1));
		
		geometryEven.faces.push(new THREE.Face3(0,2,1));
		geometryEven.faces.push(new THREE.Face3(3,4,5));
		geometryEven.faces.push(new THREE.Face4(0,1,4,3));
		geometryEven.faces.push(new THREE.Face4(1,2,5,4));
		geometryEven.faces.push(new THREE.Face4(0,3,5,2));
		
		var center = new THREE.Vector3(0,0,0);
		geometryEven.vertices.forEach(function(vertex) {
			center = center.addSelf(vertex);
		});
		center = center.divideScalar(geometryEven.vertices.length);
		geometryEven.center = center;
		
		geometryEven.vertices.forEach(function(vertex) {
			vertex = vertex.subSelf(center);
		});
		
		var r = new THREE.Vector3(0,0,0);
		r.addSelf(geometryEven.vertices[1]);
		r.addSelf(geometryEven.vertices[2]);
		r.addSelf(geometryEven.vertices[4]);
		r.addSelf(geometryEven.vertices[5]);
		r = r.divideScalar(4);
		geometryEven.right = r;
		geometryEven.rightNormal = new THREE.Vector3(0,1,0);
		
		var l = new THREE.Vector3(0,0,0);
		l.addSelf(geometryEven.vertices[0]);
		l.addSelf(geometryEven.vertices[1]);
		l.addSelf(geometryEven.vertices[3]);
		l.addSelf(geometryEven.vertices[4]);
		l = l.divideScalar(4);
		geometryEven.left = l;
		geometryEven.leftNormal = new THREE.Vector3(-1,0,0);
		
		geometryOdd = new THREE.Geometry();
		geometryOdd.vertices.push(new THREE.Vector3(0,0,0));
		geometryOdd.vertices.push(new THREE.Vector3(1,0,0));
		geometryOdd.vertices.push(new THREE.Vector3(1,1,0));
		geometryOdd.vertices.push(new THREE.Vector3(0,0,-1));
		geometryOdd.vertices.push(new THREE.Vector3(1,0,-1));
		geometryOdd.vertices.push(new THREE.Vector3(1,1,-1));
		
		geometryOdd.faces.push(new THREE.Face3(0,1,2));
		geometryOdd.faces.push(new THREE.Face3(5,4,3));
		geometryOdd.faces.push(new THREE.Face4(0,3,4,1));
		geometryOdd.faces.push(new THREE.Face4(1,4,5,2));
		geometryOdd.faces.push(new THREE.Face4(0,2,5,3));
		
		var center = new THREE.Vector3(0,0,0);
		geometryOdd.vertices.forEach(function(vertex) {
			center = center.addSelf(vertex);
		});
		center = center.divideScalar(geometryOdd.vertices.length);
		geometryOdd.center = center;
		
		geometryOdd.vertices.forEach(function(vertex) {
			vertex = vertex.subSelf(center);
		});
		
		var r = new THREE.Vector3(0,0,0);
		r.addSelf(geometryOdd.vertices[1]);
		r.addSelf(geometryOdd.vertices[2]);
		r.addSelf(geometryOdd.vertices[4]);
		r.addSelf(geometryOdd.vertices[5]);
		r = r.divideScalar(4);
		geometryOdd.right = r;
		geometryOdd.rightNormal = new THREE.Vector3(1,0,0);
		
		var l = new THREE.Vector3(0,0,0);
		l.addSelf(geometryOdd.vertices[0]);
		l.addSelf(geometryOdd.vertices[1]);
		l.addSelf(geometryOdd.vertices[3]);
		l.addSelf(geometryOdd.vertices[4]);
		l = l.divideScalar(4);
		geometryOdd.left = l;
		geometryOdd.leftNormal = new THREE.Vector3(0,-1,0);
		
	    materialOdd = new THREE.MeshBasicMaterial( { color: 0x43b3a3, wireframe: false } );
	    materialEven = new THREE.MeshBasicMaterial( { color: 0x5770b7, wireframe: false } );

	    renderer = new THREE.CanvasRenderer();
	    renderer.setSize( 500, 500 );

	    $('#3dviewer').append( renderer.domElement );
		
		$('canvas').mousedown(function(ev){
			
			var lastX = ev.pageX;
			var lastY = ev.pageY;
			
			$('canvas').bind('mousemove', function(ev) {
				var diffX = ev.pageX - lastX;
				var diffY = ev.pageY - lastY;
				
				camera.rotation.y -= diffX * Math.PI/180;
				camera.rotation.x += diffY * Math.PI/180;
				camera.updateProjectionMatrix();
				
				lastX = ev.pageX;
				lastY = ev.pageY;
			});
		});
		$(document).mouseup(function(){
			$('canvas').unbind('mousemove');
		}); 
	}
	
	function setupCamera() {
		
		var center = new THREE.Vector3(0,0,0);
		
		var minX = 99999;
		var minY = 99999;
		var minZ = 99999;
		var maxX = -99999;
		var maxY = -99999;
		var maxZ = -99999;
		pieces.forEach(function(piece) {
			center.addSelf(piece.position);
			
			if(piece.position.x < minX) {
				minX = piece.position.x;
			} else if (piece.position.x > maxX) {
				maxX = piece.position.x;
			}
			if(piece.position.y < minY) {
				minY = piece.position.y;
			} else if (piece.position.y > maxY) {
				maxY = piece.position.y;
			}
			if(piece.position.z < minZ) {
				minZ = piece.position.z;
			} else if (piece.position.z > maxZ) {
				maxZ = piece.position.z;
			}
		});
		center = center.divideScalar(pieces.length);
		
		var rangeX = maxX - minX;
		var rangeY = maxY - minY;
		var rangeZ = maxZ - minZ;
		
		var range;
		if (rangeX > rangeY) {
			if (rangeX > rangeZ) {
				range = rangeX;
			}
		} else {
			if (rangeY > rangeZ) {
				range = rangeY;
			} else {
				range = rangeZ;
			}
		}
		var frustum = (1.5*range) / 2;
		
		camera = new THREE.OrthographicCamera(-frustum, frustum, -frustum, frustum, -frustum, frustum);
	    camera.position = center;
		camera.updateProjectionMatrix();
	}

	function animate() {
	
	    // note: three.js includes requestAnimationFrame shim
	    requestAnimationFrame( animate );
	
	    // mesh.rotation.x += 0.01;
	    // mesh.rotation.y += 0.02;
	
	    renderer.render( scene, camera );
	}
	
	$('.figure').click(function(ev) {
		ev.preventDefault();
		
		var newHuman = $(this).find('.notation').text();
		build(parseNotation(newHuman));
		setupCamera();
		
		return false;
	})

});