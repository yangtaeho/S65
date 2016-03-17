class Div extends V.DisplayContainer{
	constructor(){
		super('DIV', true);
	}
	[V.Display.DRAW](paint){
		paint[V.Paint.rect](this);
	}
	[V.Display.MEASURE](parentWidth, parentHeight){
		return super[V.Display.MEASURE](parentWidth, parentHeight);
	}
};
class Img extends V.Display{
	constructor(src){
		super('IMG', false);
		Object.defineProperties(this, {
			src:{value:src},
			img:{value:(_=>{
				let img = document.createElement('img');
				img.src = src;
				img.onload = ()=>{
					this.loaded = true;
					this.dispatch('load');
				};
				return img;
			})()},
			loaded:{value:false, writable:true}
		});
	}
	[V.Display.DRAW](paint){
		paint[V.Paint.image](this);
	}
	[V.Display.MEASURE](parentWidth, parentHeight){
		if(this.loaded) return {width:this.img.width, height:this.img.height};
		else return {width:0, height:0};
	}
};
class Span extends V.Display{
	constructor(text){
		super('SPAN', false);
		this.text = text;
	}
	[V.Display.DRAW](paint){
		paint[V.Paint.text](this);
	}
	[V.Display.MEASURE](parentWidth, parentHeight){
		let height;
		if(height = this.style.fontSize) height = parseFloat(height);
		else height = 10;
		height *= this.text.split('\n').length;
		return {width:CanvasPaint.textWidth(this), height};
	}
}