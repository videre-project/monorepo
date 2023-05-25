#!/usr/bin/env node

/* @file
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */


// Check for ES6 Support
var supportsES6 = function() {
  try {
    new Function("(a = 0) => a");
    return 'True';
  }
  catch (err) {
    return 'False';
  }
}();

const release_artifacts = process.argv[3].split(', ')

console.log(`=== NODEJS INFORMATION ===
NodeJS:
├── Path: ${process.env._}
├── Version: v${process.versions['node']}
|   ├── Branch: v${release_artifacts[1].split('Version ')[1]}
|   ├── Build: ${release_artifacts[2].split(' ')[1]}:${process.argv[4]}
|   └── Date: ${release_artifacts[0]}
└── Features:
    └── Supports-ES6: ${supportsES6}
V8 Engine
└── Version: ${process.argv[2]}`)
