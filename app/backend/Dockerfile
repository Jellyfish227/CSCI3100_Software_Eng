FROM rust:latest as builder

WORKDIR /usr/src/app

# Install musl-tools to compile statically linked binary
RUN apt-get update && \
    apt-get install -y musl-tools musl-dev && \
    rustup target add x86_64-unknown-linux-musl

# Copy Cargo files to build dependencies
COPY Cargo.toml Cargo.lock ./

# Create empty source file for dependency caching
RUN mkdir -p src && \
    echo "fn main() {println!(\"if you see this, build failed\")}" > src/main.rs && \
    cargo build --release --target x86_64-unknown-linux-musl && \
    rm -rf src

# Copy source code
COPY . .

# Build the application
RUN cargo build --release --target x86_64-unknown-linux-musl

# Create a new stage with minimal image
FROM scratch

COPY --from=builder /usr/src/app/target/x86_64-unknown-linux-musl/release/kaiju-academy-backend /bootstrap

ENTRYPOINT ["/bootstrap"] 