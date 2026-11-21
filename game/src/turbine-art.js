import { deck } from './levels.js';

export function paintTurbineHall(c, shape, circle, light, label) {
  const { x, y, w, h } = deck;
  shape(c, [[34,174],[110,92],[1032,92],[1116,164],[1116,597],[1052,651],[94,651],[34,591]],
    '#241b22', '#a37261', 2);
  const iron = c.createLinearGradient(0,y,0,y+h);
  iron.addColorStop(0,'#553940');
  iron.addColorStop(.5,'#312634');
  iron.addColorStop(1,'#48323b');
  c.fillStyle = iron;
  c.fillRect(x,y,w,h);
  c.strokeStyle = '#ae7867';
  c.strokeRect(x,y,w,h);
  for (const yy of [141,551,588]) {
    shape(c,[[66,yy],[332,yy],[365,yy+14],[815,yy+14],[847,yy],[1084,yy]],
      null,'#1b1723',20,false);
    shape(c,[[66,yy-3],[332,yy-3],[365,yy+11],[815,yy+11],[847,yy-3],[1084,yy-3]],
      null,'#9d746049',2,false);
    for (let i=0;i<44;i++) circle(c,70+i*23,yy+2+(i>=13&&i<=33?14:0),1.5,'#c59c78a0');
  }
  for (let i=0;i<290;i++) {
    const xx = 59+(i*73.41)%1010;
    const yy = 118+(i*36.17)%504;
    shape(c,[[xx,yy],[xx+3+(i%6)*4,yy-1]],null,i%3?'#e6b78b1f':'#130e1d65',1,false);
  }
  for (const [xx,yy] of [[120,562],[352,473],[768,288],[1018,174]]) light(c,xx,yy,103,'#f1a45e46');
  for (const xx of [160,389,695,922]) {
    shape(c,[[xx,628],[xx+11,648],[xx+1,660],[xx-8,648]],'#352636','#8c6968');
    for (let i=0;i<5;i++) shape(c,[[xx-14-i*2,665+i*4],[xx+18+i*2,665+i*4]],null,'#d6996560',1,false);
  }
  label(c,'01 / PUMP BAY',243,324,'#e2b79c',12);
  label(c,'CROSSOVER',561,326,'#e2b79c',12);
  label(c,'BYPASS CATWALK  →',583,569,'#e2b79c',13);
  label(c,'LADDER ACCESS',1003,465,'#e2b79c',12);
}

export function paintTurbineCover(c, b, shape, circle, label) {
  const { x,y,w,h,kind } = b;
  if (kind === 'rail' || kind === 'baffle') {
    shape(c,[[x,y],[x+w,y],[x+w,y+h],[x,y+h]],'#a16d5c','#edb486');
    if (kind === 'rail') {
      for (let yy=y+7;yy<y+h;yy+=16) circle(c,x+w/2,yy,2.5,'#30212b');
    } else {
      for (let xx=x+7;xx<x+w;xx+=12) circle(c,xx,y+h/2,2.5,'#30212b');
    }
    return;
  }
  shape(c,[[x+8,y+10],[x+w+10,y+10],[x+w+11,y+h+13],[x+7,y+h+13]],'#120d19a0');
  shape(c,[[x,y+8],[x+8,y],[x+w-8,y],[x+w,y+8],[x+w,y+h],[x,y+h]],
    '#241c26','#1b1420',2);
  shape(c,[[x+4,y+9],[x+11,y+4],[x+w-11,y+4],[x+w-4,y+9],[x+w-4,y+h-7],[x+4,y+h-7]],
    '#614644','#af7b64');
  for (let xx=x+12;xx<x+w-7;xx+=18) {
    circle(c,xx,y+9,1.7,'#dfb17c');
    circle(c,xx,y+h-14,1.7,'#dfb17c');
  }
  if (kind === 'bulkhead') {
    for (let xx=x+13;xx<x+w-14;xx+=17) {
      shape(c,[[xx,y+h-24],[xx+12,y+18]],null,'#c893625e',4,false);
    }
    return;
  }
  const cy=y+h/2-3;
  label(c,y<300?'INTAKE A':'INTAKE B',x+w/2,cy+4,'#ffcb93',12);
  for (const cx of [x+56,x+w-56]) {
    circle(c,cx,cy,39,'#201a26','#e4a16e',2);
    circle(c,cx,cy,32,'#483140','#81645c',2);
    for (let i=0;i<9;i++) {
      const a=i*Math.PI*2/9;
      c.save();
      c.translate(cx,cy);
      c.rotate(a);
      shape(c,[[5,-3],[25,-12],[29,-4],[14,6]],'#9f6a58','#cc9770');
      c.restore();
    }
    circle(c,cx,cy,9,'#d79f75','#2b202b',2);
  }
}
