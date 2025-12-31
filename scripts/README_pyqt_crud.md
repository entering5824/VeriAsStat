PyQt6 JSON CRUD

Usage

- Install dependencies:

```bash
pip install -r requirements.txt
```

- Run the app:

```bash
python scripts/pyqt_crud.py
```

How it works

- Choose a JSON file from the dropdown (defaults include weapons, lightcones, wengines, disks).
- Click Load to load the top-level array of objects.
- Select an item to view/edit its JSON on the right.
- Use Create to add a new JSON object (enter JSON), Update to save edits to the selected item, Delete to remove.
- Save File writes the modified array back to the original file.

Notes

- The script expects top-level arrays in the JSON files. It will warn if the structure is different.
- Back up files before saving if you need to preserve original formatting.
