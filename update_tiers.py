import json

# Tier list data
tier_list_json = """
[
  {
    "tier": 100,
    "name": "Lighter"
  },
  {
    "tier": 99,
    "name": "Miyabi"
  },
  {
    "tier": 98,
    "name": "Astra Yao"
  },
  {
    "tier": 97,
    "name": "Trigger"
  },
  {
    "tier": 96,
    "name": "Vivian"
  },
  {
    "tier": 95,
    "name": "Yixuan"
  },
  {
    "tier": 94,
    "name": "Ju Fufu"
  },
  {
    "tier": 93,
    "name": "Yuzuha"
  },
  {
    "tier": 92,
    "name": "Alice"
  },
  {
    "tier": 91,
    "name": "Lucia"
  },
  {
    "tier": 90,
    "name": "Dialyn"
  },
  {
    "tier": 89,
    "name": "Lycaon"
  },
  {
    "tier": 88,
    "name": "Soukaku"
  },
  {
    "tier": 87,
    "name": "Nicole"
  },
  {
    "tier": 86,
    "name": "Zhu Yuan"
  },
  {
    "tier": 85,
    "name": "Qingyi"
  },
  {
    "tier": 84,
    "name": "Jane Doe"
  },
  {
    "tier": 83,
    "name": "Caesar"
  },
  {
    "tier": 82,
    "name": "Burnice"
  },
  {
    "tier": 81,
    "name": "Yanagi"
  },
  {
    "tier": 80,
    "name": "Evelyn"
  },
  {
    "tier": 79,
    "name": "Anby Soldi..."
  },
  {
    "tier": 78,
    "name": "Hugo"
  },
  {
    "tier": 77,
    "name": "Seed"
  },
  {
    "tier": 76,
    "name": "Orphie & ..."
  },
  {
    "tier": 75,
    "name": "Yidhari"
  },
  {
    "tier": 74,
    "name": "Ellen"
  },
  {
    "tier": 73,
    "name": "Anby"
  },
  {
    "tier": 72,
    "name": "Koleda"
  },
  {
    "tier": 71,
    "name": "Rina"
  },
  {
    "tier": 70,
    "name": "Lucy"
  },
  {
    "tier": 69,
    "name": "Piper"
  },
  {
    "tier": 68,
    "name": "Harumasa"
  },
  {
    "tier": 67,
    "name": "Pulchra"
  },
  {
    "tier": 66,
    "name": "Pan Yinhu"
  },
  {
    "tier": 65,
    "name": "Manato"
  },
  {
    "tier": 64,
    "name": "Grace"
  },
  {
    "tier": 63,
    "name": "Nekomata"
  },
  {
    "tier": 62,
    "name": "Soldier 11"
  },
  {
    "tier": 61,
    "name": "Seth"
  },
  {
    "tier": 60,
    "name": "Anton"
  },
  {
    "tier": 59,
    "name": "Ben"
  },
  {
    "tier": 58,
    "name": "Billy"
  },
  {
    "tier": 57,
    "name": "Corin"
  }
]
"""

# Parse tier list
tier_list = json.loads(tier_list_json)

# Create a mapping from character name to tier
tier_mapping = {item["name"]: item["tier"] for item in tier_list}

# Read the characters.json file
characters_file_path = r"c:\Users\phamt\Documents\Code\VeriAsStat\public\data\characters\zzz\characters.json"

with open(characters_file_path, 'r', encoding='utf-8') as f:
    characters = json.load(f)

# Update tier values
updated_count = 0
not_found = []

for character in characters:
    char_name = character.get("name")
    if char_name in tier_mapping:
        old_tier = character.get("tier")
        new_tier = tier_mapping[char_name]
        character["tier"] = new_tier
        updated_count += 1
        print(f"Updated {char_name}: {old_tier} -> {new_tier}")
    else:
        not_found.append(char_name)

# Write the updated data back to the file
with open(characters_file_path, 'w', encoding='utf-8') as f:
    json.dump(characters, f, indent=2, ensure_ascii=False)

print(f"\n✅ Successfully updated {updated_count} characters!")

if not_found:
    print(f"\n⚠️ Characters not found in tier list ({len(not_found)}):")
    for name in not_found:
        print(f"  - {name}")

# Show characters in tier list that weren't found in the JSON file
tier_names = set(tier_mapping.keys())
json_names = set(char.get("name") for char in characters)
missing_in_json = tier_names - json_names

if missing_in_json:
    print(f"\n⚠️ Characters in tier list but not in JSON file ({len(missing_in_json)}):")
    for name in missing_in_json:
        print(f"  - {name}")
