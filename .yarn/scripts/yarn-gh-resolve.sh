#!/usr/bin/env bash

## @file
# Replaces workspace links w/ git protocol references.
#
# Copyright (c) 2023, The Videre Project Authors. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
##


PACKAGE_JSON="$(cat "$1/package.json")"

if [[ $PACKAGE_JSON =~ .*'"name": "@videre/'.* ]]; then
  while IFS= read ln; do
    if [[ "$ln" =~ \"@videre.*\"workspace:.*\" ]]; then
      WORKSPACE="$(sed -e 's/.*"\(.*\)":.*/\1/' <<< "$ln")"
      GIT_PROTOCOL="videre-project/videre-project#workspace=$WORKSPACE"
      REPLACE="$(sed -e "s/\(.*\)\"workspace:.*\"\(.*\)/\1\"${GIT_PROTOCOL//\//\\/}\"\2/" <<< "$ln")"
      PACKAGE_JSON="$(sed "s|^.*$ln.*$|$REPLACE|" <<< "$PACKAGE_JSON")"
    else continue; fi
  done <<< "$PACKAGE_JSON"
fi

if [[ -n $PACKAGE_JSON && "$PACKAGE_JSON" != "$(cat "$1/package.json")" ]]; then
  echo "$PACKAGE_JSON" > "$1/package.json"
fi
