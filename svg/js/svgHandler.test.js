var svg = $VG().css({
                border: '1px solid black',
                width: '960px',
                height: '540px'
            }).viewBox(0, 0, 960, 540)
              .appendTo(document.body);

//line
svg.addLine().stroke('black', 2).pos(10, 10, 90, 60);
svg.addLine().id('myLine').className('clsLine').stroke('black', 1, '1 1').pos(10, 20, 90, 70);
$VG('<line>').stroke('green', 3, null, 'round').pos(10, 30, 90, 80).appendTo(svg);
$VG('<line stroke="red" x1="10" y1="40" x2="90" y2="90" />').appendTo(svg);

//rect
svg.addRect().pos(110, 10, 90, 90);
svg.addRect().fill('none').stroke('white').pos(115, 15, 80, 80);
svg.addRect().fill('yellow').pos(120, 20, 70, 70).radius(5);
$VG('<rect>').fill('red').pos(125, 25, 60, 60).radius(10, 30).appendTo(svg);
                                                                      
                                                                    