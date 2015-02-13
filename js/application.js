var EasterEgg = (function(w, d){

    var camera,
        scene,
        renderer,
        projector,
        raycaster,
        mesh;

    var loaded = false,
        globalData =[],
        meshes = [];
        sphereMaterialCache = {};

    var WINDOW_WIDTH = 600,
        WINDOW_HEIGHT = 400;

    var boundingRect,
        isUserInteracting = false,
        onMouseDownMouseX = 0,
        onMouseDownMouseY = 0,
        lon = 0, onMouseDownLon = 0,
        lat = 0, onMouseDownLat = 0,
        phi = 0, theta = 0,
        mouse = { x: 0, y: 0 },
        INTERSECTED;

    var pointMapHovered = THREE.ImageUtils.loadTexture( "img/information-hover.PNG" ),
        pointMap = THREE.ImageUtils.loadTexture( "img/information-unhover.PNG" );

    // аЁаПаАбаИаБаО баАаБбаАбаЗаЕбб k12th аЗаА баОаВаЕб аНаАаПаОаМаИаНаАбб аПаОаЛбаЗаОаВаАбаЕаЛбаМ аОаБ аОббббббаВаИаИ WebGL
    if ( ! Detector.webgl ) {
        Detector.addGetWebGLMessage({parent:d.querySelector('#container')});
        d.querySelector('.loader').style.display = none;
        return false;
    }

    $.getJSON('ajax/points.json').success(function(data) {
        globalData = data;
    }).done(init).done([animate, renderMenu]);

    function init() {

        var container,
            canvas,
            firstScene = globalData[0];

        container = d.querySelector('#container');

        camera        = new THREE.PerspectiveCamera( 60, WINDOW_WIDTH / WINDOW_HEIGHT, 1, 1100 );
        camera.target = new THREE.Vector3( 0, 0, 0 );
        projector     = new THREE.Projector();
        scene         = new THREE.Scene();
        raycaster     = new THREE.Raycaster();
        renderer      = new THREE.WebGLRenderer();
        renderer.setSize( WINDOW_WIDTH, WINDOW_HEIGHT );

        renderSphere(firstScene);
        renderPoints(firstScene.points);


        container.appendChild( renderer.domElement );
        canvas = d.querySelector('canvas');
        boundingRect = renderer.domElement.getBoundingClientRect();

        container.addEventListener( 'mouseenter', onContainerMouseEnter, false);
        //canvas.addEventListener( 'mouseover', onContainerMouseEnter, false);
        container.addEventListener( 'mouseleave', onContainerMouseLeave, false);
        container.addEventListener( 'mousedown', onDocumentMouseDown, false);
        container.addEventListener( 'mousemove', onDocumentMouseMove, false);
        d.addEventListener( 'mouseup', onDocumentMouseUp, false);
        //container.addEventListener( 'dblclick', onDocumentMouseDblclick, false);
      }

    function renderPoints(points) {

        var max = points.length,
            i = 0,
            point;

        for (; i < max; i++) {
            point = new Point(points[i], pointMap);
            scene.add(point);
            //аКббаИббаЕаМ
            meshes.push( point );
        }
    }

    function renderSphere(data) {
        var sphere_geometry = new THREE.SphereGeometry( 500, 60, 40 ),
            sphere_material = new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture( data.texture ),
                side: THREE.BackSide
            });
        mesh = new THREE.Mesh( sphere_geometry, sphere_material);
        sphereMaterialCache[data.name] = sphere_material;
        scene.add( mesh );
    }

    /*
        *
        *
      function onDocumentMouseDblclick(event) {

        event.preventDefault();

        var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
        projector.unprojectVector( vector, camera );
        raycaster.set( camera.position, vector.sub( camera.position ).normalize() );
        var intersects = raycaster.intersectObjects( scene.children );

        if ( intersects.length == 1 ) {
          var sprite = new THREE.Mesh( new THREE.PlaneGeometry(35, 35), new THREE.MeshPhongMaterial({map: pointMap, transparent:true }));

          //ббаАаВаИаМ аПаОаЗаИбаИаИ бббб аБаЛаИаЖаЕ аК аКаАаМаЕбаЕ
          sprite.position.x = intersects[0].point.x *0.99;
          sprite.position.y = intersects[0].point.y *0.99;
          sprite.position.z = intersects[0].point.z *0.99;
          sprite.lookAt( camera.position );
          console.log(sprite.position);
          //scene.add( sprite );
          //meshes.push( sprite );
        }
      }

    */
    function animate() {
        requestAnimationFrame( animate );
        render();
    }

    function render() {

        var container = d.querySelector('#container'),
            message = d.querySelector('#panoram-message'),
            vector = new THREE.Vector3( mouse.x, mouse.y, 1),
            intersects;

        //аЕбаЛаИ аПаЕбаВаАб аЗаАаГббаЗаКаА
        if(!loaded) {
            d.querySelector('.loader').style.display = 'none';
            container.style.opacity = 1;
            loaded = true;
        }

        // аНаЕаОаБбаОаДаИаМаО ббаО аБб аПаОаДбаКаАаЗаКаА аПаЛаАаВаАаЛаА аЗаА аМббаКаОаЙ
        if ( message ) Message.updateCoords( message );

        projector.unprojectVector( vector, camera );
        raycaster.set( camera.position, vector.sub( camera.position ).normalize() );
        intersects = raycaster.intersectObjects( meshes );

        // аЕбаЛаИ аЛбб аПаОаПаАаЛ аВ баОбаКб
        if ( intersects.length > 0 ) {

            // аИ аДаЕаЙббаВаИаЙ аПаО аОбаОаБбаАаЖаЕаНаИб аНаЕ аВбаПаОаЛаНаЕаНаО
            if ( INTERSECTED != intersects[ 0 ].object ) {

                //аЗаАаПаОаМаНаИбб, ббаО аМб ббаИаМ баЖаЕ аЗаАаНаИаМаАаЛаИбб
                INTERSECTED = intersects[ 0 ].object;

                // аВ аОбаНаОаВаНаОаМ аНбаЖаНаО баОаЛбаКаО аДаЛб аПаАббаАаЛаКаИ
                if(INTERSECTED.data.active === undefined) INTERSECTED.material.map = pointMapHovered;

                container.style.cursor = 'help';
                Message.showMessage( INTERSECTED.data, container );
            }

        // аЕбаЛаИ аЛбб аПаОаПаАаЛ аВ ббаЕбб
        } else {
            //аОббаАаЛаАбб аАаКбаИаВаНаАб баОбаКаА
            if ( INTERSECTED ) {

                // аВ аОбаНаОаВаНаОаМ аНбаЖаНаО баОаЛбаКаО аДаЛб аПаАббаАаЛаКаИ
                if(INTERSECTED.data.active === undefined) INTERSECTED.material.map = pointMap;

                container.style.cursor = 'move';
                Message.removeMessage();
                INTERSECTED = null;
            }
        }

        //баАббаЕб баИбаОбб аИ аДаОаЛаГаОбб аДаЛб аПбаАаВаИаЛбаНаОаГаО аВаЕаКбаОбаА аКаАаМаЕбб
        lat = Math.max( - 85, Math.min( 85, lat ) );
        phi = THREE.Math.degToRad( 90 - lat );
        theta = THREE.Math.degToRad( lon );

        camera.target.x = 500 * Math.sin( phi ) * Math.cos( theta );
        camera.target.y = 500 * Math.cos( phi );
        camera.target.z = 500 * Math.sin( phi ) * Math.sin( theta );

        camera.lookAt( camera.target );

        renderer.render( scene, camera );

      }

    var Point = function(data, defaultImage) {

        var itemGeometry = new THREE.PlaneGeometry(35, 35),
            point;

        point = new THREE.Mesh( itemGeometry, new THREE.MeshBasicMaterial({
            map: defaultImage,
            transparent:true
        }) );

        point.position.x = data.coords.x;
        point.position.y = data.coords.y;
        point.position.z = data.coords.z;
        point.data = {
            header: data.header,
            body: data.body
        };

        point.lookAt( camera.position );
        return point;
    }

    var Message = (function() {

        var _private = {

            template: '<h3>{{header}}</h3><p>{{body}}</p>',

            buildMessage: function() {
                var message = d.createElement('div');
                message.id = 'panoram-message';
                return message;
            },

            renderTemplate: function(data) {
                return _private.template.replace(/\{{([\w\.]*)\}}/g, function(x, keyword){
                    return data[keyword];
                });
            },

            setTemplate: function(str) {
              // str.test(/<?script>/g)? _private.template = str: false;
            },

            updateCoords: function(elem) {
                elem.style.left = mouse.trueX +15 +'px';
                elem.style.top = mouse.trueY +15 + 'px';
            }
        };

        return {

            setTemplate: function(str) {
                return _private.setTemplate(str);
            },

            showMessage: function(data, container) {
                var m = _private.buildMessage();
                _private.updateCoords(m);
                m.innerHTML = _private.renderTemplate(data);
                container.appendChild(m);
            },

            removeMessage: function() {
                var m = d.querySelector('#panoram-message');
                m? m.parentNode.removeChild(m):false;
            },

            updateCoords: function(elem) {
                return _private.updateCoords(elem);
            }
        }
    }());

    function actionRerender(num) {

        loaded = false;
        d.querySelector('.loader').style.display = 'block';
        container.style.opacity = 0;


        var object = globalData[num],
            sphereMaterial;

        if (sphereMaterialCache[object.name] === undefined) {
            sphereMaterial = new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture(globalData[num].texture),
                side: THREE.BackSide
            });
            sphereMaterialCache[object.name] = sphereMaterial;
        }

        mesh.material = sphereMaterialCache[object.name];

        for (var i = 0; i < meshes.length; i++) {
            scene.remove(meshes[i]);
        }

        // аЇаИббаИаМ абб баОбаЕаК
        meshes = [];

        renderPoints(object.points);

        //аЁбаАаВаИаМ аКаАаМаЕбб аПаО баМаОаЛбаАаНаИб
        lon = 0; lat = 0;
    }

    function renderMenu() {

    var localData = globalData,
        i = 0,
        dataMax = localData.length,
        curName,
        html;

    var $Menu;

    // а аИббаЕаМ аЕбаЛаИ JSON баОаДаЕбаЖаИб аОаБбаЕаКбб
    if(dataMax > 0) {

      html = '<nav><p>аЇбаО аПаОбаМаОббаЕбб:</p><br><ul>';

      for (; i < dataMax; i++) {

        curName = localData[i].name;

        (i === 0) ?
          html += '<li><a href="#" class="active" data-room=' + i +'>' + curName + '</a></li>' :
          html += '<li><a href="#" data-room=' + i +'>' + curName + '</a></li>';
      }

      html += '</ul></nav>';
      $(container).parent().append(html);

      // ааВаЕаНб аНаА аКаЛаИаК
      $Menu = $('nav > ul li a');
      $Menu.each(function() {
        $(this).on('click', onMenuClick);
      });
    }
  }

    function onContainerMouseEnter() {
        console.log('what?');
        var $tooltip = d.querySelector('.tooltip');
        $tooltip.children[0].style.display = 'none';
        $tooltip.children[1].style.display = 'block';
    }

    function onContainerMouseLeave() {
        var $tooltip = d.querySelector('.tooltip');
        $tooltip.children[0].style.display = 'block';
        $tooltip.children[1].style.display = 'none';
    }

    function onDocumentMouseDown( event ) {

        event.preventDefault();

        isUserInteracting = true;

        onPointerDownPointerX = event.clientX;
        onPointerDownPointerY = event.clientY;

        onPointerDownLon = lon;
        onPointerDownLat = lat;

    }

    function onDocumentMouseMove( event ) {

        mouse.trueX = (event.clientX - boundingRect.left)*(WINDOW_WIDTH / boundingRect.width);
        mouse.trueY = (event.clientY - boundingRect.top)*(WINDOW_HEIGHT / boundingRect.height);
		
        mouse.x = ( mouse.trueX/ WINDOW_WIDTH ) * 2 - 1;
        mouse.y = - (  mouse.trueY/ WINDOW_HEIGHT ) * 2 + 1;
		
        if ( isUserInteracting ) {
            lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
            lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
        }
    }

    function onDocumentMouseUp( event ) {

        isUserInteracting = false;
    }

    function onMenuClick() {

        var num = $(this).data('room');

        if (this.className !== 'active') {
            $('.active').removeClass('active');
            $(this).addClass('active');

            actionRerender(num);
        }
    }

    return function () {
        var was, max = meshes.length;
        for (var i = 0; i < max; i++) {
            if (meshes[i].data.active === false) was = true;
        }
        if (was) return "абаБаЛаИаКаАбаОаВ аНаЕ аДаЕаЛаАаЕаМ";
        if (sphereMaterialCache['ааНбббаЕаНаНаИаЙ аДаВаОб'] !== mesh.material) return 'аб ббаО бббаИбаЕ?';
        var data = {coords: {x: -278.41281334573324, y: 250.13248038495448, z: -323.0071748111963}, header: "ааа", body: "аЁаПаАбаИаБаО баЕаБаЕ аЗаА аИаНаВаАаЙб :)"};
        var sprite = new Point(data, THREE.ImageUtils.loadTexture('img/easteregg.png'));
        sprite.data.active = false;
        scene.add(sprite);
        meshes.push(sprite);
        return 'аОаК, аВб аМаЕаНб баАбаКббаИаЛаИ!';
    };
})(this, this.document);