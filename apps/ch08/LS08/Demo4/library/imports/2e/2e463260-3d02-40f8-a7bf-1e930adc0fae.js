"use strict";
cc._RF.push(module, '2e463JgPQJA+Ke/HpMK3A+u', 'run');
// frameworks/cocos2d-html5/cocos2d/kazmath/simd_benchmark/run.js

"use strict";

var cc = {};

load('base.js');

load('../utility.js');
load('../vec3.js');
load('../vec4.js');
load('../mat4.js');
load('../vec3SIMD.js');
load('../mat4SIMD.js');

// load individual benchmarks
load('kernel-template.js');
load('kmMat4Multiply.js');
load('kmMat4Assign.js');
load('kmMat4AreEqual.js');
load('kmMat4Inverse.js');
load('kmMat4IsIdentity.js');
load('kmMat4Transpose.js');
load('kmMat4LookAt.js');
load('kmVec3TransformCoord.js');

function printResult(str) {
  print(str);
}

function printError(str) {
  print(str);
}

function printScore(str) {
  print(str);
}

benchmarks.runAll({ notifyResult: printResult,
  notifyError: printError,
  notifyScore: printScore }, true);

cc._RF.pop();