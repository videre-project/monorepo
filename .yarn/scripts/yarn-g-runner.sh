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
  # Parse optional flag arguments
  for i in "$@"; do
    if [[ ! "${@: $OFFSET:1}" =~ ^--?[a-z|A-Z|0-9|-|_] ]]; then break
    # (-d|--default) Passes default arguments to script
    elif [[ "${@: $OFFSET:1}" =~ ^-(d|-default)$ ]]; then
      i=0; for var in "${@: $OFFSET+1:1}"; do
        if [[ "$var" == "--" ]]; then break; else i=$((i+1)); fi
      done
      DEFAULT_ARGS="${@: $OFFSET+1:$i}"; ((OFFSET+=i+2))
    # (-v|--verbose) Enables verbose script tracing
    elif [[ "${@: $OFFSET:1}" =~ ^-(v|-verbose)$ ]]; then
      VERBOSE_MODE=true; ((OFFSET+=1))
    fi
  done

  # Required arguments to pass to script
  SCRIPT_NAME="${@: $(($OFFSET)):1}"
  SCRIPT_ARGS="${@: $(($OFFSET+1))}"

  node -e "(/* blocks bash process - grants top-level await */ async () => {
    const path = require('path')
    const printMessage = require('print-message')
    // Requires ESM or top-level await
    const chalk = await import('chalk').then(module => module.default)

    // chalkjs formatting utilities
    const unemph = (str) => chalk.grey(str)
    const emph = (str) => chalk.hex(/* red */ '#f86d67').bold(str)
    const string = (str) => quote(\`\\\"\${str}\\\"\`)
    const quote = (str) => chalk.green(str)
      // Unfocus escaped quotes
      .replaceAll('\\\\\"', chalk.bold.dim(\`\'\`))

    // package.json script formatting utilities
    const pkg = require(path.join('$__PWD__', '$PROJECT_DIR', 'package.json'))
    const pad = (num) => ''.padStart(num,' ')
    function formatScript(name) {
      return JSON.stringify(pkg.scripts[name]).slice(1, -1)
        // Format script piping / chaining
        .replaceAll(/ [\\<|\\>|\\&|\\|]+ /g, unemph)
        // Format script arguments
        .replaceAll(/\\\$[0-9|@]+/g, emph)
    }

    // Formatted strings
    const WORKSPACE = chalk.cyan.bold('[$WORKSPACE]')
    const SCRIPT_NAME = chalk.bold(string('$SCRIPT_NAME'))

    if(!'$VERBOSE_MODE'.length) {
      console.log(chalk.grey(
        \`\n\${WORKSPACE} Executing \${SCRIPT_NAME} script...\n\`))
    } else {
      const SCRIPT = formatScript('$SCRIPT_NAME')
        // Format references to other workspace scripts
        .replace(new RegExp(\`^run (\${Object.keys(pkg.scripts).join('|')}) \`),
          (s) => quote(formatScript(s.slice(4,-1)))
              // Split script chaining with newline
              + string(\`\n\${pad(16) + chalk.grey.bold(' <<< ')}\`))

      console.log(chalk.grey(
        \`\n\${WORKSPACE} Executing \${SCRIPT_NAME} script with \${emph('args')}:\`
      )); printMessage([
        ...(chalk.bold('--- Script --- ') + string(SCRIPT)).split('\n'),
        \`\${emph(' Default (\$0)')}: \${string('$DEFAULT_ARGS')}\`,
        \`\${emph('    Args (\$1)')}: \${string('$SCRIPT_ARGS')}\`,
      ], { color: 'grey', borderColor: 'grey', marginBottom: 1 })
    }
  })();"

  # Executes workspace command with the following arguments:
  #   $0: Default argument(s) (empty by default)
  #   $1: Script arguments(s) (empty by default)
  yarn workspace "$WORKSPACE" "$SCRIPT_NAME" "$DEFAULT_ARGS" "$SCRIPT_ARGS"
fi
