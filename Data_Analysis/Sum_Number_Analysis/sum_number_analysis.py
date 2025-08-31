import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from itertools import combinations
import os
from datetime import datetime

# Set up paths
input_file = '/Users/tobi/Documents/Lotto/Lotto_Website/Data_Analysis/Data/drawing_results_20250808.csv'
output_dir = '/Users/tobi/Documents/Lotto/Lotto_Website/Data_Analysis/Sum_Number_Analysis'

# Create output directory if it doesn't exist
os.makedirs(output_dir, exist_ok=True)

def load_data():
    """Load the drawing results data"""
    df = pd.read_csv(input_file)
    # Convert date column to datetime (assuming there's a date column)
    if 'Datum' in df.columns:
        df['Datum'] = pd.to_datetime(df['Datum'])
        date_col = 'Datum'
    elif 'Date' in df.columns:
        df['Date'] = pd.to_datetime(df['Date'])
        date_col = 'Date'
    else:
        raise ValueError("No date column found (expected 'Datum' or 'Date')")
    return df, date_col

def calculate_main_number_sums(df):
    """Calculate sum of main numbers (Z1-Z5) for each pick"""
    main_cols = ['Z1', 'Z2', 'Z3', 'Z4', 'Z5']
    return df[main_cols].sum(axis=1)

def calculate_euro_number_sums(df, date_col='Datum'):
    """Calculate sum of euro numbers (EZ1, EZ2) for each pick with date filtering"""
    euro_cols = ['EZ1', 'EZ2']
    df['euro_sum'] = df[euro_cols].sum(axis=1)
    
    # Filter by date ranges
    euro_sums = {}
    
    # Period 1: 2012-03-23 to 2014-10-03 (euro numbers 1-8)
    mask1 = (df[date_col] >= '2012-03-23') & (df[date_col] <= '2014-10-03')
    euro_sums['2012_2014'] = df.loc[mask1, 'euro_sum']
    
    # Period 2: 2014-10-10 to 2022-03-18 (euro numbers 1-10)
    mask2 = (df[date_col] >= '2014-10-10') & (df[date_col] <= '2022-03-18')
    euro_sums['2014_2022'] = df.loc[mask2, 'euro_sum']
    
    # Period 3: 2022-03-25 to now (euro numbers 1-12)
    mask3 = df[date_col] >= '2022-03-25'
    euro_sums['2022_present'] = df.loc[mask3, 'euro_sum']
    
    return euro_sums

def theoretical_main_sum_distribution():
    """Calculate theoretical distribution for sum of 5 distinct main numbers from 1-50"""
    print("Calculating theoretical main number sum distribution...")
    print("Using combinations (5 distinct numbers from 1-50)")
    
    # Generate all possible combinations of 5 distinct numbers from 1-50
    numbers = list(range(1, 51))
    all_combinations = list(combinations(numbers, 5))
    
    print(f"Total number of combinations: {len(all_combinations)}")
    print(f"Expected total: C(50,5) = {50*49*48*47*46//120}")
    
    # Calculate sums
    sums = [sum(combo) for combo in all_combinations]
    
    # Verify min and max sums
    min_sum = min(sums)
    max_sum = max(sums)
    expected_min = sum(range(1, 6))  # 1+2+3+4+5 = 15
    expected_max = sum(range(46, 51))  # 46+47+48+49+50 = 240
    
    print(f"Minimum sum: {min_sum} (expected: {expected_min})")
    print(f"Maximum sum: {max_sum} (expected: {expected_max})")
    
    # Create frequency distribution
    unique_sums, counts = np.unique(sums, return_counts=True)
    probabilities = counts / len(sums)
    
    print(f"Sum range: {unique_sums[0]} to {unique_sums[-1]}")
    print(f"Number of possible sum values: {len(unique_sums)}")
    
    # Find the peak
    max_prob_idx = np.argmax(probabilities)
    peak_sum = unique_sums[max_prob_idx]
    peak_prob = probabilities[max_prob_idx]
    print(f"Peak at sum {peak_sum} with probability {peak_prob:.6f}")
    
    return pd.DataFrame({
        'sum': unique_sums,
        'probability': probabilities,
        'count': counts
    })

def theoretical_euro_sum_distribution(max_euro):
    """Calculate theoretical distribution for sum of 2 distinct euro numbers"""
    print(f"Calculating theoretical euro number sum distribution (1-{max_euro})...")
    
    # Generate all possible combinations of 2 distinct numbers from 1-max_euro
    numbers = list(range(1, max_euro + 1))
    all_combinations = list(combinations(numbers, 2))
    
    print(f"Total number of combinations: {len(all_combinations)}")
    print(f"Expected total: C({max_euro},2) = {max_euro*(max_euro-1)//2}")
    
    # Calculate sums
    sums = [sum(combo) for combo in all_combinations]
    
    # Verify min and max sums
    min_sum = min(sums)
    max_sum = max(sums)
    expected_min = 1 + 2  # minimum: 1+2 = 3
    expected_max = (max_euro - 1) + max_euro  # maximum
    
    print(f"Minimum sum: {min_sum} (expected: {expected_min})")
    print(f"Maximum sum: {max_sum} (expected: {expected_max})")
    
    # Create frequency distribution
    unique_sums, counts = np.unique(sums, return_counts=True)
    probabilities = counts / len(sums)
    
    print(f"Sum range: {unique_sums[0]} to {unique_sums[-1]}")
    print(f"Number of possible sum values: {len(unique_sums)}")
    
    return pd.DataFrame({
        'sum': unique_sums,
        'probability': probabilities,
        'count': counts
    })

def create_empirical_distribution(data, title_suffix=""):
    """Create empirical distribution from data with frequency column"""
    value_counts = data.value_counts().sort_index()
    probabilities = value_counts / len(data)
    
    return pd.DataFrame({
        'sum': value_counts.index,
        'frequency': value_counts.values,
        'probability': probabilities.values
    })

def save_results(df, filename_base, title, xlabel="Sum", ylabel_emp="Frequency", ylabel_theo="Probability"):
    """Save CSV and create PNG visualization"""
    # Save CSV
    csv_filename = f"{output_dir}/{filename_base}.csv"
    df.to_csv(csv_filename, index=False)
    print(f"Saved: {csv_filename}")
    
    # Create visualization
    plt.figure(figsize=(12, 8))
    
    if 'frequency' in df.columns:
        # Empirical distribution
        plt.bar(df['sum'], df['frequency'], alpha=0.7, color='skyblue', edgecolor='black')
        plt.ylabel(ylabel_emp)
    else:
        # Theoretical distribution
        plt.plot(df['sum'], df['probability'], 'r-', linewidth=2, marker='o', markersize=3, alpha=0.8)
        plt.ylabel(ylabel_theo)
        plt.grid(True, alpha=0.3)
    
    plt.xlabel(xlabel)
    plt.title(title)
    plt.tight_layout()
    
    # Save PNG
    png_filename = f"{output_dir}/{filename_base}.png"
    plt.savefig(png_filename, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"Saved: {png_filename}")

def main():
    print("Loading data...")
    df, date_col = load_data()
    
    print(f"Loaded {len(df)} records")
    print(f"Date range: {df[date_col].min()} to {df[date_col].max()}")
    
    print("\n" + "="*60)
    print("ANALYZING MAIN NUMBER SUMS")
    print("="*60)
    
    # 1. Empirical main number sum distribution
    main_sums = calculate_main_number_sums(df)
    print(f"Main number sum range in data: {main_sums.min()} to {main_sums.max()}")
    
    empirical_main = create_empirical_distribution(main_sums)
    save_results(
        empirical_main, 
        "main_numbers_empirical_sum_distribution",
        "Empirical Distribution of Main Numbers Sum (5 numbers from 1-50)",
        "Sum of Main Numbers"
    )
    
    # 2. Theoretical main number sum distribution
    print("\n" + "-"*40)
    theoretical_main = theoretical_main_sum_distribution()
    save_results(
        theoretical_main,
        "main_numbers_theoretical_sum_distribution", 
        "Theoretical Distribution of Main Numbers Sum (5 distinct numbers from 1-50)",
        "Sum of Main Numbers",
        ylabel_theo="Probability"
    )
    
    print("\n" + "="*60)
    print("ANALYZING EURO NUMBER SUMS")
    print("="*60)
    
    euro_sums = calculate_euro_number_sums(df, date_col)
    
    # Period 1: 2012-2014 (1-8)
    print(f"\nPeriod 1 (2012-2014) draws: {len(euro_sums['2012_2014'])}")
    if len(euro_sums['2012_2014']) > 0:
        print(f"Euro sum range: {euro_sums['2012_2014'].min()} to {euro_sums['2012_2014'].max()}")
        
        # 3. Empirical euro sum distribution (2012-2014)
        empirical_euro1 = create_empirical_distribution(euro_sums['2012_2014'])
        save_results(
            empirical_euro1,
            "euro_numbers_2012_2014_empirical_sum_distribution",
            "Empirical Distribution of Euro Numbers Sum (2012-2014, 2 numbers from 1-8)",
            "Sum of Euro Numbers"
        )
        
        # 4. Theoretical euro sum distribution (2012-2014)
        print("\n" + "-"*30)
        theoretical_euro1 = theoretical_euro_sum_distribution(8)
        save_results(
            theoretical_euro1,
            "euro_numbers_2012_2014_theoretical_sum_distribution",
            "Theoretical Distribution of Euro Numbers Sum (2012-2014, 2 distinct numbers from 1-8)",
            "Sum of Euro Numbers",
            ylabel_theo="Probability"
        )
    
    # Period 2: 2014-2022 (1-10)
    print(f"\nPeriod 2 (2014-2022) draws: {len(euro_sums['2014_2022'])}")
    if len(euro_sums['2014_2022']) > 0:
        print(f"Euro sum range: {euro_sums['2014_2022'].min()} to {euro_sums['2014_2022'].max()}")
        
        # 5. Empirical euro sum distribution (2014-2022)
        empirical_euro2 = create_empirical_distribution(euro_sums['2014_2022'])
        save_results(
            empirical_euro2,
            "euro_numbers_2014_2022_empirical_sum_distribution",
            "Empirical Distribution of Euro Numbers Sum (2014-2022, 2 numbers from 1-10)",
            "Sum of Euro Numbers"
        )
        
        # 6. Theoretical euro sum distribution (2014-2022)
        print("\n" + "-"*30)
        theoretical_euro2 = theoretical_euro_sum_distribution(10)
        save_results(
            theoretical_euro2,
            "euro_numbers_2014_2022_theoretical_sum_distribution",
            "Theoretical Distribution of Euro Numbers Sum (2014-2022, 2 distinct numbers from 1-10)",
            "Sum of Euro Numbers",
            ylabel_theo="Probability"
        )
    
    # Period 3: 2022-present (1-12)
    print(f"\nPeriod 3 (2022-present) draws: {len(euro_sums['2022_present'])}")
    if len(euro_sums['2022_present']) > 0:
        print(f"Euro sum range: {euro_sums['2022_present'].min()} to {euro_sums['2022_present'].max()}")
        
        # 7. Empirical euro sum distribution (2022-present)
        empirical_euro3 = create_empirical_distribution(euro_sums['2022_present'])
        save_results(
            empirical_euro3,
            "euro_numbers_2022_present_empirical_sum_distribution",
            "Empirical Distribution of Euro Numbers Sum (2022-present, 2 numbers from 1-12)",
            "Sum of Euro Numbers"
        )
        
        # 8. Theoretical euro sum distribution (2022-present)
        print("\n" + "-"*30)
        theoretical_euro3 = theoretical_euro_sum_distribution(12)
        save_results(
            theoretical_euro3,
            "euro_numbers_2022_present_theoretical_sum_distribution",
            "Theoretical Distribution of Euro Numbers Sum (2022-present, 2 distinct numbers from 1-12)",
            "Sum of Euro Numbers",
            ylabel_theo="Probability"
        )
    
    print("\n" + "="*60)
    print("ANALYSIS COMPLETE!")
    print("="*60)
    print(f"All files saved to: {output_dir}")
    
    # Print summary statistics
    print(f"\nSummary:")
    print(f"Total draws analyzed: {len(df)}")
    print(f"Main number sum range: {main_sums.min()} - {main_sums.max()}")
    if len(euro_sums['2012_2014']) > 0:
        print(f"Period 1 (2012-2014) draws: {len(euro_sums['2012_2014'])}, sum range: {euro_sums['2012_2014'].min()}-{euro_sums['2012_2014'].max()}")
    if len(euro_sums['2014_2022']) > 0:
        print(f"Period 2 (2014-2022) draws: {len(euro_sums['2014_2022'])}, sum range: {euro_sums['2014_2022'].min()}-{euro_sums['2014_2022'].max()}")
    if len(euro_sums['2022_present']) > 0:
        print(f"Period 3 (2022-present) draws: {len(euro_sums['2022_present'])}, sum range: {euro_sums['2022_present'].min()}-{euro_sums['2022_present'].max()}")

if __name__ == "__main__":
    main()