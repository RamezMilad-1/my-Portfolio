# Static assets

Files in this folder are served from the site root (e.g. `public/cv.pdf` becomes `/cv.pdf`).

## CV / Resume

The Hero and About sections have a "Download CV" button that resolves in this order:

1. `profile.resumeUrl` — uploaded via the admin Profile editor (preferred for production).
2. `/cv.pdf` — local fallback for development.

Drop your CV file here as **`cv.pdf`** and it'll be picked up automatically when the database `resumeUrl` is empty.
