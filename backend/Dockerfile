FROM tiangolo/uvicorn-gunicorn-fastapi:python3.11

# Set the working directory to /app
WORKDIR /app

# Install Poetry
RUN pip install poetry
ENV POETRY_VIRTUALENVS_CREATE=false

# Copy Poetry files and install dependencies
COPY pyproject.toml /app/
RUN poetry install --no-root --no-interaction --no-ansi

# Copy the rest of the application
COPY . /app/

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]