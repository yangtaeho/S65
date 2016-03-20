const Css = class{
	static margin(style){
		let marginL = 0, marginR = 0, marginT = 0, marginB = 0, v;
		let rect = style._margin || (style._margin = []);
		if(v = style.margin){
			if(typeof v == 'number') marginT = marginB = marginR = marginL = v;
			else{
				v = v.split(' ').map(parseFloat);
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
	};
	static padding(style){
		let paddingL = 0, paddingR = 0, paddingT = 0, paddingB = 0, v;
		let rect = style._padding || (style._padding = []);
		if(v = style.padding){
			if(typeof v == 'number') paddingT = paddingB = paddingR = paddingL = v;
			else{
				v = v.split(' ').map(parseFloat);
				if(v.length == 2) paddingT = paddingB = v[0], paddingR = paddingL = v[1];
				else if(v.length == 4) paddingT = v[0], paddingR = v[1], paddingB = v[2], paddingL = v[3];
			}
		}
		if(v = style.paddingLeft) paddingL = v;
		if(v = style.paddingRight) paddingR = v;
		if(v = style.paddingTop) paddingT = v;
		if(v = style.paddingBottom) paddingB = v;
		rect[0] = paddingT, rect[1] = paddingR, rect[2] = paddingB, rect[3] = paddingL;
		return rect;
	};
};
