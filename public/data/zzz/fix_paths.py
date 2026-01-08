#!/usr/bin/env python3
"""
Capitalize character name inside path fields of JSON objects.

Usage:
  python fix_paths.py input.json           # write to input.updated.json
  python fix_paths.py input.json -o out.json
  cat input.json | python fix_paths.py     # reads from stdin, writes to stdout
  python fix_paths.py characters.json --in-place  # overwrite file (will create .bak)
"""

import json
import argparse
import sys
import os
from copy import deepcopy

def replace_name_in_path(path: str, name: str) -> str:
    """Replace any path segment that matches `name` case-insensitively with `name` (preserve name's case)."""
    if not path or not isinstance(path, str):
        return path
    parts = path.split('/')
    nl = name.lower()
    for i, seg in enumerate(parts):
        if seg.lower() == nl:
            parts[i] = name
    return '/'.join(parts)

def fix_obj(obj, parent_name=None):
    """Recursively fix path fields in dict/list. If a dict has a 'name' key, use it for its subtree."""
    if isinstance(obj, dict):
        # If this dict defines its own name, use it for child path replacements
        my_name = obj.get('name') or parent_name
        # First, recursively process nested objects so nested 'name's override parent_name
        new = {}
        for k, v in obj.items():
            new[k] = fix_obj(v, my_name)
        # Then, if there are any string fields with 'path' in key name, replace segments
        for k, v in new.items():
            if isinstance(v, str) and 'path' in k.lower() and my_name:
                new[k] = replace_name_in_path(v, my_name)
        return new
    elif isinstance(obj, list):
        return [fix_obj(item, parent_name) for item in obj]
    else:
        return obj

def main():
    parser = argparse.ArgumentParser(description="Capitalize character name inside path fields of JSON.")
    parser.add_argument('infile', nargs='?', help='Input JSON file (omit to read stdin)')
    parser.add_argument('-o', '--output', help='Output JSON file (default: infile.updated.json or stdout if reading stdin)')
    parser.add_argument('--in-place', action='store_true', help='Overwrite infile (creates .bak)')
    args = parser.parse_args()

    if args.infile:
        with open(args.infile, 'r', encoding='utf-8') as f:
            data = json.load(f)
    else:
        data = json.load(sys.stdin)

    fixed = fix_obj(deepcopy(data))

    if args.infile and args.in_place:
        bak = args.infile + '.bak'
        os.rename(args.infile, bak)
        outpath = args.infile
        with open(outpath, 'w', encoding='utf-8') as f:
            json.dump(fixed, f, ensure_ascii=False, indent=2)
        print(f"Wrote updated JSON to {outpath} (original saved to {bak})")
    elif args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(fixed, f, ensure_ascii=False, indent=2)
        print(f"Wrote updated JSON to {args.output}")
    else:
        # default if reading from a file but no output: write infile.updated.json
        if args.infile:
            outpath = args.infile.rsplit('.', 1)[0] + '.updated.json'
            with open(outpath, 'w', encoding='utf-8') as f:
                json.dump(fixed, f, ensure_ascii=False, indent=2)
            print(f"Wrote updated JSON to {outpath}")
        else:
            # reading from stdin and no output: print to stdout
            json.dump(fixed, sys.stdout, ensure_ascii=False, indent=2)
            print()

if __name__ == '__main__':
    main()
