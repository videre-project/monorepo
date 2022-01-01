#!/usr/bin/env bash
# coding: utf-8

import platform, sys
import re

from utils import GuessArchitecture

architecture = GuessArchitecture() \
    .replace('ia32', 'x64') \
    .replace('ppc', 'ppc64') \
    .replace('arm', 'arm64') \
    .replace('s390', 's390x')

print(f"""=== OS INFORMATION ===
OS: {platform.system()}
├── Kernel version: {platform.version()}
├── Release version: {platform.release()}
├── Platform: {platform.platform()}
├── Architecture: {platform.architecture()[0]}
|   ├── Machine: {architecture} ({platform.machine()})
|   └── Supports-64-bit: {sys.maxsize > 2**32}
└── OS-Specific Details:""", end='')

# Windows
if all([re.search("^\s*$",i) for i in platform.win32_ver()]) == False:
    def wsl_available() -> bool:
        """
        Heuristic to detect if Windows Subsystem for Linux is available.

        Uses presence of /etc/os-release in the WSL image to say Linux is there.
        This is a de facto file standard across Linux distros.
        """
        import os
        import shutil
        if os.name == "nt":
            wsl = shutil.which("wsl")
            if not wsl:
                return False
            # can't read this file or test with
            # pathlib.Path('//wsl$/Ubuntu/etc/os-release').
            # A Python limitation?
            ret = subprocess.run(["wsl", "test", "-f", "/etc/os-release"])
            return ret.returncode == 0

        return False

    print(f"""
    └── Windows:
    |   ├── Name: Windows {platform.win32_ver()[0]}
    |   ├── Version: {platform.win32_edition()}
    |   └── Build: {platform.win32_ver()[1].split('.')[2]}
    └── Microsoft WSL2: {'Enabled' if wsl_available() == True else 'Disabled'}""")

# OSX / macOS
elif len(platform.mac_ver()[0]) > 0:
    import subprocess

    # Get OSX / macOS version/build info.
    output = subprocess.Popen(["sw_vers"], stdout=subprocess.PIPE).communicate()[0]
    sw_vers = [i.split('\n')[0] for i in output.decode("utf-8").split('\t')][1:]
    # Parse EULA to get macOS friendly name; method via online catalog is unreliable after Big Sur Beta 11.6.
    command = "awk '/SOFTWARE LICENSE AGREEMENT FOR macOS/' '/System/Library/CoreServices/Setup Assistant.app/Contents/Resources/en.lproj/OSXSoftwareLicense.rtf' | awk -F 'macOS ' '{print $NF}' | awk '{print substr($0, 0, length($0)-1)}'"
    friendly_name = subprocess.check_output(command, shell=True).decode("utf-8").strip()

    print(f"""
    └── OSX / macOS:
        ├── Name: {sw_vers[0]} {friendly_name}
        ├── Version: {sw_vers[1]}
        ├── Build: {sw_vers[2]}""")

    # Check for XCode installation.
    xcode_installed = False
    xcode_version = 'N/A'
    try:
        xcode_version = subprocess.check_output("xcodebuild -version",stderr=subprocess.STDOUT, shell=True)\
            .decode("utf-8").strip()\
            .replace('Xcode ', '')\
            .replace('Build version ', '')\
            .split('\n')
        xcode_installed = True
    except subprocess.CalledProcessError as e:
        xcode_installed = False
    # xcodebuild will be present in $PATH even if xcode tools aren't installed.
    xcodebuild = subprocess.check_output("which xcodebuild",stderr=subprocess.DEVNULL, shell=True)\
        .decode("utf-8").strip()

    # Check for command line tools version
    command_line_tools = subprocess.check_output("gcc --version",stderr=subprocess.STDOUT, shell=True)\
        .decode("utf-8").strip()\
        .replace('clang version ', 'Clang Version: v')\
        .split('\n')
    
    # Get Apple Swift language version
    swift = subprocess.check_output("swift --version",stderr=subprocess.DEVNULL, shell=True)\
        .decode("utf-8").strip()\
        .replace(' version ', ' Version: v')\
        .split('\n')

    # Print xcode feature set
    print(f"""        └── Features:
            └── XCode Tooling:
                ├── XCode:
                |   ├── Path: {xcodebuild}
                |   ├── Version: {'N/A' if xcode_installed == False else xcode_version[0]}
                |   └── Build: {'N/A' if xcode_installed == False else xcode_version[1]}
                ├── CommandLineTools:
                |   ├── {command_line_tools[1]}
                |   ├── {command_line_tools[2]}
                |   ├── {command_line_tools[3]}
                |   ├── {command_line_tools[4]}
                |   └── Flags:
                |       ├── {command_line_tools[0].split(' --')[1]}
                |       └── {command_line_tools[0].split(' --')[2]}
                └── Swift:
                    ├── {swift[0]}
                    └── {swift[1]}""")
# Linux / Etc.
else:
    def in_wsl() -> bool:
        """
        WSL is thought to be the only common Linux kernel with Microsoft in the name, per Microsoft:

        https://github.com/microsoft/WSL/issues/4071#issuecomment-496715404
        """

        return ('(Microsoft' in platform.uname().release.title()) or ('microsoft-standard-WSL2' in platform.platform())

    if in_wsl == True:
        print(f"""
    └── Microsoft WSL2: 'Running'""")
    else:
        using_distro = False
        try:
            import distro
            using_distro = True
        except ImportError:
            pass
        if using_distro:
            info = distro.os_release_info()
            print(f"""
    └── Linux:
        ├── Name: {info['NAME']}
        ├── Version: {info['VERSION_ID']}
        └── Distribution: {info['PRETTY_NAME']}
            └── Like: {info['ID_LIKE']}""")
        else:
            print(f"""
    └── Linux:
        ├── Name: {platform.linux_distribution[0]}
        ├── Version: {platform.linux_distribution[1]}
        └── Distribution: {' '.join(w[:1].upper() + w[1:] for w in platform.linux_distribution())}""")