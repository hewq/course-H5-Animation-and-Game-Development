"use strict";
cc._RF.push(module, '8d5d9WHfbJI4ZAsvJ7P9Eeu', 'kmMat4AreEqual');
// frameworks/cocos2d-html5/cocos2d/kazmath/simd_benchmark/kmMat4AreEqual.js

"use strict";

// kmMat4AreEqual

(function () {

  // Kernel configuration
  var kernelConfig = {
    kernelName: "kmMat4AreEqual",
    kernelInit: init,
    kernelCleanup: cleanup,
    kernelSimd: simd,
    kernelNonSimd: nonSimd,
    kernelIterations: 10000
  };

  // Hook up to the harness
  benchmarks.add(new Benchmark(kernelConfig));

  // Benchmark data, initialization and kernel functions
  var T1 = new cc.kmMat4();
  var T2 = new cc.kmMat4();
  var T1x4 = new cc.kmMat4();
  var T2x4 = new cc.kmMat4();
  var areEqual, areEqualSIMD;

  function equals(A, B) {
    for (var i = 0; i < 16; ++i) {
      if (A[i] != B[i]) return false;
    }
    return true;
  }

  function init() {
    T1.mat[0] = 1.0;
    T1.mat[5] = 1.0;
    T1.mat[10] = 1.0;
    T1.mat[15] = 1.0;

    T2.mat[0] = 1.0;
    T2.mat[5] = 1.0;
    T2.mat[10] = 1.0;
    T2.mat[15] = 1.0;

    T1x4.mat[0] = 1.0;
    T1x4.mat[5] = 1.0;
    T1x4.mat[10] = 1.0;
    T1x4.mat[15] = 1.0;

    T2x4.mat[0] = 1.0;
    T2x4.mat[5] = 1.0;
    T2x4.mat[10] = 1.0;
    T2x4.mat[15] = 1.0;

    nonSimd(1);
    simd(1);

    return equals(T1.mat, T1x4.mat) && equals(T2.mat, T2x4.mat) && areEqual === areEqualSIMD;
  }

  function cleanup() {
    return init(); // Sanity checking before and after are the same
  }

  function nonSimd(n) {
    for (var i = 0; i < n; i++) {
      areEqual = T1.equals(T2);
    }
  }

  function simd(n) {
    for (var i = 0; i < n; i++) {
      areEqualSIMD = T1x4.equalsSIMD(T2x4);
    }
  }
})();

cc._RF.pop();