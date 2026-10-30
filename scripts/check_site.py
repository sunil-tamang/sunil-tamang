"""Check generated HTML for missing local resources (no third-party packages)."""
import argparse
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('directory', nargs='?', default='_site')
parser.add_argument('--baseurl', default='')
args = parser.parse_args()
root = Path(args.directory).resolve()
baseurl = args.baseurl.rstrip('/')
errors = []


class Page(HTMLParser):
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key not in ('href', 'src', 'poster') or not value:
                continue
            url = urlsplit(value)
            if url.scheme or url.netloc or value.startswith('#'):
                continue
            path = unquote(url.path)
            if path.startswith('/'):
                if baseurl and not (path == baseurl or path.startswith(baseurl + '/')):
                    errors.append(f'{self.file}: URL omits baseurl: {value}')
                    continue
                target = root / path[len(baseurl):].lstrip('/')
            else:
                target = self.file.parent / path
            if not target.exists():
                errors.append(f'{self.file}: missing resource: {value}')


pages = list(root.rglob('*.html'))
if not pages:
    raise SystemExit(f'No HTML found in {root}; run the Jekyll build first.')
for file in pages:
    page = Page()
    page.file = file
    page.feed(file.read_text())
if errors:
    raise SystemExit('\n'.join(errors))
print(f'Checked {len(pages)} HTML files: all local resource paths exist.')
