# Existing euro pairs
existing_euro_pairs = {
    (2, 10), (1, 12), (4, 8), (6, 7), (3, 5), (9, 11),
    (4, 8), (3, 5), (1, 12), (6, 7), (9, 11), (2, 10),
    (8, 12), (2, 6), (9, 10), (4, 5), (7, 11), (1, 3)
}

# Remove duplicates - unique existing pairs:
unique_existing = {(1, 3), (1, 12), (2, 6), (2, 10), (3, 5), (4, 5), (4, 8), (6, 7), (7, 11), (8, 12), (9, 10), (9, 11)}

# All euro numbers must be used: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
# Need 6 new pairs that cover all 12 numbers

# Possible new euro pairs that use all 12 numbers:
new_euro_pairs = [(1, 2), (3, 4), (5, 6), (7, 8), (9, 12), (10, 11)]

# Now generate main numbers avoiding conflicts:

import random

def get_forbidden_mains(euro_pair, existing_picks):
    """Get main numbers that can't be used due to sharing euro numbers"""
    forbidden = set()
    for pick in existing_picks:
        pick_euros = (pick['euro'][0], pick['euro'][1])
        # If any euro number is shared, add all main numbers from that pick
        if euro_pair[0] in pick_euros or euro_pair[1] in pick_euros:
            forbidden.update(pick['main'])
    return forbidden

# Existing picks data structure
existing_picks = [
    {'main': [14, 21, 32, 39, 48], 'euro': [2, 10]},
    {'main': [7, 13, 16, 47, 50], 'euro': [1, 12]},
    {'main': [8, 10, 23, 27, 39], 'euro': [4, 8]},
    {'main': [17, 20, 33, 36, 48], 'euro': [6, 7]},
    {'main': [11, 28, 32, 35, 36], 'euro': [3, 5]},
    {'main': [12, 25, 40, 43, 44], 'euro': [9, 11]},
    {'main': [1, 29, 30, 49, 50], 'euro': [4, 8]},
    {'main': [3, 19, 22, 40, 42], 'euro': [3, 5]},
    {'main': [31, 33, 37, 45, 49], 'euro': [1, 12]},
    {'main': [2, 4, 9, 26, 44], 'euro': [6, 7]},
    {'main': [18, 34, 41, 43, 46], 'euro': [9, 11]},
    {'main': [5, 6, 15, 24, 38], 'euro': [2, 10]},
    {'main': [17, 22, 36, 40, 43], 'euro': [8, 12]},
    {'main': [3, 7, 8, 18, 23], 'euro': [2, 6]},
    {'main': [3, 7, 13, 31, 33], 'euro': [9, 10]},
    {'main': [4, 12, 16, 26, 45], 'euro': [4, 5]},
    {'main': [8, 21, 28, 39, 45], 'euro': [7, 11]},
    {'main': [8, 18, 21, 25, 43], 'euro': [1, 3]}
]

# Generate 6 additional picks
additional_picks = []

for i, euro_pair in enumerate(new_euro_pairs, 19):
    forbidden_mains = get_forbidden_mains(euro_pair, existing_picks)
    available_mains = [n for n in range(1, 51) if n not in forbidden_mains]
    
    # Select 5 main numbers randomly from available
    main_numbers = sorted(random.sample(available_mains, 5))
    
    additional_picks.append({
        'pick_num': i,
        'main': main_numbers,
        'euro': list(euro_pair)
    })

# Display results
print("6 ADDITIONAL PICKS:")
for pick in additional_picks:
    main_str = " ".join(f"{n:2d}" for n in pick['main'])
    euro_str = " ".join(f"{n:2d}" for n in pick['euro'])
    print(f"Pick {pick['pick_num']:2d}: Main: {main_str} | Euro: {euro_str}")

# Verify all euro numbers are used
all_euros_used = set()
for pick in additional_picks:
    all_euros_used.update(pick['euro'])

print(f"\nEuro numbers used: {sorted(all_euros_used)}")
print(f"All 12 euro numbers covered: {len(all_euros_used) == 12}")