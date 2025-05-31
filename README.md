# Quran Recitation Web System

This repository contains a basic design for an electronic Quran learning platform using PHP, HTML, Tailwind CSS and MySQL. The project does not implement an MVC pattern; pages include PHP code directly.

## Files
- `index.php`: Landing page with a simple login link.
- `login.php`: Example login form styled with Tailwind and Tajawal font.
- `functions.php`: Helper function for connecting to the database using PDO.
- `docs/design.md`: Arabic document describing database tables and brief system architecture.

## Requirements
- PHP 7.x or newer with PDO extension.
- MySQL server for the database tables described in `docs/design.md`.
- Internet connection is required if you use the CDN links for Tailwind CSS and Google Fonts at runtime.
