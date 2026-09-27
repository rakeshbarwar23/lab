NAYAK LAB WEBSITE: UPLOAD GUIDE
================================

1. Upload EVERYTHING in this folder to your web server's public folder
   (often public_html/ or www/). Keep the folder structure exactly as it is.
2. The home page is index.html. The other pages are research.html,
   publications.html, people.html, teaching.html, gallery.html and join.html.
3. SiteNav.dc.html and SiteFooter.dc.html are the shared header and footer.
   The pages load them, so they must sit next to index.html.

Requirements
- Any normal static host works (Apache, Nginx, GitHub Pages, Netlify,
  the IIT Delhi web server, and so on). No database or PHP is needed.
- The site must be opened over http:// or https://. Double-clicking
  index.html on your computer will NOT load the header, footer or content,
  because browsers block local file loading.
  To preview it locally, run  python3 -m http.server  in this folder and
  open http://localhost:8000
- The page fonts and the page framework are loaded from Google Fonts and
  unpkg.com, so visitors need an internet connection.

Updating content
- Names, publications, people and gallery images are all in content.js.
  Open admin.html in a browser (on the server, or through the local preview
  above) to edit content and download a new content.js, then upload it and
  replace the old file.
- Images go in assets/<folder>/. JPEG is preferred for photos (smaller files).

Trace animations
- trace-engine.js plus figs-*.js draw every simulated recording. Each page
  loads only the figure file it needs. Visitors with "reduce motion" switched
  on see a still frame of the same figure.
