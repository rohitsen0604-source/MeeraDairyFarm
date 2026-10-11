with open('src/main.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()
for i, line in enumerate(lines[-35:], start=len(lines)-35+1):
    print(f"{i}: {repr(line)}")
