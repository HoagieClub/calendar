# Hoagie Calendar Backend

### Prerequisites

Before you begin, ensure you have [uv](https://docs.astral.sh/uv/) installed. We will be using uv as our package manager for the backend. uv can be installed by running:

```bash
brew install uv
```

### Installation

Before beginning with the installation, make sure you are in the backend directory by running:

```bash
cd backend
```

After installing uv, create a virtual environment using the following command:

```bash
uv venv --prompt hoagie-calendar --python 3.13 .venv
```

This creates a virtual environment named `hoagie-calendar` contained within the `.venv` directory. Activate the virtual environment with:

```bash
source .venv/bin/activate
```

To install the relevant backend depedencies, run:
```bash
uv sync
```

This will install all required backend dependencies in the virtual environment.

### Running the app
```bash
uv run manage.py runserver
```
