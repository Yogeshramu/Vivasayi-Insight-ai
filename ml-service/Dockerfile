FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Set execution permissions for start.sh
RUN chmod +x start.sh

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["./start.sh"]
