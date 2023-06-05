#!/usr/bin/env bash

## @file
# Simple wrapper for running a package.json script from a workspace directory.
#
# Copyright (c) 2023, The Videre Project Authors. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
##

# Change CWD for imports
__PWD__=$(pwd); cd "$( dirname "${BASH_SOURCE[0]}" )"


WORKSPACE="$1"
PROJECT_DIR="$(bash ./lib/check-workspace.sh "$WORKSPACE")"

if [[ -z "$PROJECT_DIR" ]]; then yarn "$@" || exit 1; else
  # Parse optional flag arguments
  OFFSET=2; for i in "$@"; do arg="${@: $OFFSET:1}"
    # (-d|--default) Passes default arguments to script
    if [[ "$arg" =~ ^-(d|-default)$ ]]; then
      i=0; for var in "${@: $OFFSET+1:1}"; do
        if [[ "$var" == "--" ]]; then break; else i=$((i+1)); fi
      done
      DEFAULT_ARGS="${@: $OFFSET+1:$i}"; ((OFFSET+=i+2))
    # (-v|--verbose) Enables verbose script tracing
    elif [[ "$arg" =~ ^-(q|-quiet)$ ]]; then
      QUIET_MODE="$arg"; ((OFFSET+=1))
    # (-v|--verbose) Enables verbose script tracing
    elif [[ "$arg" =~ ^-(v|-verbose)$ ]]; then
      VERBOSE_MODE="$arg"; ((OFFSET+=1))
    else
      # Required arguments to pass to script
      SCRIPT_NAME="${@: $(($OFFSET)):1}"
      SCRIPT_ARGS="${@: $(($OFFSET+1))}"
      break
    fi
  done

  # Correct runner args if no script name is provided explicitly
  DEFAULT="$(node -e "(async () => {
    const path = require('path')
    const pkg = require(path.join('$__PWD__', '$PROJECT_DIR', 'package.json'))
    if (!pkg.scripts[\`$SCRIPT_NAME\`])
      console.log(\`$WORKSPACE\`
        // Attempt to find base package name from workspace/namespace
        .replace(/^(config|@[a-z|A-Z|0-9|\-]+)[\-|\/]/g,''))
  })();")"
  if [[ -n $DEFAULT ]]; then
    SCRIPT_ARGS="$(node -e "console.log(\`$SCRIPT_NAME $SCRIPT_ARGS\`.trim())")"
    SCRIPT_NAME="$DEFAULT"
  fi
  
  # Log executed workspace script with optional verbose tracing
  if [[ -z $QUIET_MODE ]]; then node -e "(async () => {
    const path = require('path')
    // Requires ESM or top-level await
    const chalk = await import('chalk').then(module => module.default)

    // chalkjs formatting utilities
    const dim = (str) => chalk.grey(str)
    const emph = (str) => chalk.hex(/* red */ '#f86d67').bold(str)
    const quote = (str) => chalk.green(str)
      // Unfocus escaped quotes
      .replaceAll('\\\\\"', chalk.bold.dim(\`\'\`))
    const string = (str) => quote(\`\\\"\${str}\\\"\`)

    // Formatted strings
    const WORKSPACE = chalk.cyan.bold('[$WORKSPACE]')
    const SCRIPT_NAME = chalk.bold(string('$SCRIPT_NAME'))

    if(!'$VERBOSE_MODE'.length) {
      console.log(dim(\`\n\${WORKSPACE} Executing \${SCRIPT_NAME} script...\n\`))
    } else {
      console.log(dim(\`\n\${WORKSPACE} Executing \${SCRIPT_NAME} script with \${emph('args')}:\`))

      const pkg = require(path.join('$__PWD__', '$PROJECT_DIR', 'package.json'))
      // package.json script formatting utilities
      const pad = (num) => ''.padStart(num,' ')
      function formatScript(name) {
        return JSON.stringify(pkg.scripts[name]).slice(1, -1)
          // Format script arguments
          .replaceAll(/\\\$[0-9|@]+/g, emph)
          // Format script piping / chaining
          .replaceAll(/ [\\<|\\>|\\&|\\|]+ /g, dim)
          // Trace and format references to other workspace scripts
          .replace(new RegExp(\`^run (\${Object.keys(pkg.scripts).join('|')}) \`),
            (s) => quote(formatScript(s.slice(4,-1)))
              // Split script chaining with newline
              + string(\`\n\${pad(16) + chalk.grey.bold(' <<< ')}\`))
      }

      console.log([
        ...(chalk.bold('--- Script --- ')
          + string(formatScript('$SCRIPT_NAME'))).split('\n'),
        \`\${emph(' Default (\$0)')}: \${string('$DEFAULT_ARGS')}\`,
        \`\${emph('    Args (\$1)')}: \${string('$SCRIPT_ARGS')}\`,
      ].reduce((acc, lnd) => acc + chalk.grey(lnd) + '\n', ''))
    }
  })();"; fi

  # Executes workspace command with the following arguments:
  #   $0: Default argument(s) (empty by default)
  #   $1: Script arguments(s) (empty by default)
  yarn workspace "$WORKSPACE" "$SCRIPT_NAME" "$DEFAULT_ARGS" "$SCRIPT_ARGS"
fi
