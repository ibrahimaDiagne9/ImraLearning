
import os
import re

patterns = [
    r'\.map\(',
    r'\.filter\(',
    r'\.find\(',
    r'\.charAt\(',
    r'\.toLowerCase\(',
    r'\.toString\(',
    r'\.toFixed\(',
]

def scan_files(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    for pattern in patterns:
                        matches = re.finditer(pattern, content)
                        for match in matches:
                            # Look at the character before the dot
                            start = match.start()
                            if start > 0 and content[start-1] != '?':
                                # Found a potential crash point (no optional chaining)
                                # Get some context
                                line_no = content.count('\n', 0, start) + 1
                                context = content[max(0, start-30):min(len(content), start+30)].replace('\n', ' ')
                                print(f"Potential crash at {path}:{line_no} - {context}")

scan_files('c:/Users/SURFACE/Documents/ImraLearning/src')
