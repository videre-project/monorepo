#!/usr/bin/env bash

## @file
# Checks for whether a given workspace exists.
#
# Copyright (c) 2023, The Videre Project Authors. All rights reserved.
# SPDX-License-Identifier: BSD-3-Clause
##

getKey() { ltrunc="${2#*\"$1\":\"}"; value="${ltrunc%%\"*}"; echo "$value"; }


while read -r workspace; do
  location="$(getKey location \"$workspace\")"
  name="$(getKey name \"$workspace\")"
  if [[ "$1" == "$name" ]]; then echo "$location"; fi
done <<< "$(yarn workspaces list --no-private --json)"
