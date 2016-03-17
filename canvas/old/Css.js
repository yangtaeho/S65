const Css = class{
	static margin(style){
		let marginL = 0, marginR = 0, marginT = 0, marginB = 0, v;
		let rect = style._margin || (style._margin = []);
		if(v = style.margin){
			if(typeof v == 'number') marginT = marginB = marginR = marginL = v;
			else{
				v = v.split(' ');
				v.forEach((val,i)=>(v[i] = parseFloat(val)));
				if(v.length == 2) marginT = marginB = v[0], marginR = marginL = v[1];
				else if(v.length == 4) marginT = v[0], marginR = v[1], marginB = v[2], marginL = v[3];
			}
		}
		if(v = style.marginLeft) marginL = v;
		if(v = style.marginRight) marginR = v;
		if(v = style.marginTop) marginT = v;
		if(v = style.marginBottom) marginB = v;
		rect[0] = marginT, rect[1] = marginR, rect[2] = marginB, rect[3] = marginL;
		return rect;
	}
	static size(style, parentWidth, parentHeight){
		if('width' in style){
		}
	}
};
