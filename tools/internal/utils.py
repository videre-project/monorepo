# Copyright 2008 the V8 project authors. All rights reserved.
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are
# met:
#
#     * Redistributions of source code must retain the above copyright
#       notice, this list of conditions and the following disclaimer.
#     * Redistributions in binary form must reproduce the above
#       copyright notice, this list of conditions and the following
#       disclaimer in the documentation and/or other materials provided
#       with the distribution.
#     * Neither the name of Google Inc. nor the names of its
#       contributors may be used to endorse or promote products derived
#       from this software without specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
# "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
# LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
# A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
# OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
# SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
# LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
# DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
# THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
# OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


import glob
import platform
import re
import sys

# This will default to building the 32 bit VM even on machines that are capable
# of running the 64 bit VM.  Use the scons option --arch=x64 to force it to build
# the 64 bit VM.
def GuessArchitecture():
  id = platform.machine()
  id = id.lower()  # Windows 7 capitalizes 'AMD64'.
  if id.startswith('arm') or id == 'aarch64':
    return 'arm'
  elif (not id) or (not re.match('(x|i[3-6])86$', id) is None):
    return 'ia32'
  elif id == 'i86pc':
    return 'ia32'
  elif id == 'x86_64':
    return 'ia32'
  elif id == 'amd64':
    return 'ia32'
  elif id.startswith('ppc'):
    return 'ppc'
  elif id == 's390x':
    return 's390'
  else:
    id = platform.processor()
    if id == 'powerpc':
      return 'ppc'
    return None

def SearchFiles(dir, ext):
  list = glob.glob(dir+ '/**/*.' + ext, recursive=True)
  if sys.platform == 'win32':
    list = [ x.replace('\\', '/')for x in list]
  return list