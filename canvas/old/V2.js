const V = (()=>{
	const readOnly = (target, v)=>{
		for(let k in v) v[k] = {value:v[k]};
		Object.defineProperties(target, v);
	};
	const error = msg=> { throw msg; };
	const N = (factory,cnt)=>Array.from('0'.repeat(cnt)).map(_=>factory());


	const [offset, size, draw, bound, start, end, reset, image, rect, text] = N(Symbol, 10);

	const Paint = (([RESET, BOUND, START, END, IMAGE, RECT, TEXT])=>{
		const Paint = class{
			constructor(width, height){
				this[size](width, height);
			}
			[size](width, height){
				readOnly(this, {width, height});
			}
			[bound]({x, y, width, height}){this[BOUND](x, y, width, height);}
			reset(){this[RESET]();}

			[start](display){this[START](display);}
			[end](display){this[END](display);}
			// 구상클래스에서 사용함
			[image](display){this[IMAGE](display);}
			[rect](display){this[RECT](display);}
			[text](display){this[TEXT](display);}
		};
		return Object.assign(Paint, {RESET, BOUND, START, END, IMAGE, RECT, TEXT, image, rect, text});
	})(N(Symbol, 7));

	const Stage = class{
		constructor(paint){
			if(paint instanceof Paint) readOnly(this, {paint, root:new DisplayContainer()});
			else error();
		}

		addChild(display){this.root.addChild(display);}
		removeChild(display){this.root.removeChild(display);}
		getChildAt(index){this.root.getChildAt(index);}
		getChildById(id){this.root.getChildById(id);}

		render(){
			let {width, height} = this.root[Display.MEASURE](this.paint.width, this.paint.height);
			this.root[size](width, height);
			this.root[offset](0, 0);
			this.paint[reset]();
			this.root[Display.DRAW](this.paint);
		}
	};

	const Display = (([event, listener, boundRect, DRAW, MEASURE, OFFSET])=>{
		let uuid = 0;
		const bound = {};
		const Style = class{
			constructor(isBlock){
				this.display = isBlock ? 'block' : 'inline';
			}
		};
		const Event = (stop=>class{
			constructor(target){
				readOnly(this, {target});
			}
			init(type){
				this.type = type;
				this[stop] = false;
				return this;
			}
			stopPropagation(){
				this[stop] = true;
			}
			get isStopPropagation(){
				return this[stop];
			}
		})(Symbol());

		const Display = class{
			constructor(isBlock){
				readOnly(this, {
					id:uuid++,
					[event]:new Event(this),
					[listener]:{},
					[boundRect]:{},
					style:new Style(isBlock)
				});
			}
			dispatch(type){
				let listeners;
				if(listeners = this[listener][type]){
					let e = this[event].init(type);
					for(let listener of listeners){
						listener(ev);
						if(ev.isStopPropagation) return;
					}
				}
			}
			addListener(type, callback){
				const target = (this[listener][type] || (this[listener][type] = new Set()));
				target.add(callback);
			}
			removeListener(type, callback = null){
				const target = this[listener][type];
				if(!target) return;
				if(callback) target.delete(callback);
				else target.clear();
			}

			[offset](x, y){this[boundRect].x = x, this[boundRect].y = y;}
			[size](width, height){this[boundRect].width = width, this[boundRect].height = height;}

			get boundRect(){
				const rect = this[boundRect];
				if(!this.style._margin) return rect;
				bound.x = rect.x + this.style._margin[3];
				bound.y = rect.y + this.style._margin[0];
				bound.width = rect.width;
				bound.height = rect.height;
				return bound;
			}

			[draw](paint){
				paint[start](this);
				this[DRAW](paint);
				paint[end](this);
			}
			[DRAW](paint){}
		};
		return Object.assign(Display, {DRAW, MEASURE, OFFSET});
	})(N(Symbol, 6));

	const DisplayContainer = (([children, ids])=>class extends Display {
		constructor(isBlock) {
			super(isBlock);
			readOnly(this, {
				[children]:new Set(),
				[ids]:new Map()
			});
		}
		addChild(display){
			if(!(display instanceof Display)) return;
			this.removeChild(display);

			this[children].add(display);
			this[ids][display.id] = display;

		}
		removeChild(display){
			if(!(display instanceof Display) || !this[ids][display.id]) return;
			this[ids].delete(display.id);
			this[children].delete(display);
		}
		getChildAt(index){
			if(this[children].size <= index) return null;
			let idx = 0;
			return this[children].forEach((v1, v2, set)=>idx++ == index ? set.delete(v1) : 0);
		}
		getChildById(id){
			return this[ids][display.id] || null;
		}
		[draw](paint){
			super[DRAW](paint);
			for(let child of this[children]) child[draw](paint);
		}
		[Display.MEASURE](parentWidth, parentHeight){
			let totalH = 0, lineW = 0, lineH = 0;
			Css.size(this.style, parentWidth, parentHeight);
			for(let child of this[CHILDREN]){
				let {width, height} = child[Display.MEASURE](parentWidth, 0);
				child.setSize(width, height);
				let [marginT, marginR, marginB, marginL] = Css.margin(child.style);
				width += marginL + marginR;
				height += marginB + marginT;
				if(child.style.display == 'block'){
					if(lineH){
						totalH += lineH;
						lineH = lineW = 0;
					}
					child.setOffset(0, totalH);
					totalH += height;
				}else{
					let offsetX = lineW;
					if(lineW + width > parentWidth){
						if(lineH){
							totalH += lineH;
							lineH = lineW = 0;
						}
						lineW = width;
						lineH = height;
					}else{
						lineW += width;
						if(lineH < height) lineH = height;
					}
					child.setOffset(offsetX, totalH);
				}
			}
			if(lineH) totalH += lineH;
			switch(this.style.textAlign){
				case'right':
					let i = this[CHILDREN].length, j = parentWidth;
					while(i--){
						let c = this[CHILDREN][i], rect = c[BOUNDRECT];
						rect.x = j -= rect.width + c.style._margin[1] + c.style._margin[3];
					}
					break;
				case'justify':
			}
			return {width:parentWidth, height:totalH};
		}
	})(N(Symbol, 2));

	return v = {
		Event, Display, DisplayContainer, Stage,
		spread:()=>{
			for(let k in v) window[k] = v[k];
		}
	};
})();
