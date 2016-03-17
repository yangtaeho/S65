const CanvasPaint = (([background, stroke, font])=>{
	return class extends V.Paint{
		constructor(canvas){
			super(canvas.width, canvas.height);
			this.cx = canvas.getContext('2d');
		}
		static textWidth(display){
			const c = new CanvasPaint(document.createElement('canvas'));
			c[font](display.style);
			return c.cx.measureText(display.text).width;
		}
		[background](style) {
			if (!style.backgroundColor) return;
			this.cx.fillStyle = style.backgroundColor;
			this.cx.fillRect(0, 0, this.elWidth, this.elHeight);
		}		
		[stroke](style){
			let t0;
			if(!style.border || (t0 = style.border.split(/\s+/)).length != 2) return;
			for(let t1 of t0){
				if (t1.match(/(\d+)/)) this.cx.lineWidth = parseFloat(t1);
				else this.cx.strokeStyle = t1;
			}
			this.cx.strokeRect(0, 0, this.elWidth, this.elHeight);
		}
		[font](style){
			this.cx.fillStyle = style.color || '#000000';
			this.cx.font = (style.fontSize || '10px') + ' ' + (style.fontFamily || 'san-serif');
			this.cx.translate(0, parseFloat(this.cx.font));
		}
		[V.Paint.BOUND]({x, y, width, height}){
			this.cx.save();
			this.cx.translate(x,y);
			this.elWidth = width;
			this.elHeight = height;
		}
		[V.Paint.RESET](){
			this.cx.clearRect(0, 0, this.width, this.height);
		}
		[V.Paint.START](display){
			this[V.Paint.BOUND](display.boundRect);
			this[background](display.style);
		}
		[V.Paint.END](display){
			this[stroke](display.style);
			this.cx.restore();
		}
		[V.Paint.RECT](display){}
		[V.Paint.IMAGE](display){
			this.cx.drawImage(display.img, 0, 0, this.elWidth, this.elHeight);
		}
		[V.Paint.TEXT](display){
			this[font](display.style);
			this.cx.fillText(display.text, 0, 0);
		}
	};
})(V.N(Symbol, 4))