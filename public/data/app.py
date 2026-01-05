
import sys
import json
import os
from PyQt6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, 
                             QListWidget, QPushButton, QLabel, QLineEdit, QScrollArea, 
                             QFormLayout, QComboBox, QTextEdit, QMessageBox, QFrame,
                             QTabWidget, QDialog, QDialogButtonBox, QSpacerItem, QSizePolicy,
                             QSplitter, QMenu, QAbstractItemView, QFileDialog, QMenuBar)
from PyQt6.QtCore import Qt, QSize
from PyQt6.QtGui import QColor, QPalette, QBrush, QLinearGradient, QFont, QAction

# --- Constants & Templates ---
DEFAULT_FILE_PATH = "characters_gen.json"

STYLESHEET = """
QMainWindow {
    background: qlineargradient(x1:0, y1:0, x2:1, y2:1, stop:0 #1a1c2c, stop:1 #4a1c40);
}
QWidget {
    color: #eeeeee;
    font-family: 'Segoe UI', sans-serif;
    font-size: 14px;
}
QListWidget {
    background-color: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    outline: none;
}
QListWidget::item {
    padding: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
QListWidget::item:selected {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 5px;
}
QLineEdit, QComboBox, QTextEdit {
    background-color: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    padding: 5px;
    color: white;
}
QLineEdit:focus, QComboBox:focus, QTextEdit:focus {
    border: 1px solid rgba(100, 200, 255, 0.5);
    background-color: rgba(0, 0, 0, 0.3);
}
QPushButton {
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 5px;
    padding: 6px 12px;
}
QPushButton:hover {
    background-color: rgba(255, 255, 255, 0.2);
}
QPushButton:pressed {
    background-color: rgba(255, 255, 255, 0.05);
}
QLabel {
    color: rgba(255, 255, 255, 0.9);
}
QScrollArea {
    background: transparent;
    border: none;
}
QTabWidget::pane {
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    background-color: rgba(255, 255, 255, 0.02);
}
QTabBar::tab {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 8px 16px;
    margin-right: 2px;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
}
QTabBar::tab:selected {
    background: rgba(255, 255, 255, 0.15);
}
QGroupBox {
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    margin-top: 20px;
    font-weight: bold;
}
QGroupBox::title {
    subcontrol-origin: margin;
    left: 10px;
    padding: 0 3px 0 3px;
}
"""

GAME_TEMPLATES = {
    "Genshin": {
        "base_stats": {"hp": None, "atk": None, "def": None, "em": None, "crit_rate": None, "crit_dmg": None, "energy_recharge": None, "dmgbonus": None},
        "graduation_stats": {"hp": None, "atk": None, "def": None, "em": None, "crit_rate": None, "crit_dmg": None, "energy_recharge": None, "dmgbonus": None}
    },
    "HSR": {
        "base_stats": {"hp": None, "atk": None, "def": None, "speed": None, "crit_rate": None, "crit_dmg": None, "effect_hit_rate": None, "effect_res": None, "break_effect": None, "dmgbonus": None},
        "graduation_stats": {"hp": None, "atk": None, "def": None, "speed": None, "crit_rate": None, "crit_dmg": None, "effect_hit_rate": None, "effect_res": None, "break_effect": None, "dmgbonus": None}
    },
    "ZZZ": {
        "base_stats": {"hp": None, "atk": None, "def": None, "impact": None, "crit_rate": None, "crit_dmg": None, "dmgbonus": None, "ap": None, "am": None, "pen_ratio": None, "pen": None},
        "graduation_stats": {"hp": None, "atk": None, "def": None, "impact": None, "crit_rate": None, "crit_dmg": None, "dmgbonus": None, "ap": None, "am": None, "pen_ratio": None, "pen": None}
    }
}

# --- Helper Classes ---

class GlassFrame(QFrame):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setStyleSheet("background-color: rgba(255, 255, 255, 0.03); border-radius: 8px;")

class KeyValueEditor(QWidget):
    """Generic editor for a dictionary of simple values (str/int/float/null)."""
    def __init__(self, data_dict, title="Stats"):
        super().__init__()
        self.data_dict = data_dict
        self.inputs = {}
        layout = QFormLayout(self)
        layout.setFieldGrowthPolicy(QFormLayout.FieldGrowthPolicy.AllNonFixedFieldsGrow)
        
        # Sort keys reliably if possible, or use predefined order if we passed a template
        keys = list(data_dict.keys())
        
        for key in keys:
            val = data_dict.get(key)
            line_edit = QLineEdit(str(val) if val is not None else "")
            line_edit.setPlaceholderText("null")
            line_edit.textChanged.connect(lambda text, k=key: self.update_value(k, text))
            layout.addRow(QLabel(key.replace("_", " ").title()), line_edit)
            self.inputs[key] = line_edit

    def update_value(self, key, text):
        if text.strip() == "":
            self.data_dict[key] = None
        else:
            # Try to convert to float/int
            try:
                if "." in text:
                    self.data_dict[key] = float(text)
                else:
                    self.data_dict[key] = int(text)
            except ValueError:
                self.data_dict[key] = text

    def set_data(self, new_dict):
        # Update UI from new dict - simplistic approach: clear and rebuild or just match keys
        # For simplicity, we assume keys are relatively stable for a given character type, 
        # but if they change, we should rebuild.
        # Here we just rebuild.
        self.data_dict = new_dict
        layout = self.layout()
        while layout.count():
            item = layout.takeAt(0)
            widget = item.widget()
            if widget: widget.deleteLater()
        
        self.inputs = {}
        keys = list(new_dict.keys())
        for key in keys:
            val = new_dict.get(key)
            line_edit = QLineEdit(str(val) if val is not None else "")
            line_edit.setPlaceholderText("null")
            line_edit.textChanged.connect(lambda text, k=key: self.update_value(k, text))
            layout.addRow(QLabel(key.replace("_", " ").title()), line_edit)
            self.inputs[key] = line_edit


class TagsEditor(QWidget):
    """Editor for list of objects like [{"key": "element", "label": "Pyro"}, ...]"""
    def __init__(self, tags_list):
        super().__init__()
        self.tags_list = tags_list
        self.v_layout = QVBoxLayout(self)
        self.render_items()
    
    def render_items(self):
        # Clear
        while self.v_layout.count():
            item = self.v_layout.takeAt(0)
            w = item.widget()
            if w: w.deleteLater()
        
        for i, tag in enumerate(self.tags_list):
            row = QHBoxLayout()
            key_edit = QLineEdit(tag.get("key", ""))
            key_edit.setPlaceholderText("Key (e.g. element)")
            key_edit.textChanged.connect(lambda t, idx=i: self.update_tag(idx, "key", t))
            
            val_edit = QLineEdit(tag.get("label", ""))
            val_edit.setPlaceholderText("Label (e.g. Pyro)")
            val_edit.textChanged.connect(lambda t, idx=i: self.update_tag(idx, "label", t))
            
            del_btn = QPushButton("x")
            del_btn.setFixedWidth(30)
            del_btn.clicked.connect(lambda checked, idx=i: self.delete_tag(idx))
            
            row.addWidget(key_edit)
            row.addWidget(val_edit)
            row.addWidget(del_btn)
            self.v_layout.addLayout(row)
            
        add_btn = QPushButton("+ Add Tag")
        add_btn.clicked.connect(self.add_tag)
        self.v_layout.addWidget(add_btn)

    def update_tag(self, idx, field, value):
        self.tags_list[idx][field] = value

    def delete_tag(self, idx):
        del self.tags_list[idx]
        self.render_items()

    def add_tag(self):
        self.tags_list.append({"key": "", "label": ""})
        self.render_items()

# --- Dynamic Sections ---

class SectionItemEditor(QDialog):
    """Dialog to add/edit a single item in a section."""
    def __init__(self, item_data, section_type, parent=None):
        super().__init__(parent)
        self.item_data = item_data
        self.section_type = section_type
        self.setWindowTitle("Edit Item")
        self.setModal(True)
        self.resize(400, 300)
        self.setStyleSheet(STYLESHEET)
        
        self.layout = QFormLayout(self)
        
        # Grid/List item: {name}
        if section_type in ["material-grid", "list", "relics", "weapons", "disk_sets"]:
            # Note: weapons/relics/disk_sets might be ranked-list or plain list
             pass
             
        # Just expose all keys found + allow adding common ones
        self.fields = {}
        
        # Pre-fill specific fields based on type for better UX
        common_keys = ["name"]
        if section_type == "ranked-list":
            common_keys = ["rank", "name", "note", "sets"]
        elif section_type == "stat-grid":
            common_keys = ["slot", "stat"]
        
        # Merge existing keys
        all_keys = list(set(common_keys + list(item_data.keys())))
        if "sets" in all_keys: all_keys.remove("sets") # Handle sets separately
        
        for key in all_keys:
            val = item_data.get(key, "")
            le = QLineEdit(str(val))
            le.textChanged.connect(lambda t, k=key: self.update_val(k, t))
            self.layout.addRow(key.title(), le)
            self.fields[key] = le

        # Special handling for 'sets' (Array of {name, pieces})
        if section_type == "ranked-list" and ("sets" in item_data or "sets" in all_keys):
            # If it's a sets-based ranked item (like artifacts)
            # This is complex. For now, let's just make it a JSON text edit area for "sets"
            # OR a simple text area explanation.
            # To be user friendly, let's use a specialized mini-editor? 
            # Too complex for this snippet -> use TextEdit for RAW JSON of 'sets' if needed,
            # Or simpler: Just 2 lines for 2 sets.
            
            # Let's try parsing 'sets'
            sets_data = item_data.get("sets", [])
            self.sets_edit = QTextEdit(json.dumps(sets_data, indent=2))
            self.sets_edit.setPlaceholderText('[{"name": "...", "pieces": 4}]')
            self.layout.addRow("Sets (JSON)", self.sets_edit)
        else:
            self.sets_edit = None

        btns = QDialogButtonBox(QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel)
        btns.accepted.connect(self.accept)
        btns.rejected.connect(self.reject)
        self.layout.addRow(btns)

    def update_val(self, key, text):
        # Auto convert int
        try:
            self.item_data[key] = int(text)
        except:
            self.item_data[key] = text

    def accept(self):
        if self.sets_edit:
            try:
                val = json.loads(self.sets_edit.toPlainText())
                self.item_data["sets"] = val
                # remove 'name' if it exists when we have sets, or keep both? 
                # Schema implies one or other usually.
            except:
                pass 
        super().accept()

class SectionWidget(QFrame):
    def __init__(self, section_data, delete_callback):
        super().__init__()
        self.data = section_data
        self.delete_callback = delete_callback
        self.setStyleSheet("background-color: rgba(0,0,0,0.2); border-radius: 6px; margin: 5px;")
        
        self.main_layout = QVBoxLayout(self)
        
        # Header: Key, Title, Type, Delete
        header = QHBoxLayout()
        
        self.key_edit = QLineEdit(self.data.get("key", ""))
        self.key_edit.setPlaceholderText("Key (e.g. materials)")
        self.key_edit.textChanged.connect(lambda t: self.update_field("key", t))
        
        self.title_edit = QLineEdit(self.data.get("title", ""))
        self.title_edit.setPlaceholderText("Title (e.g. Upgrade Materials)")
        self.title_edit.textChanged.connect(lambda t: self.update_field("title", t))
        
        self.type_combo = QComboBox()
        self.type_combo.addItems(["material-grid", "ranked-list", "list", "stat-grid"])
        current_type = self.data.get("type", "list")
        self.type_combo.setCurrentText(current_type)
        self.type_combo.currentTextChanged.connect(lambda t: self.update_field("type", t))
        
        del_btn = QPushButton("Delete Section")
        del_btn.setStyleSheet("background-color: rgba(255, 50, 50, 0.3);")
        del_btn.clicked.connect(delete_callback)
        
        header.addWidget(QLabel("Key:"))
        header.addWidget(self.key_edit)
        header.addWidget(QLabel("Title:"))
        header.addWidget(self.title_edit)
        header.addWidget(QLabel("Type:"))
        header.addWidget(self.type_combo)
        header.addWidget(del_btn)
        
        self.main_layout.addLayout(header)
        
        # Items List
        self.items_layout = QVBoxLayout()
        self.render_items()
        self.main_layout.addLayout(self.items_layout)

    def update_field(self, key, val):
        self.data[key] = val

    def render_items(self):
        # Clear items
        while self.items_layout.count():
            item = self.items_layout.takeAt(0)
            w = item.widget()
            if w: w.deleteLater()
            
        # List items
        items = self.data.get("items", [])
        for i, item_data in enumerate(items):
            row = QHBoxLayout()
            
            # Summary label
            summary = self.get_item_summary(item_data)
            lbl = QLabel(summary)
            lbl.setStyleSheet("background: transparent; border: none;")
            
            edit_btn = QPushButton("Edit")
            edit_btn.clicked.connect(lambda c, idx=i: self.edit_item(idx))
            
            del_btn = QPushButton("x")
            del_btn.setFixedWidth(30)
            del_btn.clicked.connect(lambda c, idx=i: self.delete_item(idx))
            
            row.addWidget(lbl)
            row.addStretch()
            row.addWidget(edit_btn)
            row.addWidget(del_btn)
            
            frame = QFrame()
            frame.setLayout(row)
            frame.setStyleSheet("background-color: rgba(255,255,255,0.05); margin: 2px;")
            self.items_layout.addWidget(frame)
            
        add_btn = QPushButton("+ Add Item")
        add_btn.clicked.connect(self.add_item)
        self.items_layout.addWidget(add_btn)

    def get_item_summary(self, item_data):
        # Best effort summary
        if "name" in item_data: return item_data["name"]
        if "stat" in item_data: return f"{item_data.get('slot','?')} : {item_data['stat']}"
        if "sets" in item_data:
            names = [s.get("name","?") for s in item_data["sets"]]
            return " + ".join(names)
        return str(item_data)

    def add_item(self):
        new_item = {"name": "New Item"}
        if self.data.get("type") == "ranked-list":
            new_item = {"rank": len(self.data.get("items", [])) + 1, "name": "New Item"}
        elif self.data.get("type") == "stat-grid":
            new_item = {"slot": "Slot", "stat": "Stat"}
            
        self.data.setdefault("items", []).append(new_item)
        self.render_items()
        
    def delete_item(self, idx):
        self.data["items"].pop(idx)
        self.render_items()

    def edit_item(self, idx):
        item = self.data["items"][idx]
        dlg = SectionItemEditor(item, self.data.get("type", "list"), self)
        if dlg.exec():
            # Refresh
            self.render_items()


class SectionsEditor(QWidget):
    def __init__(self, sections_list):
        super().__init__()
        self.sections_list = sections_list
        self.layout = QVBoxLayout(self)
        self.render_sections()
        
    def render_sections(self):
        while self.layout.count():
            item = self.layout.takeAt(0)
            w = item.widget()
            if w: w.deleteLater()
            
        for i, section in enumerate(self.sections_list):
            w = SectionWidget(section, lambda idx=i: self.delete_section(idx))
            self.layout.addWidget(w)
            
        add_btn = QPushButton("+ Add New Section")
        add_btn.setStyleSheet("background-color: rgba(100, 255, 100, 0.2); font-weight: bold; padding: 10px;")
        add_btn.clicked.connect(self.add_section)
        self.layout.addWidget(add_btn)
        
    def delete_section(self, idx):
        reply = QMessageBox.question(self, "Confirm", "Delete this entire section?", QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No)
        if reply == QMessageBox.StandardButton.Yes:
            del self.sections_list[idx]
            self.render_sections()
            
    def add_section(self):
        self.sections_list.append({
            "key": "new_section",
            "title": "New Section",
            "type": "list",
            "items": []
        })
        self.render_sections()

# --- Main Window ---

class CharacterForm(QWidget):
    def __init__(self, char_data):
        super().__init__()
        self.char_data = char_data
        self.init_ui()
        
    def init_ui(self):
        layout = QVBoxLayout(self)
        
        # ID
        top_form = QFormLayout()
        self.id_edit = QLineEdit(str(self.char_data.get("_id", "")))
        self.id_edit.textChanged.connect(lambda t: self.update_root("_id", t))
        
        top_form.addRow("Unique ID (_id):", self.id_edit)
        layout.addLayout(top_form)
        
        # Tabs
        tabs = QTabWidget()
        layout.addWidget(tabs)
        
        # Tab 1: Character Info
        tab_info = QWidget()
        info_layout = QFormLayout(tab_info)
        char_obj = self.char_data.setdefault("character", {})
        
        self.name_edit = QLineEdit(char_obj.get("name", ""))
        self.name_edit.textChanged.connect(lambda t: self.update_char("name", t))
        
        self.icon_edit = QLineEdit(char_obj.get("iconPath", ""))
        self.icon_edit.textChanged.connect(lambda t: self.update_char("iconPath", t))
        
        self.splash_edit = QLineEdit(char_obj.get("splashPath", ""))
        self.splash_edit.textChanged.connect(lambda t: self.update_char("splashPath", t))
        
        self.tier_edit = QLineEdit(str(char_obj.get("tier", "")) if char_obj.get("tier") is not None else "")
        self.tier_edit.setPlaceholderText("null")
        self.tier_edit.textChanged.connect(lambda t: self.update_tier(t))
        
        info_layout.addRow("Name:", self.name_edit)
        info_layout.addRow("Icon Path:", self.icon_edit)
        info_layout.addRow("Splash Path:", self.splash_edit)
        info_layout.addRow("Tier:", self.tier_edit)
        
        # Tags in Info
        tags_group = QFrame()
        tags_layout = QVBoxLayout(tags_group)
        tags_layout.addWidget(QLabel("Tags"))
        self.tags_editor = TagsEditor(char_obj.setdefault("tags", []))
        tags_layout.addWidget(self.tags_editor)
        info_layout.addRow(tags_group)
        
        tabs.addTab(tab_info, "Info")
        
        # Tab 2: Stats
        tab_stats = QWidget()
        stats_layout = QHBoxLayout(tab_stats)
        
        # Base Stats
        base_group = GlassFrame()
        base_layout = QVBoxLayout(base_group)
        base_layout.addWidget(QLabel("Base Stats"))
        self.base_stats_editor = KeyValueEditor(self.char_data.setdefault("base_stats", {}))
        base_layout.addWidget(self.base_stats_editor)
        stats_layout.addWidget(base_group)
        
        # Graduation Stats
        grad_group = GlassFrame()
        grad_layout = QVBoxLayout(grad_group)
        grad_layout.addWidget(QLabel("Graduation Stats"))
        self.grad_stats_editor = KeyValueEditor(self.char_data.setdefault("graduation_stats", {}))
        grad_layout.addWidget(self.grad_stats_editor)
        stats_layout.addWidget(grad_group)
        
        tabs.addTab(tab_stats, "Stats")
        
        # Tab 3: Sections
        tab_sections = QWidget()
        sections_layout = QVBoxLayout(tab_sections)
        
        # Scroll area for sections as they can get long
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll_content = QWidget()
        self.sections_editor = SectionsEditor(self.char_data.setdefault("sections", []))
        scroll.setWidget(self.sections_editor)
        sections_layout.addWidget(scroll)
        
        tabs.addTab(tab_sections, "Build Sections")

    def update_root(self, key, val):
        if key == "_id":
            # Try to convert to int if possible, otherwise keep as string
            try:
                self.char_data[key] = int(val) if val.strip() else None
            except ValueError:
                self.char_data[key] = val if val.strip() else None
        else:
            self.char_data[key] = val

    def update_char(self, key, val):
        self.char_data["character"][key] = val
    
    def update_tier(self, text):
        """Update tier field, handling null values"""
        if text.strip() == "":
            self.char_data["character"]["tier"] = None
        else:
            try:
                self.char_data["character"]["tier"] = int(text)
            except ValueError:
                # If not a valid int, try float
                try:
                    self.char_data["character"]["tier"] = float(text)
                except ValueError:
                    # If still not valid, keep as string
                    self.char_data["character"]["tier"] = text


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Liquid Glass CRUD")
        self.resize(1200, 800)
        
        # File path - will be set when user opens a file
        self.file_path = None
        
        # Load Data
        self.data = []
        
        # Create menu bar
        self.create_menu_bar()
        
        # Central Widget
        central = QWidget()
        self.setCentralWidget(central)
        main_layout = QHBoxLayout(central)
        
        # Sidebar
        sidebar_layout = QVBoxLayout()
        self.search_bar = QLineEdit()
        self.search_bar.setPlaceholderText("Search...")
        self.search_bar.textChanged.connect(self.filter_list)
        
        self.char_list = QListWidget()
        self.char_list.itemClicked.connect(self.load_character_form)
        
        sidebar_layout.addWidget(self.search_bar)
        sidebar_layout.addWidget(self.char_list)
        
        # Sidebar Buttons
        btn_layout = QHBoxLayout()
        add_btn = QPushButton("New")
        add_btn.clicked.connect(self.add_character)
        
        open_btn = QPushButton("Open File")
        open_btn.clicked.connect(self.open_file)
        
        save_btn = QPushButton("Save")
        save_btn.clicked.connect(self.save_data)
        
        save_as_btn = QPushButton("Save As")
        save_as_btn.clicked.connect(self.save_as_file)
        
        del_btn = QPushButton("Delete")
        del_btn.setStyleSheet("background-color: rgba(255, 50, 50, 0.2);")
        del_btn.clicked.connect(self.delete_character)
        
        btn_layout.addWidget(add_btn)
        btn_layout.addWidget(open_btn)
        btn_layout.addWidget(save_btn)
        btn_layout.addWidget(save_as_btn)
        btn_layout.addWidget(del_btn)
        sidebar_layout.addLayout(btn_layout)
        
        # Content Area
        self.content_area = QScrollArea()
        self.content_area.setWidgetResizable(True)
        
        splitter = QSplitter(Qt.Orientation.Horizontal)
        sidebar_widget = QWidget()
        sidebar_widget.setLayout(sidebar_layout)
        
        splitter.addWidget(sidebar_widget)
        splitter.addWidget(self.content_area)
        splitter.setSizes([300, 900])
        
        main_layout.addWidget(splitter)
        
        # Try to load default file if exists, otherwise prompt user
        # Do this AFTER UI is created
        if os.path.exists(DEFAULT_FILE_PATH):
            self.file_path = DEFAULT_FILE_PATH
            self.load_data()
        else:
            # Prompt user to open a file (but don't block if they cancel)
            # Just show empty list
            self.refresh_list()
    
    def create_menu_bar(self):
        """Create menu bar with File menu"""
        menubar = self.menuBar()
        
        # File menu
        file_menu = menubar.addMenu("File")
        
        # Open action
        open_action = QAction("Open...", self)
        open_action.setShortcut("Ctrl+O")
        open_action.triggered.connect(self.open_file)
        file_menu.addAction(open_action)
        
        # Save action
        save_action = QAction("Save", self)
        save_action.setShortcut("Ctrl+S")
        save_action.triggered.connect(self.save_data)
        file_menu.addAction(save_action)
        
        # Save As action
        save_as_action = QAction("Save As...", self)
        save_as_action.setShortcut("Ctrl+Shift+S")
        save_as_action.triggered.connect(self.save_as_file)
        file_menu.addAction(save_as_action)
        
        file_menu.addSeparator()
        
        # Exit action
        exit_action = QAction("Exit", self)
        exit_action.setShortcut("Ctrl+Q")
        exit_action.triggered.connect(self.close)
        file_menu.addAction(exit_action)
        
    def open_file(self):
        """Open a JSON file dialog and load the selected file"""
        file_path, _ = QFileDialog.getOpenFileName(
            self,
            "Open Character JSON File",
            DEFAULT_FILE_PATH if not self.file_path else os.path.dirname(self.file_path),
            "JSON Files (*.json);;All Files (*)"
        )
        
        if file_path:
            self.file_path = file_path
            self.load_data()
            # Update window title with file name
            self.setWindowTitle(f"Liquid Glass CRUD - {os.path.basename(file_path)}")
    
    def load_data(self):
        """Load data from the current file path"""
        if not self.file_path:
            return
            
        if os.path.exists(self.file_path):
            try:
                with open(self.file_path, 'r', encoding='utf-8') as f:
                    self.data = json.load(f)
                
                # Validate and normalize data structure
                if not isinstance(self.data, list):
                    QMessageBox.critical(self, "Error", "JSON file must contain an array of characters")
                    self.data = []
                    self.refresh_list()
                    return
                
                # Normalize each character entry
                for i, char in enumerate(self.data):
                    # Ensure _id exists (migrate from 'id' if present)
                    if "_id" not in char and "id" in char:
                        char["_id"] = char.pop("id")
                    elif "_id" not in char:
                        char["_id"] = i
                    
                    # Ensure character object exists
                    if "character" not in char:
                        char["character"] = {}
                    
                    # Ensure base_stats and graduation_stats exist
                    if "base_stats" not in char:
                        char["base_stats"] = {}
                    if "graduation_stats" not in char:
                        char["graduation_stats"] = {}
                    
                    # Remove non-existent 'title' field if present
                    if "title" in char:
                        del char["title"]
                    
                    # Remove non-existent 'avatar' field from character if present
                    if "avatar" in char.get("character", {}):
                        del char["character"]["avatar"]
                
                self.refresh_list()
                # Clear content area if no data
                if not self.data and self.content_area.widget():
                    self.content_area.widget().deleteLater()
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Failed to load JSON: {e}")
                self.data = []
                self.refresh_list()
        else:
            self.data = []
            self.refresh_list()

    def save_data(self):
        """Save data to the current file path"""
        if not self.file_path:
            # If no file path, prompt for Save As
            self.save_as_file()
            return
        
        try:
            with open(self.file_path, 'w', encoding='utf-8') as f:
                json.dump(self.data, f, indent=2, ensure_ascii=False)
            self.show_status_message("Saved!")
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Failed to save: {e}")
    
    def save_as_file(self):
        """Save data to a new file path"""
        file_path, _ = QFileDialog.getSaveFileName(
            self,
            "Save Character JSON File",
            DEFAULT_FILE_PATH if not self.file_path else self.file_path,
            "JSON Files (*.json);;All Files (*)"
        )
        
        if file_path:
            self.file_path = file_path
            try:
                with open(self.file_path, 'w', encoding='utf-8') as f:
                    json.dump(self.data, f, indent=2, ensure_ascii=False)
                # Update window title
                self.setWindowTitle(f"Liquid Glass CRUD - {os.path.basename(file_path)}")
                self.show_status_message("Saved!")
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Failed to save: {e}")
    
    def show_status_message(self, message):
        """Show a temporary status message"""
        status = QLabel(message, self)
        status.setStyleSheet("background: rgba(0,255,0,0.5); padding: 10px; border-radius: 5px;")
        status.show()
        status.move(self.width() - 150, self.height() - 50)
        # Auto-hide after 2 seconds
        from PyQt6.QtCore import QTimer
        QTimer.singleShot(2000, status.hide)

    def refresh_list(self):
        self.char_list.clear()
        search = self.search_bar.text().lower()
        for i, char in enumerate(self.data):
            char_id = char.get('_id', char.get('id', '?'))
            char_name = char.get('character', {}).get('name', 'Unknown')
            label = f"{char_id} - {char_name}"
            if search in label.lower():
                self.char_list.addItem(label)
                self.char_list.item(self.char_list.count()-1).setData(Qt.ItemDataRole.UserRole, i)

    def filter_list(self):
        self.refresh_list()
        
    def load_character_form(self, item):
        idx = item.data(Qt.ItemDataRole.UserRole)
        char_data = self.data[idx]
        
        # Clear old form
        if self.content_area.widget():
            self.content_area.widget().deleteLater()
            
        form = CharacterForm(char_data)
        self.content_area.setWidget(form)
        
    def add_character(self):
        # Ask for template
        dialog = QDialog(self)
        dialog.setWindowTitle("New Character")
        layout = QVBoxLayout(dialog)
        combo = QComboBox()
        combo.addItems(["Genshin", "HSR", "ZZZ", "Empty"])
        layout.addWidget(QLabel("Select Template Type:"))
        layout.addWidget(combo)
        btns = QDialogButtonBox(QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel)
        btns.accepted.connect(dialog.accept)
        btns.rejected.connect(dialog.reject)
        layout.addWidget(btns)
        
        if dialog.exec():
            template_name = combo.currentText()
            # Generate a unique _id (use max existing _id + 1, or 0 if no data)
            max_id = max([char.get("_id", char.get("id", 0)) for char in self.data] + [0], default=0)
            if isinstance(max_id, (int, float)):
                new_id = int(max_id) + 1
            else:
                new_id = 0
            
            new_char = {
                "_id": new_id,
                "character": {
                    "name": "New Character",
                    "tags": [],
                    "iconPath": "",
                    "splashPath": "",
                    "tier": None
                },
                "base_stats": {},
                "graduation_stats": {},
                "sections": []
            }
            
            if template_name in GAME_TEMPLATES:
                import copy
                tmpl = GAME_TEMPLATES[template_name]
                new_char["base_stats"] = copy.deepcopy(tmpl["base_stats"])
                new_char["graduation_stats"] = copy.deepcopy(tmpl["graduation_stats"])
                
                # Pre-add sections based on game type
                if template_name == "Genshin":
                    new_char["sections"] = [
                        {"key": "materials", "title": "Upgrade Materials", "type": "material-grid", "items": []},
                        {"key": "weapons", "title": "Best Weapons", "type": "ranked-list", "items": []},
                        {"key": "artifacts", "title": "Best Artifacts", "type": "ranked-list", "items": []},
                        {"key": "stats", "title": "Best Stats", "type": "stat-grid", "items": []}
                    ]
                elif template_name == "HSR":
                    new_char["sections"] = [
                        {"key": "materials", "title": "Upgrade Materials", "type": "material-grid", "items": []},
                        {"key": "relics", "title": "Best Relics", "type": "ranked-list", "items": []},
                        {"key": "light_cones", "title": "Best Light Cones", "type": "list", "items": []}
                    ]
                elif template_name == "ZZZ":
                     new_char["sections"] = [
                        {"key": "disk_sets", "title": "Best Disk Drives", "type": "ranked-list", "items": []},
                        {"key": "weapons", "title": "Best W-Engines", "type": "list", "items": []},
                        {"key": "main_stats", "title": "Best Main Stats", "type": "stat-grid", "items": []}
                    ]

            self.data.append(new_char)
            self.refresh_list()
            # Select new
            self.char_list.setCurrentRow(self.char_list.count()-1)
            self.load_character_form(self.char_list.item(self.char_list.count()-1))

    def delete_character(self):
        row = self.char_list.currentRow()
        if row < 0: return
        
        reply = QMessageBox.question(self, "Confirm", "Are you sure you want to delete this character?", QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No)
        if reply == QMessageBox.StandardButton.Yes:
            item = self.char_list.item(row)
            idx = item.data(Qt.ItemDataRole.UserRole)
            del self.data[idx]
            self.refresh_list()
            if self.content_area.widget():
                self.content_area.widget().deleteLater()


if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setStyleSheet(STYLESHEET)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())
