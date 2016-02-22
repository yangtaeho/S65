class Div extends V.DisplayContainer{
	constructor(){
		super(true);
	}
	[V.Display.onDraw](paint){
		paint.drawRect(this);
	}
	[V.Display.onMeasure](parentWidth, parentHeight){
		return super[V.Display.onMeasure](parentWidth, parentHeight);
	}
};
class Img extends V.Display{
	constructor(src){
		super(false);
		Object.defineProperties(this, {
			src:{value:src},
			img:{value:(()=>{
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
	[V.Display.onDraw](paint){
		paint.drawImage(this);
	}
	[V.Display.onMeasure](parentWidth, parentHeight){
		if(this.loaded) return {width:this.img.width, height:this.img.height};
		else return {width:0, height:0};
	}
};
