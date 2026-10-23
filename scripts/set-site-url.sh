#!/bin/sh
# Fill in the live address used by the social share tags (og:image, og:url, canonical).
# Facebook, LinkedIn, iMessage and Slack need absolute URLs, so run this once you know
# where the demo is hosted:
#
#   sh scripts/set-site-url.sh https://dawn-treader-demo.netlify.app
#
# Run it again with a new address at any time; it remembers the last one it wrote.
set -eu

url="${1:-}"
if [ -z "$url" ]; then
  echo "Usage: sh scripts/set-site-url.sh https://your-site-address" >&2
  exit 1
fi
url="${url%/}"

cd "$(dirname "$0")/.."
state=".site-url"
from="__SITE_URL__"
[ -f "$state" ] && from="$(cat "$state")"

for f in index.html rare-room/index.html voyage/index.html; do
  FROM="$from" TO="$url" perl -pi -e 's/\Q$ENV{FROM}\E/$ENV{TO}/g' "$f"
done
printf '%s' "$url" > "$state"
echo "Share tags now point at $url"
