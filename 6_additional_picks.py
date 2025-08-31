"""
ADDITIONAL 6 EUROJACKPOT PICKS GENERATOR

CONSTRAINTS:
1. Euro pairs of new picks must be different from existing 12 picks
2. The 6 new euro pairs must contain all 12 euro numbers
3. Main numbers of new pick must be different from existing picks that share euro numbers

EXISTING PICKS ANALYSIS:
- Used euro pairs: (1,12), (2,10), (3,5), (4,8), (6,7), (9,11)
- Need 6 new pairs using all remaining euro combinations
"""

import random
from itertools import combinations

def parse_existing_picks():
    """Parse the existing 12 picks."""
    existing_picks = [
        {'pick_number': 1, 'main_numbers': [14, 21, 32, 39, 48], 'euro_numbers': [2, 10]},
        {'pick_number': 2, 'main_numbers': [7, 13, 16, 47, 50], 'euro_numbers': [1, 12]},
        {'pick_number': 3, 'main_numbers': [8, 10, 23, 27, 39], 'euro_numbers': [4, 8]},
        {'pick_number': 4, 'main_numbers': [17, 20, 33, 36, 48], 'euro_numbers': [6, 7]},
        {'pick_number': 5, 'main_numbers': [11, 28, 32, 35, 36], 'euro_numbers': [3, 5]},
        {'pick_number': 6, 'main_numbers': [12, 25, 40, 43, 44], 'euro_numbers': [9, 11]},
        {'pick_number': 7, 'main_numbers': [1, 29, 30, 49, 50], 'euro_numbers': [4, 8]},
        {'pick_number': 8, 'main_numbers': [3, 19, 22, 40, 42], 'euro_numbers': [3, 5]},
        {'pick_number': 9, 'main_numbers': [31, 33, 37, 45, 49], 'euro_numbers': [1, 12]},
        {'pick_number': 10, 'main_numbers': [2, 4, 9, 26, 44], 'euro_numbers': [6, 7]},
        {'pick_number': 11, 'main_numbers': [18, 34, 41, 43, 46], 'euro_numbers': [9, 11]},
        {'pick_number': 12, 'main_numbers': [5, 6, 15, 24, 38], 'euro_numbers': [2, 10]},
        {'pick_number': 13, 'main_numbers': [17, 22, 36, 40, 43], 'euro_numbers': [8, 12]},
        {'pick_number': 14, 'main_numbers': [3,  7,  8, 18, 23], 'euro_numbers': [2, 6]},
        {'pick_number': 15, 'main_numbers': [3,  7, 13, 31, 33], 'euro_numbers': [9, 10]},
        {'pick_number': 16, 'main_numbers': [4, 12, 16, 26, 45], 'euro_numbers': [4, 5]},
        {'pick_number': 17, 'main_numbers': [8, 21, 28, 39, 45], 'euro_numbers': [7, 11]},
        {'pick_number': 18, 'main_numbers': [8, 18, 21, 25, 43], 'euro_numbers': [1, 3]}
    ]
    return existing_picks

def get_used_euro_pairs(existing_picks):
    """Get all euro pairs used in existing picks."""
    used_pairs = set()
    for pick in existing_picks:
        euro_pair = tuple(sorted(pick['euro_numbers']))
        used_pairs.add(euro_pair)
    return used_pairs

def get_forbidden_main_numbers(existing_picks, new_euro_numbers):
    """
    Get main numbers that cannot be used in new pick based on euro number overlap.
    """
    forbidden_numbers = set()
    new_euro_set = set(new_euro_numbers)
    
    print(f"  New euro numbers: {sorted(new_euro_numbers)}")
    print(f"  Checking overlaps with existing picks:")
    
    for pick in existing_picks:
        existing_euro_set = set(pick['euro_numbers'])
        # If there's any overlap in euro numbers
        if new_euro_set & existing_euro_set:  # Intersection is not empty
            overlap = new_euro_set & existing_euro_set
            print(f"    Pick {pick['pick_number']} euros {pick['euro_numbers']} - overlap: {sorted(overlap)} - forbidden mains: {pick['main_numbers']}")
            forbidden_numbers.update(pick['main_numbers'])
    
    return forbidden_numbers

def generate_new_euro_pairs(used_pairs):
    """
    Generate 6 new euro pairs that:
    1. Are different from existing pairs
    2. Use all 12 euro numbers exactly once
    """
    # Get all possible euro pairs
    all_possible_pairs = list(combinations(range(1, 13), 2))
    
    # Remove already used pairs
    available_pairs = [pair for pair in all_possible_pairs if pair not in used_pairs]
    
    print(f"Used euro pairs: {sorted(used_pairs)}")
    print(f"Available euro pairs: {len(available_pairs)} pairs")
    
    # Find a combination of 6 pairs that uses all 12 euro numbers
    max_attempts = 10000
    for attempt in range(max_attempts):
        # Randomly select 6 pairs
        if len(available_pairs) < 6:
            raise Exception("Not enough available pairs")
            
        candidate_pairs = random.sample(available_pairs, 6)
        
        # Check if all 12 euro numbers are used
        used_euros = set()
        for pair in candidate_pairs:
            used_euros.update(pair)
        
        if len(used_euros) == 12:  # All euro numbers used
            return candidate_pairs
    
    # If no valid combination found, try systematic approach
    print("Random approach failed, trying systematic approach...")
    
    # Try to find valid combination systematically
    for combo in combinations(available_pairs, 6):
        used_euros = set()
        for pair in combo:
            used_euros.update(pair)
        if len(used_euros) == 12:
            return list(combo)
    
    raise Exception("Could not find 6 euro pairs that use all 12 numbers")

def generate_6_additional_picks():
    """Generate 6 additional picks with the specified constraints."""
    existing_picks = parse_existing_picks()
    
    print("EXISTING PICKS:")
    for pick in existing_picks:
        main_str = ' '.join(f"{num:2d}" for num in pick['main_numbers'])
        euro_str = ' '.join(f"{num:2d}" for num in pick['euro_numbers'])
        print(f"Pick {pick['pick_number']:2d}: Main: {main_str} | Euro: {euro_str}")
    
    # Get used euro pairs
    used_euro_pairs = get_used_euro_pairs(existing_picks)
    
    # Generate new euro pairs
    print(f"\n" + "="*60)
    print("GENERATING NEW EURO PAIRS")
    print("="*60)
    
    new_euro_pairs = generate_new_euro_pairs(used_euro_pairs)
    print(f"\nSelected new euro pairs: {new_euro_pairs}")
    
    # Verify all 12 euro numbers are used
    all_euros_in_new = set()
    for pair in new_euro_pairs:
        all_euros_in_new.update(pair)
    print(f"Euro numbers in new pairs: {sorted(all_euros_in_new)}")
    print(f"All 12 euro numbers used: {len(all_euros_in_new) == 12}")
    
    # Generate picks
    print(f"\n" + "="*60)
    print("GENERATING NEW PICKS")
    print("="*60)
    
    new_picks = []
    
    for i, euro_pair in enumerate(new_euro_pairs):
        print(f"\nGenerating Pick {13+i}:")
        
        # Get forbidden main numbers for this euro pair
        forbidden_numbers = get_forbidden_main_numbers(existing_picks, euro_pair)
        
        # Get available main numbers
        available_numbers = [num for num in range(1, 51) if num not in forbidden_numbers]
        
        print(f"  Forbidden main numbers: {sorted(forbidden_numbers)} (total: {len(forbidden_numbers)})")
        print(f"  Available main numbers: {len(available_numbers)} numbers")
        
        if len(available_numbers) < 5:
            raise Exception(f"Not enough available main numbers for pick {13+i}. Need 5, have {len(available_numbers)}")
        
        # Generate 5 random main numbers from available ones
        main_numbers = sorted(random.sample(available_numbers, 5))
        
        pick = {
            'pick_number': 13 + i,
            'main_numbers': main_numbers,
            'euro_numbers': list(euro_pair)
        }
        new_picks.append(pick)
        
        main_str = ' '.join(f"{num:2d}" for num in main_numbers)
        euro_str = ' '.join(f"{num:2d}" for num in euro_pair)
        print(f"  Generated: Pick {pick['pick_number']:2d}: Main: {main_str} | Euro: {euro_str}")
    
    return new_picks

def display_pick(pick):
    """Display a single pick in formatted way."""
    main_str = ' '.join(f"{num:2d}" for num in pick['main_numbers'])
    euro_str = ' '.join(f"{num:2d}" for num in pick['euro_numbers'])
    print(f"Pick {pick['pick_number']:2d}: Main: {main_str} | Euro: {euro_str}")

def verify_constraints(existing_picks, new_picks):
    """Verify all constraints are met."""
    print(f"\n" + "="*60)
    print("CONSTRAINT VERIFICATION")
    print("="*60)
    
    # Constraint 1: Euro pairs different from existing
    existing_euro_pairs = get_used_euro_pairs(existing_picks)
    new_euro_pairs = set()
    
    for pick in new_picks:
        euro_pair = tuple(sorted(pick['euro_numbers']))
        new_euro_pairs.add(euro_pair)
    
    overlap = existing_euro_pairs & new_euro_pairs
    print(f"\n1. Euro pairs different from existing:")
    print(f"   Existing euro pairs: {sorted(existing_euro_pairs)}")
    print(f"   New euro pairs: {sorted(new_euro_pairs)}")
    print(f"   Overlap: {sorted(overlap)}")
    print(f"   ✓ Constraint satisfied: {len(overlap) == 0}")
    
    # Constraint 2: All 12 euro numbers used in new picks
    all_euros_in_new = set()
    for pick in new_picks:
        all_euros_in_new.update(pick['euro_numbers'])
    
    print(f"\n2. All 12 euro numbers used in new picks:")
    print(f"   Euro numbers in new picks: {sorted(all_euros_in_new)}")
    print(f"   ✓ Constraint satisfied: {len(all_euros_in_new) == 12}")
    
    # Constraint 3: Main numbers different from overlapping picks
    print(f"\n3. Main number constraints:")
    all_constraints_met = True
    
    for new_pick in new_picks:
        print(f"\n   Pick {new_pick['pick_number']} euros {new_pick['euro_numbers']}:")
        
        new_euro_set = set(new_pick['euro_numbers'])
        forbidden_numbers = set()
        
        for existing_pick in existing_picks:
            existing_euro_set = set(existing_pick['euro_numbers'])
            if new_euro_set & existing_euro_set:  # Has overlap
                overlap = new_euro_set & existing_euro_set
                print(f"     Overlaps with Pick {existing_pick['pick_number']} euros {existing_pick['euro_numbers']} (overlap: {sorted(overlap)})")
                print(f"     Forbidden mains from Pick {existing_pick['pick_number']}: {existing_pick['main_numbers']}")
                forbidden_numbers.update(existing_pick['main_numbers'])
        
        # Check if any main numbers violate constraint
        violations = set(new_pick['main_numbers']) & forbidden_numbers
        
        print(f"     New pick mains: {new_pick['main_numbers']}")
        print(f"     All forbidden mains: {sorted(forbidden_numbers)}")
        print(f"     Violations: {sorted(violations)}")
        
        constraint_met = len(violations) == 0
        print(f"     ✓ Constraint satisfied: {constraint_met}")
        
        if not constraint_met:
            all_constraints_met = False
    
    print(f"\n" + "="*60)
    if all_constraints_met:
        print("🎉 ALL CONSTRAINTS SATISFIED!")
    else:
        print("❌ SOME CONSTRAINTS VIOLATED!")
    print("="*60)

def main():
    """Generate and display 6 additional picks."""
    print("GENERATING 6 ADDITIONAL EUROJACKPOT PICKS")
    print("="*60)
    
    # Generate the picks
    new_picks = generate_6_additional_picks()
    
    # Display results
    print(f"\n" + "="*60)
    print("FINAL RESULTS - 6 ADDITIONAL PICKS")
    print("="*60)
    
    for pick in new_picks:
        display_pick(pick)
    
    # Verify constraints
    existing_picks = parse_existing_picks()
    verify_constraints(existing_picks, new_picks)

if __name__ == "__main__":
    main()