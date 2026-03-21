#!/bin/bash
# Dev Port Manager Bootstrap Script (Bash/Unix/Linux/Mac/WSL)
# Usage: ./bootstrap.sh

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_NAME="${1:-$(basename "$(pwd)")}"
OUTPUT_DIR="${OUTPUT_DIR:-.}"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Dev Port Manager Bootstrap${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo "Project: $PROJECT_NAME"
echo "Output:  $OUTPUT_DIR"
echo ""

# Check if dpm CLI is installed
if ! command -v dpm &> /dev/null; then
    echo -e "${RED}✗ dev-port-manager CLI not found${NC}"
    echo -e "${YELLOW}Install with:${NC}"
    echo "  npm install -g @devops/dev-port-manager"
    exit 1
fi

echo -e "${GREEN}✓ dev-port-manager CLI found${NC}"
echo ""

# Assign port to project
echo -e "${BLUE}Assigning port...${NC}"
dpm assign "$PROJECT_NAME" --output "$OUTPUT_DIR" --vscode

echo ""
echo -e "${GREEN}✓ Bootstrap complete!${NC}"
echo ""

# Display configuration
if [ -f "$OUTPUT_DIR/.project-dev.json" ]; then
    echo -e "${BLUE}Project configuration (.project-dev.json):${NC}"
    cat "$OUTPUT_DIR/.project-dev.json" | jq '.' 2>/dev/null || cat "$OUTPUT_DIR/.project-dev.json"
    echo ""
fi

echo -e "${BLUE}Next steps:${NC}"
echo "  1. Add to docker-compose.yml (if using Docker):"
echo "  2. Update your application to listen on the assigned port"
echo "  3. Source the .project-dev.json in your startup script"
echo ""
