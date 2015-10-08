/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var DIRECTION_TOP = 0,
	    DIRECTION_RIGHT = 1,
	    DIRECTION_BOTTOM = 2,
	    DIRECTION_LEFT = 3,

	    DIRECTION_COUNT = 4,

	    DIRECTION_VECTORS = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }],
	    DIRECTION_STRINGS = ['DIRECTION_TOP', 'DIRECTION_RIGHT', 'DIRECTION_BOTTOM', 'DIRECTION_LEFT'],

	    BELT_SIZE = 40,

	    GIRD_CELL_SIZE = 25;



	var Item = {
	  container: null,
	  texture: null,
	  items: []
	};

	var Belt = {
	  container: null,
	  textures: [],
	  belts: {},
	  belts_withoutNext: [],
	  destinations: {}
	};

	var Cursor = {
	  container: null,
	  direction: DIRECTION_TOP,
	  belt: null
	};

	function createItem(x, y) {
	  var sprite = new PIXI.Sprite(Item.texture);

	  sprite.scale.x = 0.7;
	  sprite.scale.y = 0.7;

	  sprite.position.x = x * GIRD_CELL_SIZE;
	  sprite.position.y = y * GIRD_CELL_SIZE;

	  Item.container.addChild(sprite);

	  Item.items.push({
	    index: Item.items.length,
	    x: x,
	    y: y,
	    sprite: sprite,
	    lock: false
	  });
	}

	function updateItems() {
	  var d, item;
	  var disableList = {};
	  var lockList = {};
	  var emptyList = [];

	  Object.keys(Belt.destinations).forEach(function(dk) {
	    var d = Belt.destinations[dk];
	    if (!findItem(d.x, d.y)) {
	      emptyList.push(d);
	    }
	  });
	  emptyList.push('|');

	  var moved;

	  var changed = false;

	  while (emptyList.length > 0) {
	    d = emptyList.shift();
	    moved = false;

	    if (d === '|'){
	      emptyList.push('|');
	      if (!changed) {
	        return;
	      }
	      changed = false;
	      continue; 
	    }

	    d.sources.forEach(function(belt) {
	      if (moved) { return; }

	      var item = findItem(belt.x, belt.y);
	      if (item && !lockList[item.x+','+item.y]) {
	        var freeDest = findDestination(belt.x, belt.y);
	        if (freeDest && !disableList[freeDest.x+','+freeDest.y]) {
	          emptyList.push(freeDest);  
	        }
	        
	        item.x = d.x;
	        item.y = d.y;
	       
	        item.sprite.position.x = item.x * GIRD_CELL_SIZE;
	        item.sprite.position.y = item.y * GIRD_CELL_SIZE;

	        moved = true;
	        lockList[item.x+','+item.y] = true;
	      }
	    });

	    if (moved) {
	      changed = true;
	      disableList[d.x+','+d.y] = true;
	    } else {
	      emptyList.push(d);
	    }    
	  }

	}


	function findItem(x, y) {
	  var i = 0, l = Item.items.length;

	  for (; i<l; ++i) {
	    if ((Item.items[i].x === x) && (Item.items[i].y === y)) {
	      return Item.items[i];
	    }
	  }
	  return;  
	}


	function addDestination(dx, dy, from) {
	  var dk = dx + ',' + dy;

	  if (Belt.destinations.hasOwnProperty(dk)) {
	    Belt.destinations[dk].sources.push(from); 
	  } else {
	    Belt.destinations[dk] = { x: dx, y: dy, sources: [ from ] };
	  }
	}

	function findDestination(x, y) {
	  var key = x+','+y;

	  if (!Belt.destinations.hasOwnProperty(key)) {
	    return;
	  }

	  return Belt.destinations[key];
	}

	function findBelt(x, y) {
	  var key = x+','+y;

	  if (!Belt.belts.hasOwnProperty(key)) {
	    return;
	  }

	  return Belt.belts[key];
	}


	function addBelt(x, y){
	  var key = x+','+y;

	  if (Belt.belts.hasOwnProperty(key)) {
	    Belt.container.removeChild(Belt.belts[key].sprite);   
	    Belt.belts[key].sprite.destroy();
	    delete Belt.belts[key];
	  }

	  var direction = Cursor.direction;
	  var sprite = new PIXI.Sprite(Belt.textures[direction]);

	  sprite.position.x = x * GIRD_CELL_SIZE;
	  sprite.position.y = y * GIRD_CELL_SIZE;

	  sprite.scale.x = sprite.scale.y = GIRD_CELL_SIZE / BELT_SIZE;

	  var belt = {
	    x: x,
	    y: y,
	    direction: direction,
	    sprite: sprite
	  };  

	  Belt.belts[key] = belt;

	  Belt.container.addChild(sprite);

	  var o = DIRECTION_VECTORS[direction];
	  
	  addDestination(x + o.x, y + o.y, belt);

	  // console.log(Belt.belts_withoutNext.map(function (b) { return b.x+','+b.y; }));
	}


	function createCursor(el) {
	  Cursor.container = new PIXI.Container();

	  var rect = new PIXI.Graphics();

	  rect.beginFill(0x0000FF, 1);
	  rect.drawRect(0, 0, GIRD_CELL_SIZE, GIRD_CELL_SIZE);
	  rect.endFill();

	  Cursor.container.addChild(rect);

	  Cursor.belt = new PIXI.Sprite(Belt.textures[Cursor.direction]);

	  Cursor.belt.scale.x = Cursor.belt.scale.y = GIRD_CELL_SIZE / BELT_SIZE;

	  Cursor.container.addChild(Cursor.belt);

	  window.addEventListener('keypress', function (event) {
	    if (event.charCode === 'a'.charCodeAt(0)){
	      Cursor.direction  += 3;
	    } else if (event.charCode === 'e'.charCodeAt(0)){
	      Cursor.direction ++;
	    } else {
	      return;
	    }

	    Cursor.direction %= 4;
	    Cursor.belt.texture = Belt.textures[Cursor.direction];
	  
	  }, false);

	  el.addEventListener('mousemove', function (event) {
	    Cursor.container.position.x = Math.floor(event.layerX / GIRD_CELL_SIZE) * GIRD_CELL_SIZE;
	    Cursor.container.position.y = Math.floor(event.layerY / GIRD_CELL_SIZE) * GIRD_CELL_SIZE;
	  }, false);

	 
	  el.addEventListener('click', function (event) {
	    event.preventDefault();
	    event.stopPropagation();

	    var x = Math.floor(event.layerX / GIRD_CELL_SIZE);
	    var y = Math.floor(event.layerY / GIRD_CELL_SIZE);

	    if (event.shiftKey) {
	      createItem(x, y);
	      return;
	    }

	    addBelt(x, y);
	  }, false);
	}


	window.addEventListener('load', function () {

	  var PIXI = __webpack_require__(1);

	  // You can use either `new PIXI.WebGLRenderer`, `new PIXI.CanvasRenderer`, or `PIXI.autoDetectRenderer`
	  var renderer = new PIXI.WebGLRenderer(800, 600);


	  Belt.textures[DIRECTION_TOP] = PIXI.Texture.fromImage('resources/belt-top.png');
	  Belt.textures[DIRECTION_RIGHT] = PIXI.Texture.fromImage('resources/belt-right.png');
	  Belt.textures[DIRECTION_BOTTOM] = PIXI.Texture.fromImage('resources/belt-bottom.png');
	  Belt.textures[DIRECTION_LEFT] = PIXI.Texture.fromImage('resources/belt-left.png');

	  Item.texture = PIXI.Texture.fromImage('resources/bunny.png');

	  document.body.appendChild(renderer.view);

	  
	  var el = renderer.view;

	  var stage = new PIXI.Container();

	  createCursor(el);
	  stage.addChild(Cursor.container);

	  Belt.container = new PIXI.Container();
	  stage.addChild(Belt.container);


	  Item.container = new PIXI.Container();
	  stage.addChild(Item.container);


	  animate();

	  var i = 0;

	  function animate() {
	      requestAnimationFrame(animate);

	      if (i > 100){
	        updateItems();
	        i = 0;  
	      }
	      i++;

	      renderer.render(stage);
	  }

	}, false);

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = PIXI;

/***/ }
/******/ ]);