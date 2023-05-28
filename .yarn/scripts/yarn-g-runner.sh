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
PROJECT_DIR="$(bash ./lib/check-workspace.sh "$WORKSPACE")"

if [[ -z "$PROJECT_DIR" ]]; then yarn "$@" || exit 1; else
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

  # Prints script arguments to console
  node -e "
    const path = require('path')
    const printMessage = require('print-message')
    const chalk = require('chalk')

    function quote(str) {
      return chalk.green(\`\\\"\${str}\\\"\`)
        // Unfocus escaped quotes
        .replaceAll('\\\\\"', chalk.dim('\\\"'))
    }
    function emph(str) { return chalk.hex('#f86d67').bold(str) }

    const pkg = require(path.join('$__PWD__',
      '$(bash ./lib/check-workspace.sh "$WORKSPACE")', 'package.json'))
    const SCRIPT = JSON.stringify(pkg.scripts['$SCRIPT_NAME']).slice(1, -1)
      // Format script arguments
      .replaceAll('\$0', emph('\$0'))
      .replaceAll('\$1', emph('\$1'))

    const WORKSPACE = chalk.bold.cyan('[$WORKSPACE]')
    const SCRIPT_NAME = chalk.bold(quote('$SCRIPT_NAME'))

    console.log(chalk.grey('\n' + chalk.bold.cyan('[$WORKSPACE]'),
      'Executing',chalk.bold(quote('$SCRIPT_NAME')),'script with',emph('args:')))
    printMessage([
      \`\${chalk.bold('--- Script ---')} \${quote(SCRIPT)}\`,
      \`\${emph(' Default (\$0):')} \${quote('$DEFAULT_ARGS')}\`,
      \`\${emph('    Args (\$1):')} \${quote('$SCRIPT_ARGS')}\`,
    ], { color: 'grey', borderColor: 'grey', marginBottom: 1 })"

  # Executes workspace command with the following arguments:
  #   $0: Default argument(s) (empty by default)
  #   $1: Script arguments(s) (empty by default)
  yarn workspace "$WORKSPACE" "$SCRIPT_NAME" "$DEFAULT_ARGS" "$SCRIPT_ARGS"
fi
