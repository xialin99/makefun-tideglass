export const width = 1152;
export const height = 720;
export const deck = { x: 54, y: 112, w: 1044, h: 518 };

export const observatory = {
  name: 'BELLWETHER OBSERVATORY',
  start: [115, 556],
  exit: [1016, 558],
  tapes: [
    { x: 170, y: 199, id: 'A', name: 'TIDE LOG' },
    { x: 980, y: 200, id: 'B', name: 'GATE ORDER' },
  ],
  cover: [
    { x: 232, y: 229, w: 102, h: 132, kind: 'rack' },
    { x: 156, y: 418, w: 190, h: 53, kind: 'wall' },
    { x: 425, y: 146, w: 244, h: 63, kind: 'rack' },
    { x: 478, y: 310, w: 196, h: 124, kind: 'lens' },
    { x: 419, y: 524, w: 320, h: 52, kind: 'wall' },
    { x: 796, y: 237, w: 93, h: 122, kind: 'rack' },
    { x: 841, y: 444, w: 171, h: 50, kind: 'wall' },
    { x: 971, y: 327, w: 126, h: 40, kind: 'wall' },
  ],
  patrols: [
    [[386, 406], [386, 276], [366, 276], [366, 406]],
    [[757, 306], [757, 474], [712, 474], [712, 306]],
    [[939, 389], [1051, 389], [1051, 416], [939, 416]],
  ],
};

export const turbineHall = {
  name: 'FLOODGATE TURBINE HALL',
  start: [115, 560],
  exit: [1018, 174],
  tapes: [{ x: 768, y: 288, id: 'C', name: 'GATE RELAY', detail: 'READOUT · E' }],
  relay: { x: 352, y: 473, seconds: 14, zone: { x: 419, y: 190, w: 487, h: 323 } },
  cover: [
    { x: 141, y: 337, w: 161, h: 67, kind: 'bulkhead' },
    { x: 182, y: 191, w: 195, h: 73, kind: 'bulkhead' },
    { x: 434, y: 201, w: 240, h: 103, kind: 'turbine' },
    { x: 434, y: 397, w: 240, h: 103, kind: 'turbine' },
    { x: 815, y: 211, w: 74, h: 104, kind: 'bulkhead' },
    { x: 794, y: 433, w: 99, h: 70, kind: 'bulkhead' },
    { x: 924, y: 388, w: 8, h: 109, kind: 'rail' },
    { x: 917, y: 209, w: 74, h: 21, kind: 'baffle' },
    { x: 956, y: 343, w: 141, h: 59, kind: 'bulkhead' },
  ],
  patrols: [
    [[377, 365], [377, 290], [103, 290], [103, 320], [377, 320]],
    [[605, 351], [873, 351], [873, 376], [480, 376], [480, 351]],
    [[940, 511], [940, 245], [1039, 245], [1039, 304], [940, 304]],
  ],
};

export const missions = [observatory, turbineHall];
