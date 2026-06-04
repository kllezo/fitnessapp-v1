import re
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

def search_file(filepath, pattern):
    print(f"=== Searching {filepath} for '{pattern}' ===")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        for i, line in enumerate(lines):
            if re.search(pattern, line, re.IGNORECASE):
                print(f"{i+1}: {line.strip()}")
    except Exception as e:
        print(f"Error reading {filepath}: {e}")

if __name__ == '__main__':
    if len(sys.argv) > 2:
        search_file(sys.argv[1], sys.argv[2])
    else:
        print("Usage: python search_code.py <file> <pattern>")
