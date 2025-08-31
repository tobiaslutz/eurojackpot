import pandas as pd
import os

# The file generates a single output csv with absolute and relative frequencies

def analyze_main_number_frequencies():
    """
    Analyze the frequency of main numbers (1-50) from Eurojackpot drawing results.
    Creates a CSV file with absolute and relative frequencies.
    """
    
    # File paths
    input_file = 'Data_Analysis/Data/drawing_results_20250808.csv'
    output_dir = 'Data_Analysis/Number_Frequency_Analysis'
    output_file = os.path.join(output_dir, 'main_numbers_frequency_analysis.csv')
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    try:
        # Read the CSV file
        print(f"Reading data from {input_file}...")
        df = pd.read_csv(input_file)
        
        # Check if required columns exist
        main_number_columns = ['Z1', 'Z2', 'Z3', 'Z4', 'Z5']
        missing_columns = [col for col in main_number_columns if col not in df.columns]
        
        if missing_columns:
            print(f"Error: Missing columns: {missing_columns}")
            return
        
        print(f"Loaded {len(df)} drawing records")
        
        # Initialize frequency counter for numbers 1-50
        frequency_dict = {i: 0 for i in range(1, 51)}
        
        # Count frequencies across all main number columns
        total_numbers_drawn = 0
        for col in main_number_columns:
            for number in df[col]:
                if pd.notna(number) and 1 <= number <= 50:
                    frequency_dict[int(number)] += 1
                    total_numbers_drawn += 1
        
        print(f"Total main numbers analyzed: {total_numbers_drawn}")
        print(f"Expected total (5 numbers × {len(df)} draws): {5 * len(df)}")
        
        # Create results dataframe
        results = []
        for number in range(1, 51):
            absolute_freq = frequency_dict[number]
            relative_freq = absolute_freq / total_numbers_drawn if total_numbers_drawn > 0 else 0
            
            results.append({
                'Number': number,
                'Absolute_Frequency': absolute_freq,
                'Relative_Frequency': relative_freq
            })
        
        results_df = pd.DataFrame(results)
        
        # Save to CSV
        results_df.to_csv(output_file, index=False)
        print(f"\nResults saved to: {output_file}")
        
        # Display summary statistics
        print("\n=== FREQUENCY ANALYSIS SUMMARY ===")
        print(f"Total draws analyzed: {len(df)}")
        print(f"Total main numbers drawn: {total_numbers_drawn}")
        print(f"Average frequency per number: {total_numbers_drawn / 50:.2f}")
        print(f"Most frequent number: {results_df.loc[results_df['Absolute_Frequency'].idxmax(), 'Number']} "
              f"(frequency: {results_df['Absolute_Frequency'].max()})")
        print(f"Least frequent number: {results_df.loc[results_df['Absolute_Frequency'].idxmin(), 'Number']} "
              f"(frequency: {results_df['Absolute_Frequency'].min()})")
        print(f"Sum of relative frequencies: {results_df['Relative_Frequency'].sum():.6f}")
        
        # Display first few rows
        print("\n=== FIRST 10 NUMBERS ===")
        print(results_df.head(10).to_string(index=False))
        
        # Display numbers with highest frequencies
        print("\n=== TOP 10 MOST FREQUENT NUMBERS ===")
        top_10 = results_df.nlargest(10, 'Absolute_Frequency')
        print(top_10.to_string(index=False))
        
        # Display numbers with lowest frequencies
        print("\n=== TOP 10 LEAST FREQUENT NUMBERS ===")
        bottom_10 = results_df.nsmallest(10, 'Absolute_Frequency')
        print(bottom_10.to_string(index=False))
        
        return results_df
        
    except FileNotFoundError:
        print(f"Error: Could not find file {input_file}")
        print("Please ensure the file exists and the path is correct.")
    except pd.errors.EmptyDataError:
        print(f"Error: The file {input_file} is empty or corrupted.")
    except Exception as e:
        print(f"An unexpected error occurred: {str(e)}")

if __name__ == "__main__":
    # Run the analysis
    results = analyze_main_number_frequencies()
    
    if results is not None:
        print("\n✅ Main numbers frequency analysis completed successfully!")
        print("📁 Output file: Data_Analysis/Number_Frequency_Analysis/main_numbers_frequency_analysis.csv")
    else:
        print("\n❌ Analysis failed. Please check the error messages above.")