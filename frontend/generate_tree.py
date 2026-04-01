import os

def generate_tree(startpath, output_file):
    # Folders you typically want to ignore in an Angular project
    exclude_dirs = {'.git', 'node_modules', '.angular', 'dist', '.vscode'}
    
    with open(output_file, 'w', encoding='utf-8') as f:
        for root, dirs, files in os.walk(startpath):
            # Filter out excluded directories in-place
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            # Calculate the depth level for indentation
            level = root.replace(startpath, '').count(os.sep)
            indent = ' ' * 4 * level
            
            # Write the current directory name
            folder_name = os.path.basename(root)
            if folder_name == '':  # Handle the root directory case
                folder_name = os.path.abspath(startpath)
            
            f.write(f'{indent}{folder_name}/\n')
            
            # Write the files in the directory
            sub_indent = ' ' * 4 * (level + 1)
            for file in files:
                f.write(f'{sub_indent}{file}\n')

if __name__ == "__main__":
    # Set your project path here
    project_path = r'D:\Dev\E-Commerce\frontend' 
    # Set your desired output text file name
    output_filename = 'project_structure.txt'
    
    if os.path.exists(project_path):
        generate_tree(project_path, output_filename)
        print(f"Success! Tree saved to {output_filename}")
    else:
        print("Path not found. Please check 'project_path'.")