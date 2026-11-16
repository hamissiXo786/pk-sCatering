# PK's Catering & Events — website

A fast, dependency-free static website (plain HTML, CSS and JavaScript).

## Pages
| File | Purpose |
|------|---------|
| `index.html` | Home: hero, services, about, featured dishes, seasonal menus, how it works |
| `menus.html` | Seasonal menus, wedding dining outline, buffet options |
| `gallery.html` | Filterable photo gallery with lightbox |
| `quote.html` | Quote request form (sends to WhatsApp or email) + contact details |

## Set your contact details (do this first)
Open **`js/config.js`** and fill in the phone, WhatsApp number, email, address, hours,
service area and social links. Every page picks them up automatically, and the quote form
starts working with WhatsApp / email as soon as those are set. Empty fields show "To be added".

## Run it locally
```bash
python3 -m http.server 8000
```
Then open <http://localhost:8000>. Or just double-click `index.html`.

## Hosting (GitHub Pages)
The site is ready for GitHub Pages as-is (relative links, `404.html`, `.nojekyll`).
In the repository go to **Settings → Pages → Build and deployment**, choose
**Deploy from a branch**, pick the branch that holds these files and the **/ (root)** folder,
then **Save**. It goes live at <https://hamissixo786.github.io/pk-sCatering/> within a minute or two,
and every push to that branch redeploys automatically.

## Linking to the quote form
Links can pre-fill the form, e.g. `quote.html?event=wedding` or
`quote.html?event=festive&about=Christmas%20Lunch%20Menu`.
`event` accepts `wedding`, `corporate`, `festive`, `party` or `family`.

## Where things live
- `css/style.css` — all styling. Brand colours are the variables at the top (`--green-*`, `--gold`, `--cream`).
- `js/main.js` — navigation, accordion, gallery filters/lightbox, quote form.
- `images/` — photos and favicon. Replace with higher-resolution originals when you have them
  (keep the file names, or update the references in the HTML).

## Notes
- Photos were cropped from a screen recording of the business's Facebook page, so they are
  low resolution. Swap in original photos before launch.
- Fonts (Playfair Display and DM Sans) load from Google Fonts; the site falls back to Georgia / system fonts offline.
