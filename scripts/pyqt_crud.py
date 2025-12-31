#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
import json
import shutil
import csv
import tempfile
import uuid
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Any, Dict
import copy

from PyQt6 import QtWidgets, QtGui, QtCore

# Optional: jsonschema for validation (if installed)
try:
    import jsonschema  # type: ignore
    HAS_JSONSCHEMA = True
except Exception:
    HAS_JSONSCHEMA = False

DEFAULT_FILES = [
    "public/data/gi/characters.json",
    "public/data/hsr/characters.json",
    "public/data/zzz/characters.json",
    "public/data/versions.json",
    "public/data/gi/weapons.json",
    "public/data/hsr/lightcones.json",
    "public/data/zzz/wengines.json",
    "public/data/zzz/disks.json",
]


def normalize_path(p: str) -> str:
    try:
        return str(Path(p).expanduser())
    except Exception:
        return p


# ---------- Helper conversions ----------
def parse_value_by_type(text: str, typ: str):
    """Convert text input to a Python value based on typ string."""
    if typ == "string":
        return text
    if typ == "int":
        return int(text) if text != "" else 0
    if typ == "float":
        return float(text) if text != "" else 0.0
    if typ == "bool":
        low = text.strip().lower()
        if low in ("true", "1", "yes", "y"):
            return True
        if low in ("false", "0", "no", "n"):
            return False
        # fallback: non-empty -> True
        return bool(text.strip())
    if typ == "list" or typ == "dict":
        # expect JSON literal
        return json.loads(text) if text.strip() != "" else ([] if typ == "list" else {})
    if typ == "null":
        return None
    # default
    return text


def detect_type_for_value(v: Any) -> str:
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "bool"
    if isinstance(v, int) and not isinstance(v, bool):
        return "int"
    if isinstance(v, float):
        return "float"
    if isinstance(v, list):
        return "list"
    if isinstance(v, dict):
        return "dict"
    return "string"


# ---------- Form editor dialog for a single dict ----------
class FormEditorDialog(QtWidgets.QDialog):
    """
    Display and edit a dict as a table of key/type/value rows.
    Types supported: string,int,float,bool,list,dict,null
    """

    TYPES = ["string", "int", "float", "bool", "list", "dict", "null"]

    def __init__(self, parent=None, title: str = "Edit item (form)", initial: Optional[Dict] = None, auto_id: bool = True):
        super().__init__(parent)
        self.setWindowTitle(title)
        self.resize(700, 500)
        layout = QtWidgets.QVBoxLayout(self)

        # top: options row
        opts = QtWidgets.QHBoxLayout()
        layout.addLayout(opts)
        self.auto_id_cb = QtWidgets.QCheckBox("Auto-generate id if missing")
        self.auto_id_cb.setChecked(auto_id)
        opts.addWidget(self.auto_id_cb)
        opts.addStretch()

        # table for fields
        self.table = QtWidgets.QTableWidget(0, 3)
        self.table.setHorizontalHeaderLabels(["Key", "Type", "Value (text)"])
        self.table.horizontalHeader().setStretchLastSection(True)
        layout.addWidget(self.table, stretch=1)

        # buttons: add/remove rows
        row_btns = QtWidgets.QHBoxLayout()
        layout.addLayout(row_btns)
        add_row = QtWidgets.QPushButton("Add field")
        add_row.clicked.connect(self.add_row)
        row_btns.addWidget(add_row)
        remove_row = QtWidgets.QPushButton("Remove selected field(s)")
        remove_row.clicked.connect(self.remove_selected_rows)
        row_btns.addWidget(remove_row)
        row_btns.addStretch()

        # bottom ok/cancel
        btns = QtWidgets.QHBoxLayout()
        layout.addLayout(btns)
        ok = QtWidgets.QPushButton("OK")
        ok.clicked.connect(self.on_ok)
        btns.addWidget(ok)
        cancel = QtWidgets.QPushButton("Cancel")
        cancel.clicked.connect(self.reject)
        btns.addWidget(cancel)

        # load initial dict if provided
        if initial:
            self.load_from_dict(initial)

    def add_row(self, key: str = "", typ: str = "string", value_text: str = ""):
        r = self.table.rowCount()
        self.table.insertRow(r)
        # Key
        key_item = QtWidgets.QTableWidgetItem(key)
        self.table.setItem(r, 0, key_item)
        # Type (combo)
        combo = QtWidgets.QComboBox()
        combo.addItems(self.TYPES)
        combo.setCurrentText(typ)
        self.table.setCellWidget(r, 1, combo)
        # Value (string)
        val_item = QtWidgets.QTableWidgetItem(value_text)
        self.table.setItem(r, 2, val_item)

    def remove_selected_rows(self):
        rows = sorted({idx.row() for idx in self.table.selectedIndexes()}, reverse=True)
        for r in rows:
            self.table.removeRow(r)

    def load_from_dict(self, d: Dict):
        self.table.setRowCount(0)
        for k, v in d.items():
            typ = detect_type_for_value(v)
            if typ in ("list", "dict"):
                text = json.dumps(v, ensure_ascii=False)
            elif typ == "bool":
                text = "true" if v else "false"
            elif typ == "null":
                text = ""
            else:
                text = str(v)
            self.add_row(key=k, typ=typ, value_text=text)

    def to_dict(self) -> Dict:
        out = {}
        for r in range(self.table.rowCount()):
            key_item = self.table.item(r, 0)
            if key_item is None:
                continue
            key = key_item.text().strip()
            if not key:
                continue
            typ_widget = self.table.cellWidget(r, 1)
            typ = typ_widget.currentText() if isinstance(typ_widget, QtWidgets.QComboBox) else "string"
            val_item = self.table.item(r, 2)
            val_text = val_item.text() if val_item is not None else ""
            try:
                value = parse_value_by_type(val_text, typ)
            except Exception as e:
                raise ValueError(f"Error parsing field '{key}': {e}")
            out[key] = value
        # optional auto id
        if self.auto_id_cb.isChecked() and "id" not in out:
            out["id"] = str(uuid.uuid4())
        return out

    def on_ok(self):
        # quick validate: ensure keys unique / parsable
        keys = []
        for r in range(self.table.rowCount()):
            item = self.table.item(r, 0)
            if item:
                k = item.text().strip()
                if k in keys:
                    QtWidgets.QMessageBox.critical(self, "Duplicate key", f"Duplicate field key: {k}")
                    return
                keys.append(k)
        # try to build dict to catch parse errors
        try:
            _ = self.to_dict()
        except Exception as e:
            QtWidgets.QMessageBox.critical(self, "Parse error", str(e))
            return
        self.accept()


# ---------- Bulk edit dialog ----------
class BulkEditDialog(QtWidgets.QDialog):
    def __init__(self, parent=None, common_keys: List[str] = None):
        super().__init__(parent)
        self.setWindowTitle("Bulk edit field for selected items")
        self.resize(420, 160)
        layout = QtWidgets.QVBoxLayout(self)

        form = QtWidgets.QFormLayout()
        layout.addLayout(form)
        self.fieldEdit = QtWidgets.QLineEdit()
        form.addRow("Field name (key):", self.fieldEdit)

        self.typeCombo = QtWidgets.QComboBox()
        self.typeCombo.addItems(["string", "int", "float", "bool", "list", "dict", "null"])
        form.addRow("Type:", self.typeCombo)

        self.valueEdit = QtWidgets.QLineEdit()
        form.addRow("Value (text):", self.valueEdit)

        # hint common keys
        if common_keys:
            hint = ", ".join(common_keys[:10])
            label = QtWidgets.QLabel(f"Common keys: {hint}")
            layout.addWidget(label)

        btns = QtWidgets.QHBoxLayout()
        layout.addLayout(btns)
        ok = QtWidgets.QPushButton("Apply")
        ok.clicked.connect(self.accept)
        btns.addWidget(ok)
        cancel = QtWidgets.QPushButton("Cancel")
        cancel.clicked.connect(self.reject)
        btns.addWidget(cancel)

    def get_values(self):
        return self.fieldEdit.text().strip(), self.typeCombo.currentText(), self.valueEdit.text()


# ---------- Main application ----------
class JsonCrudApp(QtWidgets.QMainWindow):
    MAX_BACKUPS = 5
    UNDO_LIMIT = 50

    def __init__(self):
        super().__init__()
        self.setWindowTitle("JSON CRUD - PyQt6 (CRUD focus)")
        self.resize(1100, 700)

        # central widget
        central = QtWidgets.QWidget()
        self.setCentralWidget(central)
        vlayout = QtWidgets.QVBoxLayout(central)

        # toolbar + menu minimal
        self._create_actions()
        self._create_menubar()
        self._create_toolbar()

        # top controls
        top = QtWidgets.QHBoxLayout()
        vlayout.addLayout(top)
        self.fileCombo = QtWidgets.QComboBox()
        self.fileCombo.setEditable(True)
        self.fileCombo.addItems([normalize_path(p) for p in DEFAULT_FILES])
        top.addWidget(self.fileCombo, stretch=1)
        btn_open = QtWidgets.QPushButton("Open...")
        btn_open.clicked.connect(self.open_file_dialog)
        top.addWidget(btn_open)
        btn_load = QtWidgets.QPushButton("Load")
        btn_load.clicked.connect(self.load_file)
        top.addWidget(btn_load)
        btn_save = QtWidgets.QPushButton("Save")
        btn_save.clicked.connect(self.save_file)
        top.addWidget(btn_save)

        # splitter: left list - right editor
        splitter = QtWidgets.QSplitter(QtCore.Qt.Orientation.Horizontal)
        vlayout.addWidget(splitter, stretch=1)

        # left pane
        left = QtWidgets.QWidget()
        left_layout = QtWidgets.QVBoxLayout(left)
        splitter.addWidget(left)
        self.filterEdit = QtWidgets.QLineEdit()
        self.filterEdit.setPlaceholderText("Filter by name/id/text...")
        self.filterEdit.textChanged.connect(self.refresh_list)
        left_layout.addWidget(self.filterEdit)
        self.listWidget = QtWidgets.QListWidget()
        self.listWidget.setSelectionMode(QtWidgets.QAbstractItemView.SelectionMode.ExtendedSelection)
        left_layout.addWidget(self.listWidget, stretch=1)

        # quick CRUD buttons
        crud_quick = QtWidgets.QHBoxLayout()
        left_layout.addLayout(crud_quick)
        btn_dup = QtWidgets.QPushButton("Duplicate")
        btn_dup.clicked.connect(self.duplicate_selected)
        crud_quick.addWidget(btn_dup)
        btn_move_up = QtWidgets.QPushButton("Up")
        btn_move_up.clicked.connect(lambda: self.move_selected(-1))
        crud_quick.addWidget(btn_move_up)
        btn_move_down = QtWidgets.QPushButton("Down")
        btn_move_down.clicked.connect(lambda: self.move_selected(1))
        crud_quick.addWidget(btn_move_down)
        btn_bulk = QtWidgets.QPushButton("Bulk Edit")
        btn_bulk.clicked.connect(self.bulk_edit_selected)
        crud_quick.addWidget(btn_bulk)

        # right pane
        right = QtWidgets.QWidget()
        right_layout = QtWidgets.QVBoxLayout(right)
        splitter.addWidget(right)
        self.jsonEdit = QtWidgets.QPlainTextEdit()
        font = QtGui.QFontDatabase.systemFont(QtGui.QFontDatabase.SystemFont.FixedFont)
        self.jsonEdit.setFont(font)
        right_layout.addWidget(self.jsonEdit, stretch=1)

        # CRUD action buttons (improved)
        actions_row = QtWidgets.QHBoxLayout()
        right_layout.addLayout(actions_row)

        btn_create_raw = QtWidgets.QPushButton("Create (raw)")
        btn_create_raw.clicked.connect(self.create_item)
        actions_row.addWidget(btn_create_raw)

        btn_create_form = QtWidgets.QPushButton("Create (form)")
        btn_create_form.clicked.connect(self.create_item_form)
        actions_row.addWidget(btn_create_form)

        btn_update_raw = QtWidgets.QPushButton("Update (raw)")
        btn_update_raw.clicked.connect(self.update_item)
        actions_row.addWidget(btn_update_raw)

        btn_update_form = QtWidgets.QPushButton("Edit (form)")
        btn_update_form.clicked.connect(self.update_item_form)
        actions_row.addWidget(btn_update_form)

        btn_delete = QtWidgets.QPushButton("Delete")
        btn_delete.clicked.connect(self.delete_item)
        actions_row.addWidget(btn_delete)

        # statusbar
        self.setStatusBar(QtWidgets.QStatusBar())
        self.statusBar().showMessage("Ready")

        # signals
        self.listWidget.currentRowChanged.connect(self.show_item)
        self.jsonEdit.textChanged.connect(self.on_editor_changed)

        # state
        self.current_path: Optional[Path] = None
        self.data: List[Any] = []
        self._original_json_text = ""
        self._dirty = False
        self._top_level_was_dict = False
        self._undo_stack: List[str] = []
        self._redo_stack: List[str] = []

    # ---------- UI helpers ----------
    def _create_actions(self):
        self.act_open = QtGui.QAction("Open...", self, shortcut="Ctrl+O", triggered=self.open_file_dialog)
        self.act_save = QtGui.QAction("Save", self, shortcut="Ctrl+S", triggered=self.save_file)
        self.act_undo = QtGui.QAction("Undo", self, shortcut="Ctrl+Z", triggered=self.undo)
        self.act_redo = QtGui.QAction("Redo", self, shortcut="Ctrl+Y", triggered=self.redo)

    def _create_menubar(self):
        mb = self.menuBar()
        file_menu = mb.addMenu("File")
        file_menu.addAction(self.act_open)
        file_menu.addAction(self.act_save)
        edit_menu = mb.addMenu("Edit")
        edit_menu.addAction(self.act_undo)
        edit_menu.addAction(self.act_redo)

    def _create_toolbar(self):
        tb = self.addToolBar("Main")
        tb.addAction(self.act_open)
        tb.addAction(self.act_save)
        tb.addAction(self.act_undo)
        tb.addAction(self.act_redo)

    def on_editor_changed(self):
        cur = self.jsonEdit.toPlainText()
        self.mark_dirty(cur != self._original_json_text)

    def _push_undo(self):
        snap = json.dumps(self.data, ensure_ascii=False)
        if not self._undo_stack or self._undo_stack[-1] != snap:
            self._undo_stack.append(snap)
            if len(self._undo_stack) > self.UNDO_LIMIT:
                self._undo_stack.pop(0)
            self._redo_stack.clear()

    # ---------- file load/save (unchanged behavior) ----------
    def open_file_dialog(self):
        path, _ = QtWidgets.QFileDialog.getOpenFileName(self, "Open JSON file", str(Path.home()), "JSON Files (*.json);;All Files (*)")
        if path:
            self.fileCombo.setEditText(normalize_path(path))
            self.load_file()

    def load_file(self):
        if self._dirty:
            r = QtWidgets.QMessageBox.question(self, "Unsaved", "Unsaved changes will be lost. Continue?", QtWidgets.QMessageBox.StandardButton.Yes | QtWidgets.QMessageBox.StandardButton.No)
            if r != QtWidgets.QMessageBox.StandardButton.Yes:
                return
        path_text = self.fileCombo.currentText().strip()
        if not path_text:
            QtWidgets.QMessageBox.warning(self, "No file", "No file selected.")
            return
        p = Path(path_text).expanduser()
        if not p.exists():
            QtWidgets.QMessageBox.warning(self, "Missing", f"{p} not found")
            return
        try:
            with p.open("r", encoding="utf-8") as f:
                loaded = json.load(f)
        except json.JSONDecodeError as e:
            QtWidgets.QMessageBox.critical(self, "JSON error", f"{e.msg} (line {e.lineno})")
            return
        except Exception as e:
            QtWidgets.QMessageBox.critical(self, "Load error", str(e))
            return
        if not isinstance(loaded, list):
            q = QtWidgets.QMessageBox.question(self, "Top-level not array", "Top-level JSON is not an array. Wrap into single-element array?", QtWidgets.QMessageBox.StandardButton.Yes | QtWidgets.QMessageBox.StandardButton.No)
            if q == QtWidgets.QMessageBox.StandardButton.Yes:
                loaded = [loaded]
                self._top_level_was_dict = True
            else:
                QtWidgets.QMessageBox.warning(self, "Abort", "Load aborted.")
                return
        else:
            self._top_level_was_dict = False
        self._push_undo()
        self.data = loaded
        self.current_path = p
        self._original_json_text = ""
        self._dirty = False
        self.refresh_list()
        self.statusBar().showMessage(f"Loaded {len(self.data)} items from {p.name}")

    def save_file(self):
        if not self.current_path:
            return self.save_file_as()
        try:
            tmp_fd, tmp_path = tempfile.mkstemp(prefix=self.current_path.name, dir=str(self.current_path.parent))
            with os.fdopen(tmp_fd, "w", encoding="utf-8") as tmpf:
                to_write = self.data
                if self._top_level_was_dict and isinstance(self.data, list) and len(self.data) == 1:
                    to_write = self.data[0]
                json.dump(to_write, tmpf, ensure_ascii=False, indent=2)
                tmpf.flush(); os.fsync(tmpf.fileno())
            os.replace(tmp_path, str(self.current_path))
        except Exception as e:
            QtWidgets.QMessageBox.critical(self, "Save error", str(e))
            return
        self._undo_stack.clear(); self._redo_stack.clear()
        self.mark_dirty(False)
        self.statusBar().showMessage(f"Saved {len(self.data)} items to {self.current_path.name}")

    def save_file_as(self):
        path, _ = QtWidgets.QFileDialog.getSaveFileName(self, "Save JSON as", str(Path.home()), "JSON Files (*.json);;All Files (*)")
        if not path:
            return
        p = Path(path).expanduser()
        try:
            with p.open("w", encoding="utf-8") as f:
                to_write = self.data
                if self._top_level_was_dict and isinstance(self.data, list) and len(self.data) == 1:
                    to_write = self.data[0]
                json.dump(to_write, f, ensure_ascii=False, indent=2)
        except Exception as e:
            QtWidgets.QMessageBox.critical(self, "Save as error", str(e))
            return
        self.current_path = p
        self.statusBar().showMessage(f"Saved as {p.name}")
        self.mark_dirty(False)

    # ---------- list / display ----------
    def refresh_list(self):
        self.listWidget.clear()
        ft = self.filterEdit.text().strip().lower()
        for i, obj in enumerate(self.data):
            label = self.item_label(obj, i)
            if ft:
                try:
                    obj_text = json.dumps(obj, ensure_ascii=False).lower()
                except Exception:
                    obj_text = str(obj).lower()
                if ft in label.lower() or ft in obj_text:
                    self.listWidget.addItem(label)
            else:
                self.listWidget.addItem(label)
        self.statusBar().showMessage(f"{self.current_path.name if self.current_path else 'NoFile'} — items: {len(self.data)}")

    def item_label(self, obj, idx):
        if isinstance(obj, dict):
            name = obj.get("name") or obj.get("title") or obj.get("id")
            if name:
                return f"{idx}: {name}"
        try:
            s = json.dumps(obj, ensure_ascii=False)
            if len(s) > 60:
                s = s[:57] + "..."
        except Exception:
            s = str(type(obj).__name__)
        return f"{idx}: {s}"

    def show_item(self, row):
        if row < 0:
            self.jsonEdit.clear(); self._original_json_text = ""; self.mark_dirty(False); return
        txt = self.listWidget.item(row).text()
        idx_str = txt.split(":", 1)[0]
        try:
            idx = int(idx_str)
        except Exception:
            idx = row if row < len(self.data) else -1
        if idx < 0 or idx >= len(self.data):
            self.jsonEdit.clear(); self._original_json_text = ""; self.mark_dirty(False); return
        text = json.dumps(self.data[idx], indent=2, ensure_ascii=False)
        self.jsonEdit.blockSignals(True)
        self.jsonEdit.setPlainText(text)
        self.jsonEdit.blockSignals(False)
        self._original_json_text = text
        self.mark_dirty(False)

    # ---------- CRUD operations (raw) ----------
    def create_item(self):
        # raw create: use editor text as JSON, append by default
        text = self.jsonEdit.toPlainText().strip()
        if not text:
            # default empty object
            obj = {}
        else:
            try:
                obj = json.loads(text)
            except json.JSONDecodeError as e:
                QtWidgets.QMessageBox.critical(self, "JSON error", f"{e.msg} at line {e.lineno}")
                return
        # ask whether insert at current index or append
        pos = QtWidgets.QMessageBox.question(self, "Insert position", "Insert at current selection (Yes) or append (No)?", QtWidgets.QMessageBox.StandardButton.Yes | QtWidgets.QMessageBox.StandardButton.No)
        self._push_undo()
        if pos == QtWidgets.QMessageBox.StandardButton.Yes:
            row = self.listWidget.currentRow()
            if row < 0:
                self.data.append(obj)
            else:
                idx = int(self.listWidget.item(row).text().split(":", 1)[0])
                self.data.insert(idx, obj)
        else:
            self.data.append(obj)
        self.refresh_list()
        self.mark_dirty(True)
        self.statusBar().showMessage("Item created (raw)")

    # Create from form
    def create_item_form(self):
        dlg = FormEditorDialog(self, title="Create item (form)", initial=None, auto_id=True)
        if dlg.exec() != QtWidgets.QDialog.DialogCode.Accepted:
            return
        try:
            obj = dlg.to_dict()
        except Exception as e:
            QtWidgets.QMessageBox.critical(self, "Parse error", str(e))
            return
        pos = QtWidgets.QMessageBox.question(self, "Insert position", "Insert at current selection (Yes) or append (No)?", QtWidgets.QMessageBox.StandardButton.Yes | QtWidgets.QMessageBox.StandardButton.No)
        self._push_undo()
        if pos == QtWidgets.QMessageBox.StandardButton.Yes:
            row = self.listWidget.currentRow()
            if row < 0:
                self.data.append(obj)
            else:
                idx = int(self.listWidget.item(row).text().split(":", 1)[0])
                self.data.insert(idx, obj)
        else:
            self.data.append(obj)
        self.refresh_list()
        self.mark_dirty(True)
        self.statusBar().showMessage("Item created (form)")

    def update_item(self):
        row = self.listWidget.currentRow()
        if row < 0:
            QtWidgets.QMessageBox.information(self, "No selection", "Select an item to update.")
            return
        idx = int(self.listWidget.item(row).text().split(":", 1)[0])
        text = self.jsonEdit.toPlainText()
        try:
            obj = json.loads(text)
        except json.JSONDecodeError as e:
            QtWidgets.QMessageBox.critical(self, "JSON error", f"{e.msg} at line {e.lineno}")
            return
        self._push_undo()
        self.data[idx] = obj
        self.refresh_list()
        # reselect
        for i in range(self.listWidget.count()):
            if self.listWidget.item(i).text().startswith(f"{idx}:"):
                self.listWidget.setCurrentRow(i)
                break
        self._original_json_text = json.dumps(obj, indent=2, ensure_ascii=False)
        self.mark_dirty(True)
        self.statusBar().showMessage("Item updated (raw)")

    # Update using form editor (dict only)
    def update_item_form(self):
        row = self.listWidget.currentRow()
        if row < 0:
            QtWidgets.QMessageBox.information(self, "No selection", "Select an item to edit.")
            return
        idx = int(self.listWidget.item(row).text().split(":", 1)[0])
        cur = self.data[idx]
        if not isinstance(cur, dict):
            QtWidgets.QMessageBox.information(self, "Unsupported", "Form editor supports only objects (dict). Use raw editor for other types.")
            return
        dlg = FormEditorDialog(self, title="Edit item (form)", initial=cur, auto_id=True)
        if dlg.exec() != QtWidgets.QDialog.DialogCode.Accepted:
            return
        try:
            new_obj = dlg.to_dict()
        except Exception as e:
            QtWidgets.QMessageBox.critical(self, "Parse error", str(e))
            return
        # confirm overwrite
        confirm = QtWidgets.QMessageBox.question(self, "Confirm update", "Apply changes to selected item?", QtWidgets.QMessageBox.StandardButton.Yes | QtWidgets.QMessageBox.StandardButton.No)
        if confirm != QtWidgets.QMessageBox.StandardButton.Yes:
            return
        self._push_undo()
        self.data[idx] = new_obj
        self.refresh_list()
        # reselect same index
        for i in range(self.listWidget.count()):
            if self.listWidget.item(i).text().startswith(f"{idx}:"):
                self.listWidget.setCurrentRow(i)
                break
        self._original_json_text = json.dumps(new_obj, indent=2, ensure_ascii=False)
        self.mark_dirty(True)
        self.statusBar().showMessage("Item updated (form)")

    def delete_item(self):
        sels = self.listWidget.selectedItems()
        if not sels:
            QtWidgets.QMessageBox.information(self, "No selection", "Select one or more items to delete")
            return
        indices = sorted({int(it.text().split(":", 1)[0]) for it in sels}, reverse=True)
        confirm = QtWidgets.QMessageBox.question(self, "Delete", f"Delete {len(indices)} selected item(s)?", QtWidgets.QMessageBox.StandardButton.Yes | QtWidgets.QMessageBox.StandardButton.No)
        if confirm != QtWidgets.QMessageBox.StandardButton.Yes:
            return
        self._push_undo()
        for idx in indices:
            try:
                self.data.pop(idx)
            except Exception as e:
                QtWidgets.QMessageBox.critical(self, "Delete error", str(e))
                return
        self.refresh_list()
        self.mark_dirty(True)
        self.statusBar().showMessage("Items deleted")

    def duplicate_selected(self):
        sels = self.listWidget.selectedItems()
        if not sels:
            QtWidgets.QMessageBox.information(self, "No selection", "Select an item to duplicate")
            return
        idx = int(sels[0].text().split(":", 1)[0])
        try:
            new_obj = copy.deepcopy(self.data[idx])
        except Exception:
            new_obj = self.data[idx]
        self._push_undo()
        self.data.insert(idx + 1, new_obj)
        self.refresh_list()
        self.mark_dirty(True)
        self.statusBar().showMessage("Item duplicated")

    def move_selected(self, delta: int):
        sels = self.listWidget.selectedItems()
        if not sels:
            return
        idx = int(sels[0].text().split(":", 1)[0])
        new = idx + delta
        if new < 0 or new >= len(self.data):
            return
        self._push_undo()
        self.data.insert(new, self.data.pop(idx))
        self.refresh_list()
        # select moved
        for i in range(self.listWidget.count()):
            if self.listWidget.item(i).text().startswith(f"{new}:"):
                self.listWidget.setCurrentRow(i)
                break
        self.mark_dirty(True)

    # ---------- bulk edit ----------
    def bulk_edit_selected(self):
        sels = self.listWidget.selectedItems()
        if not sels:
            QtWidgets.QMessageBox.information(self, "No selection", "Select multiple items to bulk edit.")
            return
        indices = sorted({int(it.text().split(":", 1)[0]) for it in sels})
        # gather common keys
        keys = set()
        for i in indices:
            if isinstance(self.data[i], dict):
                keys.update(self.data[i].keys())
        common_keys = sorted(list(keys))
        dlg = BulkEditDialog(self, common_keys=common_keys)
        if dlg.exec() != QtWidgets.QDialog.DialogCode.Accepted:
            return
        field, typ, valtxt = dlg.get_values()
        if not field:
            QtWidgets.QMessageBox.information(self, "No field", "Provide a field name to set.")
            return
        try:
            value = parse_value_by_type(valtxt, typ)
        except Exception as e:
            QtWidgets.QMessageBox.critical(self, "Parse error", str(e))
            return
        self._push_undo()
        for i in indices:
            if isinstance(self.data[i], dict):
                self.data[i][field] = value
            else:
                # if non-dict, skip or optionally wrap - we skip
                pass
        self.refresh_list()
        self.mark_dirty(True)
        self.statusBar().showMessage(f"Bulk updated {len(indices)} items: set {field}")

    # ---------- undo/redo ----------
    def undo(self):
        if not self._undo_stack:
            return
        cur = json.dumps(self.data, ensure_ascii=False)
        self._redo_stack.append(cur)
        snap = self._undo_stack.pop()
        try:
            self.data = json.loads(snap)
        except Exception:
            QtWidgets.QMessageBox.critical(self, "Undo error", "Restore failed")
            return
        self.refresh_list()
        self.mark_dirty(True)
        self.statusBar().showMessage("Undo")

    def redo(self):
        if not self._redo_stack:
            return
        cur = json.dumps(self.data, ensure_ascii=False)
        self._undo_stack.append(cur)
        snap = self._redo_stack.pop()
        try:
            self.data = json.loads(snap)
        except Exception:
            QtWidgets.QMessageBox.critical(self, "Redo error", "Restore failed")
            return
        self.refresh_list()
        self.mark_dirty(True)
        self.statusBar().showMessage("Redo")

    # ---------- utility ----------
    def mark_dirty(self, v: bool = True):
        self._dirty = v
        name = self.current_path.name if self.current_path else "Untitled"
        title = f"JSON CRUD - PyQt6 (CRUD focus) — {name}"
        if v:
            title += " *"
        self.setWindowTitle(title)
        self.statusBar().showMessage(f"{name} — {'modified' if v else 'clean'} — items: {len(self.data)}")


def main():
    app = QtWidgets.QApplication(sys.argv)
    win = JsonCrudApp()
    win.show()
    sys.exit(app.exec())


if __name__ == '__main__':
    from PyQt6 import QtGui
    main()
    