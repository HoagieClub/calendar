# Hoagie Calendar Backend

This is the backend directory for Hoagie Calendar.

## Setup

This project uses [uv](https://github.com/astral-sh/uv) as the package manager.

### Prerequisites

- Python 3.12+
- [uv](https://github.com/astral-sh/uv) installed

### Installation

1. Install dependencies:
   ```bash
   uv sync
   ```

2. Activate the virtual environment:
   ```bash
   source .venv/bin/activate
   ```
   
   Or use uv to run commands directly:
   ```bash
   uv run python manage.py <command>
   ```

### Common Commands

- **Run Django management commands:**
  ```bash
  uv run python manage.py migrate
  uv run python manage.py runserver
  uv run python manage.py createsuperuser
  ```

- **Add a new dependency:**
  ```bash
  uv add <package-name>
  ```

- **Add a development dependency:**
  ```bash
  uv add --dev <package-name>
  ```

- **Update dependencies:**
  ```bash
  uv sync
  ```

- **Run the development server:**
  ```bash
  uv run python manage.py runserver
  ```
