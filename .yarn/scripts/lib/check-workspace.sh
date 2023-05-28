#!/usr/bin/env bash

## @file
# Checks for whether a given workspace exists.
#
# Copyright (c) 2023, The Videre Project Authors. All rights reserved.
# SPDX-License-Identifier: BSD-3-Clause
##

getKey() { ltrunc="${2#*\"$1\":\"}"; value="${ltrunc%%\"*}"; echo "$value"; }


while read -r workspace; do
  if [[ "$1" == "$(getKey name     \"$workspace\")" ]]; then exit 0; fi
  # if [[ "$1" == "$(getKey location \"$workspace\")" ]]; then exit 0; fi
done <<< "$(yarn workspaces list --no-private --json)"

echo "Workspace \"$1\" was not found."; exit 1;
