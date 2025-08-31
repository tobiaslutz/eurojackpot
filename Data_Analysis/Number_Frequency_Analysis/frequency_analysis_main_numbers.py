import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import os
from datetime import datetime

def analyze_main_numbers(df, output_dir):
    """Analyze main numbers (Z1-Z5) frequency"""
    print("\n" + "="*60)
    print("ANALYZING MAIN NUMBERS")
    print("="*60)
    
    # Initialize frequency counter for numbers 1-50
    absolute_frequencies = {i: 0 for i in range(1, 51)}
    
    # Count frequencies of each main number
    main_columns = ['Z1', 'Z2', 'Z3', 'Z4', 'Z5']
    total_numbers = 0
    
    for column in main_columns:
        if column in df.columns:
            for number in df[column]:
                if pd.notna(number) and 1 <= number <= 50:
                    absolute_frequencies[int(number)] += 1
                    total_numbers += 1
    
    print(f"Total main numbers processed: {total_numbers}")
    
    # Calculate relative frequencies
    relative_frequencies = {num: freq / total_numbers for num, freq in absolute_frequencies.items()}
    
    # Expected relative frequency
    expected_relative_freq = 1/50
    
    # Save absolute frequencies to CSV
    abs_freq_df = pd.DataFrame([
        {'Number': num, 'Absolute_Frequency': freq} 
        for num, freq in absolute_frequencies.items()
    ])
    abs_freq_file = os.path.join(output_dir, "main_numbers_absolute_frequencies.csv")
    abs_freq_df.to_csv(abs_freq_file, index=False)
    
    # Save relative frequencies to CSV
    rel_freq_df = pd.DataFrame([
        {'Number': num, 'Relative_Frequency': freq} 
        for num, freq in relative_frequencies.items()
    ])
    rel_freq_file = os.path.join(output_dir, "main_numbers_relative_frequencies.csv")
    rel_freq_df.to_csv(rel_freq_file, index=False)
    
    # Find most and least frequent numbers
    most_frequent_num = max(absolute_frequencies.items(), key=lambda x: x[1])[0]
    least_frequent_num = min(absolute_frequencies.items(), key=lambda x: x[1])[0]
    
    # Create plot
    numbers = list(range(1, 51))
    abs_freqs = [absolute_frequencies[num] for num in numbers]
    rel_freqs = [relative_frequencies[num] for num in numbers]
    
    fig, ax1 = plt.subplots(figsize=(15, 8))
    
    # Create color array for bars
    bar_colors = []
    for num in numbers:
        if num == most_frequent_num:
            bar_colors.append('red')
        elif num == least_frequent_num:
            bar_colors.append('green')
        else:
            bar_colors.append('tab:blue')
    
    # Plot bars
    color_axis = 'black'
    ax1.set_xlabel('Main Numbers (1-50)', fontsize=12)
    ax1.set_ylabel('Relative Frequency', color=color_axis, fontsize=12)
    bars1 = ax1.bar(numbers, rel_freqs, alpha=0.7, color=bar_colors)
    ax1.tick_params(axis='y', labelcolor=color_axis)
    ax1.set_ylim(0, max(rel_freqs) * 1.1)
    
    # Add expected frequency line
    ax1.axhline(y=expected_relative_freq, color='red', linestyle='--', linewidth=2)
    
    # Right y-axis for absolute frequencies
    ax2 = ax1.twinx()
    ax2.set_ylabel('Absolute Frequency', color=color_axis, fontsize=12)
    ax2.tick_params(axis='y', labelcolor=color_axis)
    ax2.set_ylim(0, max(abs_freqs) * 1.1)
    
    plt.title(f'Main Numbers Frequency Analysis\nBased on {len(df)} picks ({total_numbers} total numbers)', 
              fontsize=14, fontweight='bold')
    
    ax1.set_xticks(range(1, 51, 5))
    ax1.grid(True, alpha=0.3)
    
    # Legend
    from matplotlib.patches import Patch
    legend_elements = [
        Patch(facecolor='tab:blue', alpha=0.7, label='Normal Frequency'),
        Patch(facecolor='red', alpha=0.7, label=f'Most Frequent (#{most_frequent_num})'),
        Patch(facecolor='green', alpha=0.7, label=f'Least Frequent (#{least_frequent_num})'),
        plt.Line2D([0], [0], color='red', linestyle='--', linewidth=2, 
                   label=f'Expected Relative Frequency ({expected_relative_freq:.4f})')
    ]
    ax1.legend(handles=legend_elements, loc='upper right')
    
    plt.tight_layout()
    plot_file = os.path.join(output_dir, "main_numbers_frequency_analysis.png")
    plt.savefig(plot_file, dpi=300, bbox_inches='tight')
    plt.show()
    
    return absolute_frequencies, relative_frequencies, most_frequent_num, least_frequent_num

def analyze_euro_numbers(df, max_euro, interval_name, output_dir):
    """Analyze euro numbers (EZ1-EZ2) frequency for specific interval"""
    print(f"\n" + "="*60)
    print(f"ANALYZING EURO NUMBERS - {interval_name}")
    print(f"Euro numbers range: 1-{max_euro}")
    print("="*60)
    
    # Initialize frequency counter
    absolute_frequencies = {i: 0 for i in range(1, max_euro + 1)}
    
    # Count frequencies of each euro number
    euro_columns = ['EZ1', 'EZ2']
    total_numbers = 0
    
    for column in euro_columns:
        if column in df.columns:
            for number in df[column]:
                if pd.notna(number) and 1 <= number <= max_euro:
                    absolute_frequencies[int(number)] += 1
                    total_numbers += 1
    
    print(f"Total euro numbers processed: {total_numbers}")
    
    # Calculate relative frequencies
    relative_frequencies = {num: freq / total_numbers for num, freq in absolute_frequencies.items()}
    
    # Expected relative frequency
    expected_relative_freq = 1/max_euro
    
    # Create interval-specific output directory
    interval_dir = os.path.join(output_dir, f"euro_numbers_{interval_name.lower().replace(' ', '_')}")
    os.makedirs(interval_dir, exist_ok=True)
    
    # Save absolute frequencies to CSV
    abs_freq_df = pd.DataFrame([
        {'Number': num, 'Absolute_Frequency': freq} 
        for num, freq in absolute_frequencies.items()
    ])
    abs_freq_file = os.path.join(interval_dir, "absolute_frequencies.csv")
    abs_freq_df.to_csv(abs_freq_file, index=False)
    
    # Save relative frequencies to CSV
    rel_freq_df = pd.DataFrame([
        {'Number': num, 'Relative_Frequency': freq} 
        for num, freq in relative_frequencies.items()
    ])
    rel_freq_file = os.path.join(interval_dir, "relative_frequencies.csv")
    rel_freq_df.to_csv(rel_freq_file, index=False)
    
    # Find most and least frequent numbers
    most_frequent_num = max(absolute_frequencies.items(), key=lambda x: x[1])[0]
    least_frequent_num = min(absolute_frequencies.items(), key=lambda x: x[1])[0]
    
    # Create plot
    numbers = list(range(1, max_euro + 1))
    abs_freqs = [absolute_frequencies[num] for num in numbers]
    rel_freqs = [relative_frequencies[num] for num in numbers]
    
    fig, ax1 = plt.subplots(figsize=(12, 8))
    
    # Create color array for bars
    bar_colors = []
    for num in numbers:
        if num == most_frequent_num:
            bar_colors.append('red')
        elif num == least_frequent_num:
            bar_colors.append('green')
        else:
            bar_colors.append('tab:orange')
    
    # Plot bars
    color_axis = 'black'
    ax1.set_xlabel(f'Euro Numbers (1-{max_euro})', fontsize=12)
    ax1.set_ylabel('Relative Frequency', color=color_axis, fontsize=12)
    bars1 = ax1.bar(numbers, rel_freqs, alpha=0.7, color=bar_colors)
    ax1.tick_params(axis='y', labelcolor=color_axis)
    ax1.set_ylim(0, max(rel_freqs) * 1.1)
    
    # Add expected frequency line
    ax1.axhline(y=expected_relative_freq, color='red', linestyle='--', linewidth=2)
    
    # Right y-axis for absolute frequencies
    ax2 = ax1.twinx()
    ax2.set_ylabel('Absolute Frequency', color=color_axis, fontsize=12)
    ax2.tick_params(axis='y', labelcolor=color_axis)
    ax2.set_ylim(0, max(abs_freqs) * 1.1)
    
    plt.title(f'Euro Numbers Frequency Analysis - {interval_name}\n'
              f'Based on {len(df)} picks ({total_numbers} total euro numbers)', 
              fontsize=14, fontweight='bold')
    
    ax1.set_xticks(numbers)
    ax1.grid(True, alpha=0.3)
    
    # Legend
    from matplotlib.patches import Patch
    legend_elements = [
        Patch(facecolor='tab:orange', alpha=0.7, label='Normal Frequency'),
        Patch(facecolor='red', alpha=0.7, label=f'Most Frequent (#{most_frequent_num})'),
        Patch(facecolor='green', alpha=0.7, label=f'Least Frequent (#{least_frequent_num})'),
        plt.Line2D([0], [0], color='red', linestyle='--', linewidth=2, 
                   label=f'Expected Relative Frequency ({expected_relative_freq:.4f})')
    ]
    ax1.legend(handles=legend_elements, loc='upper right')
    
    plt.tight_layout()
    plot_file = os.path.join(interval_dir, "euro_numbers_frequency_analysis.png")
    plt.savefig(plot_file, dpi=300, bbox_inches='tight')
    plt.show()
    
    return absolute_frequencies, relative_frequencies, most_frequent_num, least_frequent_num

def main():
    # Read the CSV file
    data_file = "Data/drawing_results_20250808.csv"
    df = pd.read_csv(data_file)
    
    print(f"Loaded {len(df)} Eurojackpot picks")
    print(f"Columns: {list(df.columns)}")
    
    # Convert date column to datetime
    df['Datum'] = pd.to_datetime(df['Datum'])
    
    # Create main output directory
    output_dir = "Number_Frequency_Analysis"
    os.makedirs(output_dir, exist_ok=True)
    
    # Define date intervals for euro numbers
    interval_1_start = pd.to_datetime('2012-03-23')
    interval_1_end = pd.to_datetime('2014-10-03')
    interval_2_start = pd.to_datetime('2014-10-10')
    interval_2_end = pd.to_datetime('2022-03-18')
    interval_3_start = pd.to_datetime('2022-03-25')
    
    # Filter data for each interval
    interval_1_df = df[(df['Datum'] >= interval_1_start) & (df['Datum'] <= interval_1_end)]
    interval_2_df = df[(df['Datum'] >= interval_2_start) & (df['Datum'] <= interval_2_end)]
    interval_3_df = df[df['Datum'] >= interval_3_start]
    
    print(f"\nDate intervals:")
    print(f"Interval 1 (Euro 1-8): {len(interval_1_df)} picks from {interval_1_start.date()} to {interval_1_end.date()}")
    print(f"Interval 2 (Euro 1-10): {len(interval_2_df)} picks from {interval_2_start.date()} to {interval_2_end.date()}")
    print(f"Interval 3 (Euro 1-12): {len(interval_3_df)} picks from {interval_3_start.date()} onwards")
    
    # Analyze main numbers (for complete dataset)
    main_abs_freq, main_rel_freq, main_most_freq, main_least_freq = analyze_main_numbers(df, output_dir)
    
    # Analyze euro numbers for each interval
    euro_results = {}
    
    if len(interval_1_df) > 0:
        euro_results['interval_1'] = analyze_euro_numbers(
            interval_1_df, 8, "Interval 1 (2012-2014)", output_dir
        )
    
    if len(interval_2_df) > 0:
        euro_results['interval_2'] = analyze_euro_numbers(
            interval_2_df, 10, "Interval 2 (2014-2022)", output_dir
        )
    
    if len(interval_3_df) > 0:
        euro_results['interval_3'] = analyze_euro_numbers(
            interval_3_df, 12, "Interval 3 (2022-present)", output_dir
        )
    
    # Print comprehensive summary
    print("\n" + "="*80)
    print("COMPREHENSIVE ANALYSIS SUMMARY")
    print("="*80)
    
    # Main numbers summary
    frequencies_array = np.array(list(main_abs_freq.values()))
    print(f"\nMAIN NUMBERS (1-50):")
    print(f"Total picks analyzed: {len(df)}")
    print(f"Most frequent: #{main_most_freq} ({main_abs_freq[main_most_freq]} times)")
    print(f"Least frequent: #{main_least_freq} ({main_abs_freq[main_least_freq]} times)")
    print(f"Mean frequency: {np.mean(frequencies_array):.2f}")
    print(f"Standard deviation: {np.std(frequencies_array):.2f}")
    
    # Euro numbers summary for each interval
    for interval_name, (abs_freq, rel_freq, most_freq, least_freq) in euro_results.items():
        interval_num = interval_name.split('_')[1]
        max_euro = 8 if interval_num == '1' else (10 if interval_num == '2' else 12)
        frequencies_array = np.array(list(abs_freq.values()))
        
        print(f"\nEURO NUMBERS - INTERVAL {interval_num} (1-{max_euro}):")
        interval_df = interval_1_df if interval_num == '1' else (interval_2_df if interval_num == '2' else interval_3_df)
        print(f"Picks analyzed: {len(interval_df)}")
        print(f"Most frequent: #{most_freq} ({abs_freq[most_freq]} times)")
        print(f"Least frequent: #{least_freq} ({abs_freq[least_freq]} times)")
        print(f"Mean frequency: {np.mean(frequencies_array):.2f}")
        print(f"Standard deviation: {np.std(frequencies_array):.2f}")
    
    print(f"\nAll analysis files saved to: {output_dir}/")

if __name__ == "__main__":
    main()