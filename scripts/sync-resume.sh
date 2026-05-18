#!/bin/bash

# Description: Script to clone a resume repository and keep only the PDF file.

# Check if public/resume exists and delete it
if [ -d "public/resume" ]; then
    rm -r public/resume
fi

# Clone the repo
git clone https://github.com/Roudranil/resume.git public/resume

# CD to the repo
cd public/resume

# Remove everything except the PDF of the resume
cp resumev3/resume.pdf resume.pdf
find . -type f ! -name "*.pdf" -exec rm -f {} +

# Remove the .git directory
rm -r resumev3
rm -r .git
