# Fleetly

Fleetly is a web-based transportation booking system that allows users to book various modes of transport including cars, buses, and trains across different locations in Kenya.

## Features

- User Registration and Login
- User Profile Management  
- Booking of Cars, Buses, and Trains
- Real-Time Tracking of Bookings
- Responsive Design for Mobile and Desktop

## Technologies Used

- HTML
- CSS
- JavaScript 
- Flask
- SQLAlchemy
- Bootstrap

# Table Of Contents

- [Setting Up Your Development Environment](#setting-up-your-development-environment)
- [Create Your Project Structure](#create-your-project-structure)
- [Run Initial Application](#run-initial-application)
- [Application Design Using Figma](#application-design-using-figma)
- [Design Your Database Using DrawSQL](#design-your-database-using-drawsql)
- [Build The Template](#build-the-template)
- [Build The Routes](#build-the-routes)
- [Build The Models](#build-the-models)
- [Build The Forms](#build-the-forms)
- [Add Email Integration](#add-email-integration)
- [Deploy The Project](#deploy-the-project)

## Setting Up Your Development Environment

In order to work on this project, you need to have the following software installed on your machine:

- Python 3.6 or higher
- Flask
- SQLAlchemy
- Bootstrap
- Ubuntu 24
- VS Code
- Git
- Github

First, Download vscode from the official website [vscode](https://code.visualstudio.com/download). Ensure that you downlaod the right version for your operating system. Then install it.

Second, install Ubuntu 24 from the official website [Ubuntu](https://ubuntu.com/download/desktop). Ensure that you downlaod the right version for your operating system. In our case, we are using Windows 10/11. We can alternatively install ubuntu from the microsoft store. Immediatley after isntalling ubuntu, you need to run it and install as administrator.

Third, install WSL from the ubuntu terminal. Run the following command:

```bash
sudo apt install wsl
```
Fourth, after installing WSL, you need to install git from the ubuntu terminal. Run the following command:

```bash
sudo apt install git
```

Fifth, create a GitHub account from the official website [GitHub](https://github.com/). GitHub is a web-based platform that provides version control using Git. It allows developers to store, manage, track and control changes to their code. GitHub is essential for collaborative software development, offering features like repository hosting, pull requests, issue tracking, and project management tools. It's widely used in the software development industry for both open source and private projects.

In order to push our  code to github, you need to link our Pc to our github account. To do this, we need to create a SSH key. To do this, we need to run the following command in our ubuntu terminal:
```bash
ssh-keygen -t ed25519 -C "EMAIL"
```

Then, we need to copy the SSH key to our clipboard. To do this, we need to run the following command in our ubuntu terminal:

```bash
clip < ~/.ssh/id_ed25519.pub
```
Paste the contents of your clipboard into your [GitHub account settings](https://github.com/settings/keys). Navigate to the "SSH and GPG keys" section, click on "New SSH key" and paste the contents of your clipboard into the "Key" field. Give your key a title and click "Add SSH key".

It's now possible to push our code to github.

## Create Your Project Structure

Since were building a flask web app, there are some files that are required to be created. These files are:

- app.py
- config.py
- requirements.txt

Folders:
- app
    - Static Folders
        - CSS
        - Images
        - JS
    - Templates Files
        - base.html
        - index.html
        - about.html


Here is an example of how your project structure might look like:

```bash

project/
    ├── main.py
    ├── config.py
    ├── requirements.txt
    └── app/
        ├── __init__.py
        ├── routes.py
        ├── models.py
        ├── forms.py
        ├── errors.py
        ├── email.py
        ├── static/
        │   ├── css/
        │   ├── images/
        │   └── js/
        └── templates/
            ├── base.html
            ├── index.html
            └── about.html

```

## Run Initial Application

Before you build your application, you need to create a virtual environment. To do this, run the following command in your terminal:

```bash
python3 -m venv venv
```

A virtual environment is an isolated Python environment that allows you to install packages and dependencies specific to your project without affecting your system's global Python installation. This isolation helps avoid version conflicts between different projects and makes it easier to manage dependencies. It also makes your project more portable since you can easily recreate the exact environment on another machine using the `requirements.txt` file.

To activate the virtual environment, run the following command in your terminal:

```bash
source venv/bin/activate
```

The following packages are required to be installed in your virtual environment:

- Flask
- Flask-SQLAlchemy
- Flask-Wtf
- Flask-Login
- Flask-Mail
- Flask-Migrate
- Python-dotenv
- Gunicorn

To install these packages, run the following command in your terminal:

```bash
pip install Flask Flask-SQLAlchemy Flask-WTF Flask-Login Flask-Mail Flask-Migrate python-dotenv gunicorn
```

Update your requirements.txt file by running the following command in your terminal:

```bash
pip freeze > requirements.txt
```

Write the following code in each of these files:

```python
# app/__init__.py

from flask import Flask

app = Flask(__name__)

from app import routes

```

```python
# app/routes.py

from app import app

@app.route('/')
def index():
    return 'Hello, World!'

```

```python
# main.py

from app import app

```

Finally, to start the flask server enter this command in your terminal:

```bash
flask run
```

You should see the following output:

```bash
 * Serving Flask app 'main' (lazy loading)
 * Environment: development
   WARNING: This is a development server. Do not use it in a production deployment.
   Use a development WSGI server instead.
 * Debug mode: off
 * Running on
 * Running on 127.0.0.1:5000/ (Press CTRL+C to quit)
```

## Application Design Using Figma

## Design Your Database Using DrawSQL

## Build The Template

## Build The Routes

## Build The Models

## Build The Forms

## Add Email Integration

## Deploy The Project
