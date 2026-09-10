#!/usr/bin/env bash
# Generate self-signed certificates for the HomeGate testing stack.
# Output: secrets/certs/ (git-ignored). Mirrors the filenames the proxy
# configs expect: fullchain.pem / privkey.pem (daniel-hettich.de) and
# fullchain-pompui.pem / privkey-pompui.pem (pompui.de routes).
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../../secrets/certs"
mkdir -p "$DIR"
cd "$DIR"

openssl req -x509 -nodes -newkey rsa:2048 -days 825 \
  -keyout privkey.pem -out fullchain.pem \
  -subj "/CN=daniel-hettich.de" \
  -addext "subjectAltName=DNS:daniel-hettich.de,DNS:www.daniel-hettich.de,DNS:gj.daniel-hettich.de,DNS:*.daniel-hettich.de" \
  -addext "keyUsage=digitalSignature,keyEncipherment" \
  -addext "extendedKeyUsage=serverAuth"

openssl req -x509 -nodes -newkey rsa:2048 -days 825 \
  -keyout privkey-pompui.pem -out fullchain-pompui.pem \
  -subj "/CN=pompui.de" \
  -addext "subjectAltName=DNS:pompui.de,DNS:www.pompui.de,DNS:gj.pompui.de,DNS:*.pompui.de" \
  -addext "keyUsage=digitalSignature,keyEncipherment" \
  -addext "extendedKeyUsage=serverAuth"

chmod 600 privkey*.pem
chmod 644 fullchain*.pem
echo "Certificates written to $DIR"