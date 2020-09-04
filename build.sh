#!/bin/bash
set -xe
DOCKER_BUILDKIT=1 docker build --rm --target prod --tag codewitchbella .
