#!/usr/bin/env bash

# Shell script to collect various device and dev info (dumped to ./tools/logs by default).

# This script must be in the tools directory when it runs because it uses the
# script source file path to determine directories to work in.

set -u # Check for undefined variables

# Command-Line Formatting
GREEN='\033[1;32m'; RED='\033[1;31m';  LIGHT_BLUE='\033[1;34m'; NC='\033[0m' # No Color
NORMAL='\033[0m'; BOLD='\033[1m'; ITALICS='\033[3m'; UNDERLINE='\033[4m'

# Print a message and exit with code 1.
die() { echo -e "\n${RED}Error:${NC} $@"; exit 1; }

# Set defaults
TIMEFORMAT=''
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
OUTPUT_FILE="./logs/${TIMESTAMP}.txt"
VERBOSE=0

# Parse command-line args
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -o|--output) OUTPUT_FILE="$2"; shift ;;
        -v|--verbose) VERBOSE="${2:-"1"}"; TIMEFORMAT='Finished in %4R seconds.'; shift ;;
        -h|--help) {
            echo -e "${BOLD}List of parsable command-line flags:${NORMAL}"
            echo -e "-o|--output <path>     Changes output file path."
            echo -e "                       Default: './logs/${TIMESTAMP}.txt'\n"
            echo -e "-v|--verbose>          Enables logging output for debugging."
            echo -e "                       Default: False\n"
            echo -e "-h|--help              Shows this help menu.\n"
            echo -e "${BOLD}Example Usage:${NORMAL} bash ./env_summary.sh -v --output log.txt\n"
            exit 0;
        } ;;
        *) {
            echo -e "${RED}Error:${NC} Unknown parameter passed: $1"
            echo -e "Try ${BOLD}bash ./env_summary.sh -h${NORMAL} for a list of all available flags.\n"
            exit 1
        } ;;
    esac
    shift
done

# Remove previous results if file already exists.
if test -f "$OUTPUT_FILE"; then rm "$OUTPUT_FILE"; fi
# Create file at 'OUTPUT_PATH' directory.
if [ ! -d "${OUTPUT_FILE}" ]; then
    mkdir -p "${OUTPUT_FILE%/*}" && touch "$OUTPUT_FILE"
    echo -e "#env_summary.sh\n" >> "${OUTPUT_FILE}"
fi

time {
    # Check for Github Core requests throttling
    github_ratelimit=$(curl -s \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/rate_limit" | \
        python3 -c "import sys, json; print(json.load(sys.stdin)['resources']['core']['remaining'])")
    if [ "${VERBOSE}" -gt 1 ]; then
        [[ "$github_ratelimit" -gt 2 ]] && remaining=$(($github_ratelimit-3))|| remaining="$github_ratelimit"
        [[ "$remaining" -gt 2 ]] && rate_color="$GREEN" || rate_color="$RED"
        echo -e "=== API ===\n${RED}Note:${NC} This script consumes up to 3 Github API requests.\n"
        echo -e "You will have ${UNDERLINE}${rate_color}${remaining}${NC}${NORMAL} Github API requests remaining for the next hour."
        echo "└── Check out Github's API documentation for more details:"
        echo -e "    ${UNDERLINE}${LIGHT_BLUE}https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting${NC}${NORMAL}\n"
    fi
    if [ "${github_ratelimit}" -lt 3 ]; then die "Github API requests throttled (${github_ratelimit} remaining)."; fi

    # Find Python Binary Path
    python_bin_path=$(which python3 || die "Cannot find Python3 binary.")
    if [ "${VERBOSE}" -gt 0 ]; then echo -e "=== Python ===\nFound python3 binary at '${python_bin_path}'."; fi

    # Check OS info w/ Python
    ${python_bin_path} ./internal/check_os.py 2>&1 >> "${OUTPUT_FILE}"
    if [ "${VERBOSE}" -gt 0 ]; then echo "--> OS info saved to '${OUTPUT_FILE}'."; fi

    # Check Python version and build info
    ${python_bin_path} ./internal/check_python.py 2>&1 >> "${OUTPUT_FILE}"
    if [ "${VERBOSE}" -gt 0 ]; then echo "--> Python version and build info saved to '${OUTPUT_FILE}'."; fi

    # Cleanup: Remove all *.pyc/*.pyo and __pycache__ directories recursively.
    find . | grep -E "(__pycache__|\.pyc|\.pyo$)" | xargs rm -rf

    # Find NodeJS Binary Path
    nodejs_bin_path=$(node -e 'console.log(process.env._)' || die "Cannot find NodeJS binary")
    if [ "${nodejs_bin_path}" = "undefined" ]; then
        die "No NodeJS binary found. You can download NodeJS at https://nodejs.org/en/download/."
    fi
    if [ "${VERBOSE}" -gt 0 ]; then echo -e "\n=== NodeJS ===\nFound NodeJS binary at '${nodejs_bin_path}'."; fi

    # Get Release Long-SHA for git-lookup
    version_tag=$(node -e 'console.log(process.versions["node"])')
    release_sha=$(curl -s \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com/repos/nodejs/node/git/ref/tags/v"${version_tag}" | \
        python3 -c "import sys, json; output = json.load(sys.stdin); print(output['object']['sha'])")
    # Get Short-SHA (8-char) for build info
    commit_sha=$(curl -s \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com/repos/nodejs/node/git/tags/"${release_sha}" | \
        python3 -c "import sys, json; output = json.load(sys.stdin); print(output['object']['sha'])")
    if [ "${VERBOSE}" -gt 0 ]; then
        echo -e "\nFetched release info for NodeJS version tag '${version_tag}':"
        echo -e "├── Release SHA: ${release_sha:0:8}\n├── Commit SHA: ${commit_sha:0:8}"
    fi

    # Get NodeJS release version meta
    release_meta=$(curl -s \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com/repos/nodejs/node/releases/tags/v"${version_tag}" | \
        python3 -c "import sys, json; output = json.load(sys.stdin); print(output['name'], output['tag_name'])")
    if [ "${VERBOSE}" -gt 0 ]; then meta_arr=(${release_meta//, / }); echo -e "└── Date: ${meta_arr[0]}"; fi

    # Get V8 Engine version
    v8_ver=$(node -p process.versions.v8)
    if [ "${VERBOSE}" -gt 0 ]; then echo -e "\nFound V8 Engine.\n└── Version: ${v8_ver}."; fi

    # Check NodeJS version and build info
    node ./internal/check_node.js "${v8_ver}" "${release_meta}" "${commit_sha:0:8}" 2>&1 >> "${OUTPUT_FILE}"
    if [ "${VERBOSE}" -gt 0 ]; then echo -e "\n--> NodeJS version and build info saved to '${OUTPUT_FILE}'.\n"; fi

    # # Check for environment features, etc.
    # num=`cat /proc/1/cgroup 2>/dev/null | grep docker | wc -l`;
    # [[ $num -ge 1 ]] && docker="True" || docker="False"
    # echo -e "\n=== Environment ===\nDocker: ${docker}" >> ${OUTPUT_FILE}
    # if [ "${VERBOSE}" -gt 0 ]; then echo -e "\n=== Environment ===\nDocker: ${docker}\n"; fi

}