#!/usr/bin/env bash

## @file
# Simple wrapper for running a package.json script from a workspace directory.
#
# Copyright (c) 2023, The Videre Project Authors. All rights reserved.
# SPDX-License-Identifier: BSD-3-Clause
##

# Change CWD for imports
__PWD__=$(pwd); cd "$( dirname "${BASH_SOURCE[0]}" )"


WORKSPACE="$1"
# Default to throwing uncaptured yarn command if workspace is invalid.
if ! bash ./lib/check-workspace.sh "$WORKSPACE"; then yarn "$@" || exit 1
else
  OFFSET=2
  # (Optional) Default arguments to pass to script
  if [[ "${@: $OFFSET:1}" == '--default' ]]; then
    i=0; for var in "${@: $OFFSET+1:1}"; do
      if [[ "$var" == "--" ]]; then break; else i=$((i+1)); fi
    done
    DEFAULT_ARGS="${@: $OFFSET+1:$i}"; ((OFFSET+=i+2))
  fi
  # Required arguments to pass to script
  SCRIPT_NAME="${@: $(($OFFSET)):1}"
  SCRIPT_ARGS="${@: $(($OFFSET+1))}"

  # Executes workspace command with the following arguments:
  #   $0: Default argument(s) (empty by default)
  #   $1: Script arguments(s) (empty by default)
  yarn workspace "$WORKSPACE" "$SCRIPT_NAME" "$DEFAULT_ARGS" "$SCRIPT_ARGS"
fi
