#!/bin/bash
set -e

# Function name (passed as an argument or default to all)
FUNCTION_NAME=${1:-all}

# Build environment
RUSTFLAGS="-C link-arg=-s" # Strip symbols for smaller binary size

echo "Building Rust Lambda function(s) for AWS Lambda..."

# Create the build directory if it doesn't exist
mkdir -p .aws-sam/build

# Build for Amazon Linux 2
cargo build --release --target x86_64-unknown-linux-musl

# Copy the compiled binary to the function directory with the name "bootstrap"
if [ "$FUNCTION_NAME" == "all" ]; then
    # Copy for all functions defined in template.yaml
    echo "Copying binary for all functions"
    cp target/x86_64-unknown-linux-musl/release/kaiju-academy-backend .aws-sam/build/bootstrap
    
    # List of all function names in template.yaml
    FUNCTIONS=("AuthFunction" "UserFunction" "CourseFunction" "QuizFunction")
    
    for func in "${FUNCTIONS[@]}"; do
        mkdir -p .aws-sam/build/$func
        cp .aws-sam/build/bootstrap .aws-sam/build/$func/bootstrap
    done
else
    # Copy for specific function
    echo "Copying binary for $FUNCTION_NAME"
    mkdir -p .aws-sam/build/$FUNCTION_NAME
    cp target/x86_64-unknown-linux-musl/release/kaiju-academy-backend .aws-sam/build/$FUNCTION_NAME/bootstrap
fi

echo "Build completed successfully." 