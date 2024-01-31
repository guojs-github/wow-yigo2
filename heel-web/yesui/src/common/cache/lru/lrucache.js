



var LRUCache = (function(){

	function ListElement(before, next, key, value){
		this.before = before;
		this.next = next;
		this.key = key;
		this.value = value;
	}

	ListElement.prototype.setKey = function(key){
		this.key = key;
	}

	ListElement.prototype.setValue = function(value){
		this.value = value;
	}


	function _LRUCache(max){
		this.maxSize =  max || 1000;

		this.reset();
	};

	_LRUCache.prototype.reset = function(){
		this.size = 0;
		this.cache = {};
		this.tail = undefined;
		this.head = undefined;
	};

	_LRUCache.prototype.contains = function(key){
		return key in this.cache;
	};

	_LRUCache.prototype.get = function(key){
		var cacheVal = this.cache[key];
		if(cacheVal){
			this.hit(cacheVal);
		}else{
			return null;
		}

		return cacheVal.value;
	};

	_LRUCache.prototype.set = function(key, val){
		var actual = this.cache[key];

		if(actual){
			actual.value = val;
			this.hit(actual);
		}else{
			var cacheVal;

			if(this.size >= this.maxSize){
				var tailKey = this.tail.key;
				this.detach(this.tail);

				cacheVal = this.cache[tailKey];
				delete this.cache[tailKey];

				cacheVal.next = undefined;
				cacheVal.before = undefined;

				cacheVal.setKey(key);
				cacheVal.setValue(val);
			}

			cacheVal = cacheVal ? cacheVal : new ListElement(undefined, undefined, key,	val);
			this.cache[key] = cacheVal;
			this.attach(cacheVal);
		}
	};

	_LRUCache.prototype.del = function(key){
		var val = this.cache[key];
		if(!val)
			return;
		this.detach(val);
		delete this.cache[key];
	};

	_LRUCache.prototype.hit = function(cacheVal){
		this.detach(cacheVal);
		this.attach(cacheVal);
	};

	_LRUCache.prototype.attach = function(element){
		if(!element)
			return;
		element.before = undefined;
		element.next = this.head;
		this.head = element;

		if(!element.next){
			this.tail = element;
		}else{
			element.next.before = element;
		}
		this.size ++;
	};

	_LRUCache.prototype.detach = function(element){
		if(!element)
			return;
		var before = element.before;
		var next = element.next;

		if(before){
			before.next = next;
		}else{
			this.head = next;
		}

		if(next){
			next.before = before;
		}else{
			this.tail = before;
		}

		this.size --;
	};

	_LRUCache.prototype.forEach = function(callback){
		var self = this;

		Object.keys(this.cache).forEach(function(key){
			var val = self.cache[key];
			callback(val.value, key);
		});
	};


	return _LRUCache;
})();