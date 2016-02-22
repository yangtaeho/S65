const V = (()=>{
	let v;
	//범용 에러정의
	const ERROR = Object.defineProperties({}, {
		isMandatory:{value:({location, details}) => { //필수인자누락시 발생
			throw new Error('Argument is Mandatory:' + location + '(' + details + ')');
		}}
	});
	const STOP_PROPAGATION = Symbol();//그 이벤트가 도중에 정지되는 경우를 감지하기 위한 속성
	const EVENT = Symbol(), LISTENER = Symbol(), ONMEASURE = Symbol(), ONOFFSET = Symbol(), ONDRAW = Symbol(), _ONDRAW = Symbol();
	const CHILDREN = Symbol(), _CHILDREN = Symbol();
	const BOUNDRECT = Symbol(), STYLE = Symbol();
	//범용 이벤트
	const Event =  class{
		constructor(target){ //생성시점에 target을 읽기전용으로 확정함
			Object.defineProperty(this, 'target', {value:this});
		}
		init(eventType){
			this.type = eventType; //디스패치할 이벤트로 타입을 정하고
			this[STOP_PROPAGATION] = false; //전파를 초기함
			return this;
		}
		stopPropagation(){ //전파중지시 체크
			this[STOP_PROPAGATION] = true;
		}
		get isStopPropagation(){
			return this[STOP_PROPAGATION];
		}
	};
	const Style = class{
		constructor(){
            
        }
	};
	const Paint = class{
		constructor(width, height){
			this.width = width;
			this.height = height;
		}
		setBound({x, y, width, height}){
			this._bound(x, y, width, height);
		}
		startDraw(display){
			this._startDraw(display);
		}
		endDraw(display){
			this._endDraw(display);
		}
		drawImage(display){
			this._drawImage(display);
		}
		drawRect(display){
			this._drawRect(display);
		}
		reset(){
			this._reset();
		}
	};
	const CanvasStyle = class {
		static background(cx,style,width,height) {
			if (!style || !style.backgroundColor) return;
			cx.fillStyle = style.backgroundColor;
			cx.fillRect(0,0,width,height);
		}		
		static stroke(cx, style, width, height){
			let t0;
			if (!style || !style.border || (t0 = style.border.split(/\s+/)).length != 2) return;
			for(let t1 of t0){
				if (t1.match(/(\d+)/)) cx.lineWidth = parseFloat(t1);
				else cx.strokeStyle = t1;
			}
			cx.strokeRect(0, 0, width, height);
		}
	};
	const Canvas = class extends Paint{
		constructor(canvas){
			super(canvas.width, canvas.height);
			this.cx = canvas.getContext('2d');
		}
		_bound(x, y, width, height){
			this.cx.save();
			this.cx.translate(x,y);
			this.elWidth = width;
			this.elHeight = height;
		}
		_startDraw(display){
			this.setBound(display.getBoundRect());
		}
		_endDraw(display){
			this.cx.restore();
		}
		_drawImage(display){
			CanvasStyle.background(this.cx,display.style,this.elWidth,this.elHeight);
			this.cx.drawImage(display.img, 0, 0, this.elWidth, this.elHeight);
			CanvasStyle.stroke(this.cx,display.style,this.elWidth,this.elHeight);
		}
		_drawRect(display){
			CanvasStyle.background(this.cx,display.style,this.elWidth,this.elHeight);
			CanvasStyle.stroke(this.cx,display.style,this.elWidth,this.elHeight);
		}
		_reset(){
			this.cx.clearRect(0, 0, this.width, this.height);
		}
	};
	const paints = {Canvas};
	const Stage = class{
		constructor(type, param){
			this.paint = new paints[type](param);
			this.root = new DisplayContainer();
		}
		addChild(display){
			this.root.addChild(display);
		}
		removeChild(display){
			this.root.removeChild(display);
		}
		getChildAt(index){
			this.root.getChildAt(index);
		}
		getChildById(id){
			this.root.getChildById(id);
		}
		render(){
			let {width, height} = this.root[Display.onMeasure](this.paint.width, this.paint.height);
			this.root.setSize(width, height);
			this.root.setOffset(0, 0);
			this.paint.reset();
			this.root[_ONDRAW](this.paint);
		}
	};
	const Display = (()=>{
		let uuid = 0, bound = {};
		return class{
			static get onDraw(){return ONDRAW;}
			static get onMeasure(){return ONMEASURE;}
			static get onOffset(){return ONOFFSET;}
			constructor(isBlock){
				Object.defineProperties(this, {
					id:{value:uuid++},
					isBlock:{value:isBlock},
					[EVENT]:{value:new Event(this)},
					[LISTENER]:{value:{}},
					[BOUNDRECT]:{value:{}},
					style:{value:new Style}
				});
			}
			dispatch(event){
				let listeners; //그 안에서 리스너셋 및 이벤트 객체를 가져옴
				if(listeners = this[LISTENER][event]){
					let ev = this[EVENT].init(event);
					for(let listener of listeners){
						listener(ev); //리스너를 차례로 콜하다가
						if(ev.isStopPropagation) return; //전파중지되면 중지
					}
				}
			}
			//리스너가 지정되지 않으면 기본값발동으로 인해 예외를 발생시키고 죽어버림
			addListener(event, listener){
				let listeners = this[LISTENER][event] || (this[LISTENER][event] = new Set()); //해당 이벤트 명으로 아직 등록한적이 없으면 set을 생성
				listeners.add(listener); //거기에 추가함. set은 알아서 중복된 객체를 무시하는 기능이 있음
			}
			removeListener(event, listener = null){ //리스너를 안주면 해당 이벤트를 다 날림
				let listeners = this[LISTENER][event];
				if(listeners) listener ? listeners.delete(listener) : listeners.clear(); //해당 리스너를 지우거나 다 날림
			}
			setOffset(x, y){
				this[BOUNDRECT].x = x, this[BOUNDRECT].y = y;
			}
			setSize(width, height){
				this[BOUNDRECT].width = width, this[BOUNDRECT].height = height;
			}
			getBoundRect(){
				let rect = this[BOUNDRECT];
				if(!this.style._margin) return rect;
				bound.x = rect.x + this.style._margin[3];
				bound.y = rect.y + this.style._margin[0];
				bound.width = rect.width;
				bound.height = rect.height;
				return bound;
			}
			[_ONDRAW](paint){
				paint.startDraw(this);
				this[ONDRAW](paint);
				paint.endDraw(this);
			}
			[ONDRAW](paint){}
		};
	})();
	const DisplayContainer = class extends Display{
		constructor(isBlock){
			super(isBlock);
			Object.defineProperties(this, {
				[CHILDREN]:{value:[]},
				[_CHILDREN]:{value:new Map()}
			});
		}
		addChild(display){
			if(!(display instanceof Display)) return;
			this.removeChild(display);
			this[_CHILDREN][display.id] = display;
			this[CHILDREN].push(display);
		}
		removeChild(display){
			if(!(display instanceof Display) || !this[_CHILDREN][display.id]) return;
			this[_CHILDREN].delete(display.id);
			this[CHILDREN].splice(this[CHILDREN].indexOf(display), 1);
		}
		getChildAt(index){
			return this[CHILDREN].length <= index ? null : this[CHILDREN][index];
		}
		getChildById(id){
			return this[_CHILDREN][display.id] || null;
		}
		[_ONDRAW](paint){
			super[_ONDRAW](paint);
			for(let child of this[CHILDREN]) child[_ONDRAW](paint);
		}
		[ONMEASURE](parentWidth, parentHeight){ //overflow처리를 위해서는 totalW관련 처리를 통해 인지해야함
			let totalH = 0, lineW = 0, lineH = 0;
			Css.size(this.style, parentWidth, parentHeight);
			for(let child of this[CHILDREN]){
				let {width, height} = child[Display.onMeasure](parentWidth, 0);
				child.setSize(width, height);
				let [marginT, marginR, marginB, marginL] = Css.margin(child.style);
				width += marginL + marginR;
				height += marginB + marginT;
				if(child.isBlock){
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
			case'justify': //이후구현
			}
			return {width:parentWidth, height:totalH};
		}
	};
	return v = {
		Event, Display, DisplayContainer, Stage,
		spread:()=>{
			for(let k in v) window[k] = v[k];
		}
	};
})();
