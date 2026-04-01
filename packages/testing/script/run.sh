#!/bin/bash

# Navigate to the testing package root to ensure relative imports work correctly
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

if [ -f .env ]; then
    echo "Loading environment variables from .env..."
    set -a
    [ -f .env ] && . .env
    set +a
fi

run_test() {
    local type=$1
    local dir="./$type"
    
    if [ ! -d "$dir" ]; then
        echo "Error: Directory $dir not found."
        return
    fi

    echo ""
    echo "--- $type tests ---"
    
    files=()
    while IFS= read -r file; do
        files+=("$file")
    done < <(ls "$dir"/*.js 2>/dev/null)
    
    if [ ${#files[@]} -eq 0 ]; then
        echo "No .js files found in $dir."
        return
    fi

    for i in "${!files[@]}"; do
        echo "$((i+1))) $(basename "${files[$i]}")"
    done
    echo "$(( ${#files[@]} + 1 ))) Back to main menu"

    read -p "Select a file to run: " file_choice

    if [[ "$file_choice" -gt 0 && "$file_choice" -le "${#files[@]}" ]]; then
        selected_file="${files[$((file_choice-1))]}"
        echo "Executing: k6 run $selected_file"
        k6 run "$selected_file"
    elif [[ "$file_choice" -eq "$(( ${#files[@]} + 1 ))" ]]; then
        return
    else
        echo "Invalid choice."
    fi
}

while true; do
    echo ""
    echo "=============================="
    echo "   k6 Performance Test Menu   "
    echo "=============================="
    echo "1) Load"
    echo "2) Smoke"
    echo "3) Spike"
    echo "4) Stress"
    echo "5) Exit"
    read -p "Choose a test type [1-5]: " choice

    case $choice in
        1) run_test "load" ;;
        2) run_test "smoke" ;;
        3) run_test "spike" ;;
        4) run_test "stress" ;;
        5) echo "Exiting..."; exit 0 ;;
        *) echo "Invalid option." ;;
    esac
done
