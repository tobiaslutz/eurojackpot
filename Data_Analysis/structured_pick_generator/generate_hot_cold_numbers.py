import pandas as pd
import json
import os
from datetime import datetime

def load_main_numbers_data(csv_path):
    """
    Load main numbers frequency data from CSV.
    Expected format: Number,Absolute_Frequency,Relative_Frequency
    """
    try:
        df = pd.read_csv(csv_path)
        # Use all three columns as specified
        return df[['Number', 'Absolute_Frequency', 'Relative_Frequency']].copy()
            
    except Exception as e:
        print(f"Error loading main numbers data: {e}")
        print(f"Expected columns: Number, Absolute_Frequency, Relative_Frequency")
        raise

def load_euro_numbers_data(csv_path):
    """
    Load euro numbers frequency data from CSV.
    Expected format: Number,Relative_Frequency
    """
    try:
        df = pd.read_csv(csv_path)
        # Use the exact column names as specified
        return df[['Number', 'Relative_Frequency']].copy()
            
    except Exception as e:
        print(f"Error loading euro numbers data: {e}")
        print(f"Expected columns: Number, Relative_Frequency")
        raise

def categorize_numbers_with_frequencies(df, hot_count, cold_count, freq_column):
    """
    Categorize numbers into hot, cold, and neutral based on frequency.
    Include relative frequencies for each number.
    
    Args:
        df: DataFrame with Number and frequency columns
        hot_count: Number of hot numbers to select
        cold_count: Number of cold numbers to select
        freq_column: Name of the frequency column to use for sorting
    
    Returns:
        dict with hot, cold, neutral number lists including frequencies
    """
    # Sort by frequency (descending for hot, ascending for cold)
    df_sorted = df.sort_values(freq_column, ascending=False)
    
    # Get hot numbers (highest frequency)
    hot_df = df_sorted.head(hot_count)
    hot_numbers = []
    for _, row in hot_df.iterrows():
        hot_numbers.append({
            "number": int(row['Number']),
            "relativeFrequency": float(row['Relative_Frequency'])
        })
    
    # Get cold numbers (lowest frequency)
    cold_df = df_sorted.tail(cold_count)
    cold_numbers = []
    for _, row in cold_df.iterrows():
        cold_numbers.append({
            "number": int(row['Number']),
            "relativeFrequency": float(row['Relative_Frequency'])
        })
    
    # Get neutral numbers (everything else)
    hot_cold_numbers = set([item['number'] for item in hot_numbers + cold_numbers])
    neutral_df = df[~df['Number'].isin(hot_cold_numbers)]
    neutral_numbers = []
    for _, row in neutral_df.iterrows():
        neutral_numbers.append({
            "number": int(row['Number']),
            "relativeFrequency": float(row['Relative_Frequency'])
        })
    
    # Sort all lists by number for consistent output
    return {
        'hot': sorted(hot_numbers, key=lambda x: x['number']),
        'cold': sorted(cold_numbers, key=lambda x: x['number']),
        'neutral': sorted(neutral_numbers, key=lambda x: x['number'])
    }

def display_frequency_analysis(df, name, freq_column):
    """
    Display detailed frequency analysis for verification.
    """
    df_sorted = df.sort_values(freq_column, ascending=False)
    
    print(f"\n{name} Frequency Analysis:")
    print("-" * 30)
    print(f"Total numbers: {len(df)}")
    print(f"Frequency range: {df[freq_column].min():.6f} - {df[freq_column].max():.6f}")
    print(f"Average frequency: {df[freq_column].mean():.6f}")
    
    print(f"\nTop 5 most frequent:")
    for i, row in df_sorted.head(5).iterrows():
        print(f"  #{row['Number']}: {row[freq_column]:.6f}")
    
    print(f"\nTop 5 least frequent:")
    for i, row in df_sorted.tail(5).iterrows():
        print(f"  #{row['Number']}: {row[freq_column]:.6f}")

def generate_hot_cold_json():
    """
    Main function to generate the hot/cold numbers JSON file.
    """
    # Define file paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    main_csv_path = os.path.join(base_dir, '..', 'Number_Frequency_Analysis', 'main_numbers_frequency_analysis.csv')
    euro_csv_path = os.path.join(base_dir, '..', 'Number_Frequency_Analysis', 'euro_numbers_interval_3_(2022-present)', 'relative_frequencies.csv')
    output_path = os.path.join(base_dir, 'hot_cold_numbers.json')
    
    print("Eurojackpot Hot/Cold Numbers Generator")
    print("=====================================")
    print(f"Main numbers CSV: {main_csv_path}")
    print(f"Euro numbers CSV: {euro_csv_path}")
    
    try:
        # Load data
        print("\nLoading frequency data...")
        main_df = load_main_numbers_data(main_csv_path)
        euro_df = load_euro_numbers_data(euro_csv_path)
        
        print(f"✓ Loaded {len(main_df)} main numbers")
        print(f"✓ Loaded {len(euro_df)} euro numbers")
        
        # Display frequency analysis
        display_frequency_analysis(main_df, "Main Numbers", "Relative_Frequency")
        display_frequency_analysis(euro_df, "Euro Numbers", "Relative_Frequency")
        
        # Categorize main numbers (10 hot, 10 cold)
        print("\nCategorizing main numbers (10 hot, 10 cold)...")
        main_categories = categorize_numbers_with_frequencies(main_df, hot_count=10, cold_count=10, freq_column="Relative_Frequency")
        
        # Categorize euro numbers (3 hot, 3 cold)
        print(f"Categorizing euro numbers (3 hot, 3 cold)...")
        euro_categories = categorize_numbers_with_frequencies(euro_df, hot_count=3, cold_count=3, freq_column="Relative_Frequency")
        
        # Create final JSON structure
        hot_cold_data = {
            "main": main_categories,
            "euro": euro_categories,
            "lastUpdated": datetime.now().strftime("%Y-%m-%d"),
            "metadata": {
                "mainNumbersTotal": len(main_df),
                "euroNumbersTotal": len(euro_df),
                "mainHotCount": 10,
                "mainColdCount": 10,
                "euroHotCount": 3,
                "euroColdCount": 3,
                "generatedBy": "generate_hot_cold_numbers.py",
                "dataSource": {
                    "mainNumbers": "main_numbers_frequency_analysis.csv",
                    "euroNumbers": "euro_numbers_interval_3_(2022-present)/relative_frequencies.csv"
                },
                "description": "Numbers categorized by relative frequency with frequency values included"
            }
        }
        
        # Save to JSON file
        print(f"\nSaving to: {output_path}")
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(hot_cold_data, f, indent=2, ensure_ascii=False)
        
        # Display results
        print("\n" + "="*70)
        print("HOT/COLD NUMBERS GENERATED SUCCESSFULLY")
        print("="*70)
        
        print(f"\nMain Numbers (1-50):")
        print(f"  Hot (10):")
        for item in main_categories['hot']:
            print(f"    #{item['number']}: {item['relativeFrequency']:.6f}")
        
        print(f"\n  Cold (10):")
        for item in main_categories['cold']:
            print(f"    #{item['number']}: {item['relativeFrequency']:.6f}")
        
        print(f"\n  Neutral ({len(main_categories['neutral'])}): [numbers with frequencies]")
        
        print(f"\nEuro Numbers (1-{len(euro_df)}):")
        print(f"  Hot (3):")
        for item in euro_categories['hot']:
            print(f"    #{item['number']}: {item['relativeFrequency']:.6f}")
        
        print(f"\n  Cold (3):")
        for item in euro_categories['cold']:
            print(f"    #{item['number']}: {item['relativeFrequency']:.6f}")
        
        print(f"\n  Neutral ({len(euro_categories['neutral'])}): [numbers with frequencies]")
        
        print(f"\nJSON file saved: {output_path}")
        print(f"File size: {os.path.getsize(output_path)} bytes")
        
        return hot_cold_data
        
    except FileNotFoundError as e:
        print(f"❌ Error: CSV file not found - {e}")
        print("Please check that the CSV files exist at the specified paths.")
        raise
    except KeyError as e:
        print(f"❌ Error: Column not found - {e}")
        print("Please check that CSV files have the correct column names:")
        print("  Main file: Number, Absolute_Frequency, Relative_Frequency")
        print("  Euro file: Number, Relative_Frequency")
        raise
    except Exception as e:
        print(f"❌ Error generating hot/cold numbers: {e}")
        raise

def validate_output(data):
    """
    Validate the generated hot/cold data for correctness.
    """
    print("\nValidating output...")
    
    # Extract just the numbers for validation
    main_hot_numbers = [item['number'] for item in data['main']['hot']]
    main_cold_numbers = [item['number'] for item in data['main']['cold']]
    main_neutral_numbers = [item['number'] for item in data['main']['neutral']]
    main_all = main_hot_numbers + main_cold_numbers + main_neutral_numbers
    
    euro_hot_numbers = [item['number'] for item in data['euro']['hot']]
    euro_cold_numbers = [item['number'] for item in data['euro']['cold']]
    euro_neutral_numbers = [item['number'] for item in data['euro']['neutral']]
    euro_all = euro_hot_numbers + euro_cold_numbers + euro_neutral_numbers
    
    # Check main numbers (should be 1-50)
    expected_main = list(range(1, 51))
    
    if sorted(main_all) == expected_main:
        print("✓ Main numbers validation passed (all numbers 1-50 present)")
    else:
        print("❌ Main numbers validation failed")
        missing = set(expected_main) - set(main_all)
        extra = set(main_all) - set(expected_main)
        if missing:
            print(f"  Missing numbers: {sorted(missing)}")
        if extra:
            print(f"  Extra numbers: {sorted(extra)}")
        return False
    
    # Check euro numbers
    euro_min, euro_max = min(euro_all), max(euro_all)
    expected_euro = list(range(euro_min, euro_max + 1))
    
    if sorted(euro_all) == expected_euro:
        print(f"✓ Euro numbers validation passed (all numbers {euro_min}-{euro_max} present)")
    else:
        print("❌ Euro numbers validation failed")
        return False
    
    # Check for duplicates
    main_duplicates = len(main_all) != len(set(main_all))
    euro_duplicates = len(euro_all) != len(set(euro_all))
    
    if not main_duplicates and not euro_duplicates:
        print("✓ No duplicate numbers found")
    else:
        print("❌ Duplicate numbers detected")
        return False
    
    # Check counts
    if len(data['main']['hot']) == 10 and len(data['main']['cold']) == 10:
        print("✓ Main numbers counts correct (10 hot, 10 cold)")
    else:
        print(f"❌ Main numbers counts incorrect (got {len(data['main']['hot'])} hot, {len(data['main']['cold'])} cold)")
        return False
    
    if len(data['euro']['hot']) == 3 and len(data['euro']['cold']) == 3:
        print("✓ Euro numbers counts correct (3 hot, 3 cold)")
    else:
        print(f"❌ Euro numbers counts incorrect (got {len(data['euro']['hot'])} hot, {len(data['euro']['cold'])} cold)")
        return False
    
    # Check that all numbers have frequency data
    all_items = (data['main']['hot'] + data['main']['cold'] + data['main']['neutral'] +
                 data['euro']['hot'] + data['euro']['cold'] + data['euro']['neutral'])
    
    frequency_check = all('relativeFrequency' in item for item in all_items)
    if frequency_check:
        print("✓ All numbers have relative frequency data")
    else:
        print("❌ Some numbers missing relative frequency data")
        return False
    
    print("✓ All validations passed!")
    return True

if __name__ == "__main__":
    try:
        # Generate the hot/cold numbers
        data = generate_hot_cold_json()
        
        # Validate the output
        if validate_output(data):
            print("\n🎯 Hot/Cold numbers successfully generated and validated!")
            print(f"🔥 Use the generated file: hot_cold_numbers.json")
        else:
            print("\n❌ Validation failed. Please check the output.")
            exit(1)
            
    except Exception as e:
        print(f"\n❌ Script failed: {e}")
        exit(1)