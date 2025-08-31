import pandas as pd
import numpy as np
from scipy.special import comb
import os

def count_even_numbers(numbers):
    """Count how many even numbers are in a list of numbers"""
    return sum(1 for num in numbers if num % 2 == 0)

def calculate_hypergeometric_probability(n_total, n_even, k_draw, k_even):
    """
    Calculate hypergeometric probability
    n_total: total numbers available
    n_even: total even numbers available  
    k_draw: numbers drawn
    k_even: even numbers drawn
    """
    n_odd = n_total - n_even
    k_odd = k_draw - k_even
    
    if k_even < 0 or k_odd < 0 or k_even > n_even or k_odd > n_odd:
        return 0.0
    
    numerator = comb(n_even, k_even, exact=True) * comb(n_odd, k_odd, exact=True)
    denominator = comb(n_total, k_draw, exact=True)
    
    return float(numerator) / float(denominator)

def get_euro_theoretical_probabilities():
    """
    Return theoretical probabilities for euro numbers (always the same)
    Since euro ranges always have equal even/odd numbers
    """
    return {
        0: 0.25,  # 0 even, 2 odd
        1: 0.50,  # 1 even, 1 odd  
        2: 0.25   # 2 even, 0 odd
    }

def analyze_even_odd_patterns(data, number_columns, output_file, n_total, n_even, description, is_euro=False):
    """
    Analyze even-odd patterns for given columns
    """
    print(f"\nAnalyzing {description}...")
    
    # Count even numbers for each row
    even_counts = []
    for _, row in data.iterrows():
        numbers = [row[col] for col in number_columns]
        even_count = count_even_numbers(numbers)
        even_counts.append(even_count)
    
    # Count frequencies of each even count
    max_even = len(number_columns)
    results = []
    
    total_draws = len(even_counts)
    
    # Get theoretical probabilities
    if is_euro:
        theoretical_probs = get_euro_theoretical_probabilities()
    else:
        theoretical_probs = {}
        for even_count in range(max_even + 1):
            theoretical_probs[even_count] = calculate_hypergeometric_probability(
                n_total, n_even, len(number_columns), even_count
            )
    
    for even_count in range(max_even + 1):
        absolute_freq = even_counts.count(even_count)
        relative_freq = absolute_freq / total_draws
        theoretical_prob = theoretical_probs.get(even_count, 0.0)
        
        results.append({
            'even_count': even_count,
            'empirical_frequency': absolute_freq,
            'empirical_relative_frequency': relative_freq,
            'theoretical_probability': theoretical_prob
        })
        
        print(f"  {even_count} even numbers: {absolute_freq} times ({relative_freq:.4f}) - theoretical: {theoretical_prob:.4f}")
    
    # Create DataFrame and save to CSV
    df_results = pd.DataFrame(results)
    
    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    df_results.to_csv(output_file, index=False)
    print(f"  Results saved to: {output_file}")
    
    return df_results

def calculate_combined_theoretical_probabilities():
    """
    Calculate theoretical probabilities for combined main + euro numbers
    This uses the fact that main and euro draws are independent
    """
    # Main numbers probabilities (5 from 50, 25 even, 25 odd)
    main_probs = {}
    for k in range(6):  # 0 to 5 even in main numbers
        main_probs[k] = calculate_hypergeometric_probability(50, 25, 5, k)
    
    # Euro numbers probabilities (always the same)
    euro_probs = get_euro_theoretical_probabilities()
    
    # Combined probabilities (independent events)
    combined_probs = {}
    for main_even in range(6):  # 0-5 even main numbers
        for euro_even in range(3):  # 0-2 even euro numbers
            total_even = main_even + euro_even
            prob = main_probs[main_even] * euro_probs[euro_even]
            
            if total_even in combined_probs:
                combined_probs[total_even] += prob
            else:
                combined_probs[total_even] = prob
    
    return combined_probs

def main():
    # Read the data
    data_file = "Data_Analysis/Data/drawing_results_20250829.csv"
    
    try:
        data = pd.read_csv(data_file)
        print(f"Loaded {len(data)} draws from {data_file}")
        print(f"Columns: {list(data.columns)}")
        
        # Display first few rows for verification
        print("\nFirst 5 rows:")
        print(data.head())
        
    except FileNotFoundError:
        print(f"Error: Could not find file {data_file}")
        return
    except Exception as e:
        print(f"Error reading file: {e}")
        return
    
    # Job 1: Main numbers even-odd analysis (Z1-Z5)
    main_columns = ['Z1', 'Z2', 'Z3', 'Z4', 'Z5']
    main_output = "Data_Analysis/Even_Odd_Analysis/main_numbers_even_odd_analysis.csv"
    
    analyze_even_odd_patterns(
        data, 
        main_columns, 
        main_output,
        n_total=50,  # Main numbers range 1-50
        n_even=25,   # Even numbers: 2,4,6...50
        description="Main Numbers (Z1-Z5)",
        is_euro=False
    )
    
    # Job 2: Euro numbers even-odd analysis (EZ1-EZ2)
    euro_columns = ['EZ1', 'EZ2']
    euro_output = "Data_Analysis/Even_Odd_Analysis/euro_numbers_even_odd_analysis.csv"
    
    print(f"\nEuro numbers always have equal even/odd distribution")
    print(f"Theoretical probabilities are constant regardless of range")
    
    analyze_even_odd_patterns(
        data,
        euro_columns,
        euro_output,
        n_total=0,   # Not used for euro
        n_even=0,    # Not used for euro
        description="Euro Numbers (EZ1-EZ2)",
        is_euro=True
    )
    
    # Job 3: Combined analysis (Z1-Z5 + EZ1-EZ2)
    combined_columns = ['Z1', 'Z2', 'Z3', 'Z4', 'Z5', 'EZ1', 'EZ2']
    combined_output = "Data_Analysis/Even_Odd_Analysis/combined_numbers_even_odd_analysis.csv"
    
    print(f"\nAnalyzing Combined Numbers (Z1-Z5 + EZ1-EZ2)...")
    
    # Count even numbers for each row across all 7 numbers
    even_counts = []
    for _, row in data.iterrows():
        numbers = [row[col] for col in combined_columns]
        even_count = count_even_numbers(numbers)
        even_counts.append(even_count)
    
    # Get theoretical probabilities for combined analysis
    theoretical_probs = calculate_combined_theoretical_probabilities()
    
    # Count frequencies
    results = []
    total_draws = len(even_counts)
    
    for even_count in range(8):  # 0 to 7 even numbers possible
        absolute_freq = even_counts.count(even_count)
        relative_freq = absolute_freq / total_draws
        theoretical_prob = theoretical_probs.get(even_count, 0.0)
        
        results.append({
            'even_count': even_count,
            'empirical_frequency': absolute_freq,
            'empirical_relative_frequency': relative_freq,
            'theoretical_probability': theoretical_prob
        })
        
        print(f"  {even_count} even numbers: {absolute_freq} times ({relative_freq:.4f}) - theoretical: {theoretical_prob:.4f}")
    
    # Save combined results
    df_combined = pd.DataFrame(results)
    os.makedirs(os.path.dirname(combined_output), exist_ok=True)
    df_combined.to_csv(combined_output, index=False)
    print(f"  Results saved to: {combined_output}")
    
    print("\n" + "="*60)
    print("ANALYSIS COMPLETE!")
    print("="*60)
    print(f"Files generated:")
    print(f"1. {main_output}")
    print(f"2. {euro_output}")
    print(f"3. {combined_output}")

if __name__ == "__main__":
    main()