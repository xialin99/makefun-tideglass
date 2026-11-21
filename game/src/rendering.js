import { deck, width, height } from './levels.js';
import { beam } from './guard-senses.js';
import { outage } from './relay.js';
import { paintTurbineHall, paintTurbineCover } from './turbine-art.js';

const tau = Math.PI * 2;
const ink = '#091620';
const mint = '#83f4d8';

function circle(c, x, y, r, fill, stroke, weight = 1) {
  c.beginPath();
  c.arc(x, y, r, 0, tau);
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = weight; c.stroke(); }
}

function shape(c, points, fill, stroke, weight = 1, closed = true) {
  c.beginPath();
  points.forEach(([x, y], index) => index ? c.lineTo(x, y) : c.moveTo(x, y));
  if (closed) c.closePath();
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = weight; c.stroke(); }
}

function label(c, text, x, y, color, size = 12, align = 'center') {
  c.fillStyle = color;
  c.font = `650 ${size}px "Segoe UI", sans-serif`;
  c.textAlign = align;
  c.fillText(window.t(text), x, y);
}

function light(c, x, y, r, color) {
  const glow = c.createRadialGradient(x, y, 0, x, y, r);
  glow.addColorStop(0, color);
  glow.addColorStop(1, '#0000');
  circle(c, x, y, r, glow);
}

function water(c) {
  const sea = c.createLinearGradient(50, 90, 760, 700);
  sea.addColorStop(0, '#12303e');
  sea.addColorStop(.56, '#071623');
  sea.addColorStop(1, '#194452');
  c.fillStyle = sea;
  c.fillRect(-width, -height, width * 3, height * 3);
  for (let i = 0; i < 860; i++) {
    const x = (i * 371.17) % width;
    const y = (i * 41.17) % height;
    const length = 6 + (i * 19) % 69;
    shape(c, [[x, y], [x + length * .42, y - 2], [x + length, y + 1]],
      null, i % 5 ? '#4293a225' : '#a5e8df34', 1, false);
  }
}

function architecture(c) {
  shape(c, [[22,156],[88,89],[1063,89],[1123,149],[1123,591],[1080,657],[84,657],[24,596]],
    '#10212d','#52717b',2);
  shape(c, [[38,152],[94,102],[1053,102],[1110,151],[1110,589],[1075,641],[87,641],[39,588]],
    '#142631','#243d49',3);
  const {x,y,w,h} = deck;
  const floor = c.createLinearGradient(x,y,x+w,y+h);
  floor.addColorStop(0,'#293f4b');
  floor.addColorStop(.6,'#192c3b');
  floor.addColorStop(1,'#283d45');
  c.fillStyle = floor;
  c.fillRect(x,y,w,h);
  c.save();
  c.beginPath(); c.rect(x,y,w,h); c.clip();
  for (let row = 0; row < 22; row++) {
    for (let col = -1; col < 22; col++) {
      const xx = x + col * 52 + (row % 2) * 26;
      const yy = y + row * 24;
      c.fillStyle = ['#71949f09','#06121b23','#abc4b60b','#869c9f13'][(row * 7 + col * col) % 4];
      c.fillRect(xx,yy,51,23);
      c.strokeStyle = '#07192338';
      c.strokeRect(xx,yy,52,24);
      shape(c,[[xx+5,yy+3],[xx+25,yy+3],[xx+37,yy+4]],null,'#b5d0cd11',1,false);
    }
  }
  for (const [xx,yy] of [[170,199],[980,200],[576,366],[1016,558]]) light(c,xx,yy,130,'#66e5e137');
  for (const [xx, yy] of [[111, 532],[360, 367],[747, 508],[972, 285]]) {
    shape(c, [[xx,yy],[xx+25,yy],[xx+36,yy+13],[xx+25,yy+26],[xx,yy+26],[xx+10,yy+13]],
      '#d5ba6e24','#c0ae6250');
  }
  c.restore();
  c.strokeStyle = '#657e86';
  c.strokeRect(x,y,w,h);
  for (const [xx, yy] of [[170,199],[980,200]]) {
    for (const r of [44,51,59]) {
      c.beginPath();
      c.arc(xx,yy,r,.14,Math.PI-.14);
      c.strokeStyle = r === 59 ? '#6a9f9880' : '#709b9b40';
      c.stroke();
    }
    for (let i=0;i<13;i++) {
      const a=.2+i*(Math.PI-.4)/12;
      shape(c,[[xx+55*Math.cos(a),yy+55*Math.sin(a)],[xx+59*Math.cos(a),yy+59*Math.sin(a)]],
        null,'#91c7b6a0',1,false);
    }
  }
  for (const xx of [190, 362, 748, 888]) {
    shape(c,[[xx-17,632],[xx-10,648],[xx+11,648],[xx+18,632]],'#102b39','#64818b');
    shape(c,[[xx-10,648],[xx-19,660],[xx+19,660],[xx+11,648]],'#152633','#375662');
    for (let i=1;i<=6;i++) shape(c,[[xx-14-i*1.9,660+i*4],[xx+13+i*2.7,660+i*4]],
      null,i%2?'#478c924f':'#b6aa7371',1,false);
  }
  for (let xx = 81; xx < 1080; xx += 34) {
    for (const yy of [107,635]) {
      shape(c,[[xx-12,yy],[xx+12,yy]],null,'#506872',2,false);
      circle(c,xx,yy,2,'#ac9977');
    }
  }
  label(c,'WEST ARCADE',108,399,'#a6bdc1',11);
  label(c,'MERIDIAN WALK',575,482,'#a6bdc1',13);
  label(c,'SERVICE CATWALK',577,610,'#a4b9bf',11);
  label(c,'GATE APPROACH',840,551,'#a4b9bf',11);
}

function furniture(c, b) {
  const {x,y,w,h,kind} = b;
  shape(c, [[x-5,y+9],[x+w+10,y+9],[x+w+15,y+h+13],[x+12,y+h+17]], '#030a13a0');
  shape(c, [[x,y+7],[x+7,y],[x+w-7,y],[x+w,y+7],[x+w,y+h],[x,y+h]], '#101f2a','#060e17',2);
  shape(c, [[x+4,y+7],[x+11,y+3],[x+w-11,y+3],[x+w-4,y+8],[x+w-4,y+h-10],[x+4,y+h-10]],
    kind === 'wall' ? '#3a505d' : '#223b47','#718f91');
  shape(c, [[x+3,y+h-9],[x+w-3,y+h-9]],null,'#07131d',3,false);
  if (kind === 'wall') {
    for (let row=0; row<3; row++) for (let xx=x+7; xx<x+w-18; xx+=28) {
      const offset = row % 2 * 7;
      shape(c, [[xx+offset,y+10+row*11],[xx+offset+15,y+10+row*11],[xx+offset+18,y+12+row*11]],
        null,'#8ca4a075',1,false);
    }
  } else if (kind === 'rack') {
    for (let xx = x+16; xx<x+w-13; xx+=20) for (let yy=y+15; yy<y+h-15; yy+=22) {
      shape(c, [[xx-6,yy-4],[xx+6,yy-4],[xx+8,yy+5],[xx-7,yy+5]],'#0a2029','#538691');
      shape(c, [[xx-4,yy+1],[xx-1,yy-2],[xx+2,yy+2],[xx+5,yy-1]],null,
        (xx+yy)%3 ? '#7fddcd' : '#d6ad71',1,false);
    }
  } else {
    const cx=x+w/2, cy=y+h/2-4;
    for (const [r, fill, stroke] of [[52,'#142b38','#ae8a51'],[46,'#071a26','#6d8585'],[37,'#1d5264','#ddb477'],[28,'#153a4e','#6de4da'],[16,'#459aa5','#87eeeb']]) {
      circle(c,cx,cy,r,fill,stroke,2);
    }
    for (let i=0; i<20; i++) {
      const a=i*tau/20;
      circle(c,cx+48*Math.cos(a),cy+48*Math.sin(a),2,'#dfb37d');
    }
    light(c,cx-7,cy-8,31,'#b7fff0a0');
    label(c,'AZIMUTH',x+30,cy+3,'#daaf75',9);
    label(c,'LENS',x+w-27,cy+3,'#daaf75',9);
  }
}

function marker(c, x, y, title, detail, color) {
  const w = Math.max(title.length * 9 + 18, detail.length * 6.7 + 16);
  shape(c,[[x-w/2,y],[x+w/2-5,y],[x+w/2,y+5],[x+w/2,y+36],[x-w/2,y+36]],
    '#091823f5',color);
  label(c,title,x,y+15,color,13);
  label(c,detail,x,y+29,'#d0e0e2',10);
}

function powerZone(c, map, state) {
  if (!map.relay) return;
  const z=map.relay.zone;
  const dark=outage(state)>0;
  c.fillStyle=dark?'#12102c91':'#ffad5b09';
  c.fillRect(z.x,z.y,z.w,z.h);
  c.setLineDash([9,6]);
  c.strokeStyle=dark?'#cbc0ff':'#eda67dad';
  c.strokeRect(z.x,z.y,z.w,z.h);
  c.setLineDash([]);
  label(c,dark?'DIM ZONE · SHORTER VISION':'SECTION LIGHTING',z.x+z.w/2,z.y-10,
    dark?'#ddd0ff':'#e8b58f',13);
}

function objects(c, map, state) {
  if (map.relay) {
    const {x,y}=map.relay;
    const color=outage(state)>0?'#d7c3ff':'#ffc18f';
    light(c,x,y,62,'#e1a46e69');
    circle(c,x,y,17,'#35283d',color,2);
    shape(c,[[x+1,y-9],[x-5,y],[x,y],[x-2,y+9],[x+6,y-2],[x+1,y-2]],color);
    marker(c,x,y+23,'LIGHT RELAY',state.relayUsed?'RELAY SPENT':'DIM + NOISE · E',color);
  }
  for (const t of map.tapes) {
    const taken = state.tapes.has(t.id);
    const color = taken ? '#81999d' : '#9cefe8';
    if (!taken) light(c,t.x,t.y,62,'#6defd75b');
    circle(c,t.x,t.y,25,'#0c2732',color,2);
    shape(c,[[t.x-13,t.y-8],[t.x+13,t.y-8],[t.x+13,t.y+8],[t.x-13,t.y+8]],'#234553',color);
    for (const dx of [-6,6]) circle(c,t.x+dx,t.y,3,ink,color);
    marker(c,t.x,t.y-70,`${t.id} / ${window.t(t.name)}`,taken ? 'RECOVERED' : t.detail ?? 'RECORDING · E',color);
  }
  const [x,y] = map.exit;
  light(c,x,y,101,'#42e7b36f');
  shape(c, [[x-54,y-32],[x+37,y-32],[x+54,y-14],[x+54,y+28],[x-54,y+28]],
    '#102c36',mint,2);
  for (let i=-42; i<=44; i+=11) shape(c,[[x+i,y-22],[x+i,y+20]],null,'#50b59e66',2,false);
  marker(c,x,y-40,map.relay?'ESCAPE LADDER / EXIT':'TIDE GATE / EXIT',
    state.tapes.size === map.tapes.length ? 'READY · E' : map.relay?'NEEDS READOUT':'NEEDS BOTH LOGS',mint);
  if (!map.relay) {
    label(c,'SKIFF ↘',x-53,y+53,mint,11);
    shape(c,[[1016,625],[1030,644],[1025,672],[1007,672],[1002,644]],'#2e4b55','#78acaa',2);
    shape(c,[[1007,648],[1024,648],[1022,659],[1010,659]],'#071d26','#a99c6e');
  }
}

function guards(c, state, map) {
  for (const [i,g] of state.guards.entries()) {
    const color = g.suspicion > .14 ? '#ff98aa' : '#ffd48c';
    const gradient = c.createRadialGradient(g.x,g.y,0,g.x,g.y,g.range ?? 169);
    gradient.addColorStop(0, g.suspicion > .14 ? '#ff8da681' : '#ffcb7378');
    gradient.addColorStop(1, g.suspicion > .14 ? '#ff8da622' : '#ffcb731c');
    shape(c, [[g.x,g.y], ...beam(g,map.cover)], gradient, color + 'b5');
    actor(c,g,color,false);
    label(c,g.mode === 'tracking' ? '!' : g.mode === 'investigating' ? '?' : `W${i+1}`,
      g.x,g.y-18,color,12);
    if (g.suspicion > .04) {
      c.fillStyle = '#0a1924';
      c.fillRect(g.x-14,g.y-34,28,4);
      c.fillStyle = color;
      c.fillRect(g.x-14,g.y-34,28*g.suspicion,4);
    }
  }
}

function actor(c, a, color, player) {
  c.save();
  c.translate(a.x,a.y);
  c.rotate(a.angle);
  circle(c,2,2,13,'#050b14ad');
  shape(c,[[-8,-8],[1,-10],[8,-6],[8,6],[1,10],[-8,8]],player?'#246c71':'#684456',color,2);
  circle(c,3,0,a.low?4:6,player?'#ccfbeb':'#f9d9ad',ink);
  shape(c,[[9,-3],[15,0],[9,3]],color);
  c.restore();
}

function effects(c,state,aim) {
  for (const r of state.rings) {
    const phase = (state.time-r.birth)/.78;
    const opacity = Math.round((1-phase)*155).toString(16).padStart(2,'0');
    const color=r.name==='relay'?'#d5b2ff':r.name==='toss'?'#87e9ff':'#e2c898';
    circle(c,r.x,r.y,3+r.radius*phase,null,color+opacity,1.5);
  }
  const p=state.player;
  if (aim && !state.result) {
    const color=state.cooldown>0?'#7b9ca7':aim.valid?mint:'#f4999b';
    c.setLineDash([3,6]);
    shape(c,[[p.x,p.y],[aim.x,aim.y]],null,color,1,false);
    c.setLineDash([]);
    circle(c,aim.x,aim.y,9,null,color);
  }
  if (state.flight) {
    const a = state.flight;
    const f = Math.min(1,(state.time-a.time)/.32);
    circle(c,a.from.x+(a.target.x-a.from.x)*f,a.from.y+(a.target.y-a.from.y)*f-Math.sin(f*Math.PI)*20,
      4,'#defaff',mint);
  }
}

export function createRenderer(canvas,map) {
  const c=canvas.getContext('2d');
  const scenery=document.createElement('canvas');
  scenery.width=width;
  scenery.height=height;
  const background=scenery.getContext('2d');
  water(background);
  if (map.relay) {
    paintTurbineHall(background,shape,circle,light,label);
    map.cover.forEach(b=>paintTurbineCover(background,b,shape,circle,label));
  } else {
    architecture(background);
    map.cover.forEach(b=>furniture(background,b));
  }
  let scale=1, offsetX=0, offsetY=0;
  return {
    pointer(event) {
      return {x:(event.offsetX-offsetX)/scale,y:(event.offsetY-offsetY)/scale};
    },
    draw(state,aim) {
      const w=canvas.clientWidth, h=canvas.clientHeight;
      const pixelRatio=Math.min(devicePixelRatio,2);
      if (canvas.width!==Math.round(w*pixelRatio) || canvas.height!==Math.round(h*pixelRatio)) {
        canvas.width=Math.round(w*pixelRatio);
        canvas.height=Math.round(h*pixelRatio);
      }
      const top=h<=540 ? canvas.parentElement.querySelector('header').offsetHeight : 0;
      const bottom=h<=540 ? canvas.parentElement.querySelector('footer').offsetHeight : 0;
      scale=Math.min(w/width,(h-top-bottom)/(h<=540 ? 604 : height));
      offsetX=(w-width*scale)/2;
      offsetY=top+(h-top-bottom-height*scale)/2;
      c.setTransform(pixelRatio,0,0,pixelRatio,0,0);
      c.fillStyle='#0b1f2c';
      c.fillRect(0,0,w,h);
      c.translate(offsetX,offsetY);
      c.scale(scale,scale);
      c.drawImage(scenery,0,0);
      powerZone(c,map,state);
      guards(c,state,map);
      objects(c,map,state);
      effects(c,state,aim);
      actor(c,state.player,mint,true);
      label(c,state.player.low?'LOW':'YOU',state.player.x,state.player.y+27,mint,11);
      if (state.result==='caught') {
        c.fillStyle='#df19322b';
        c.fillRect(0,0,width,height);
      }
    },
  };
}
