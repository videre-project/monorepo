#!/usr/bin/env python

## @file
# Copyright (c) 2023, The Videre Project Authors. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
##

import platform, subprocess, sys


python_path = subprocess.check_output("which python", shell=True).strip()
python_path = python_path.decode('utf-8')

print(f"""\n=== PYTHON INFORMATION ===
Python:
├── Path: {python_path}
|   └── Virtualenv: {hasattr(sys, "real_prefix")}
├── Version: {platform.python_version()}
|   ├── Branch: {platform.python_branch()}
|   ├── Build: {platform.python_build()[0]}
|   └── Date: {platform.python_build()[1]}
├── Compiler version: {platform.python_compiler()}
└── Implementation: {platform.python_implementation()}
""")
