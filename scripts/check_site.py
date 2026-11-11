"""Check built HTML, linked CSS, responsive images and deferred media for local resources."""
import argparse
from html.parser import HTMLParser
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('directory', nargs='?', default='_site')
parser.add_argument('--baseurl', default='')
args = parser.parse_args()
root = Path(args.directory).resolve()
baseurl = args.baseurl.rstrip('/')
errors = set()
stylesheets = set()


def check(value, origin):
    if not value or value.startswith('#'):
        return None
    url = urlsplit(value)
    if url.scheme or url.netloc:
        return None
    path = unquote(url.path)
    if not path:
        return None
    if path.startswith('/'):
        if baseurl and not (path == baseurl or path.startswith(baseurl + '/')):
            errors.add(f'{origin}: URL omits baseurl: {value}')
            return None
        target = root / path[len(baseurl):].lstrip('/')
    else:
        target = origin.parent / path
    target = target.resolve()
    if not target.exists():
        errors.add(f'{origin}: missing resource: {value}')
    return target


def css_resources(text, origin):
    # Ignore disabled declarations in CSS comments.
    text = re.sub(r'/\*.*?\*/', '', text, flags=re.S)
    for match in re.finditer(r'''url\(\s*(?:"([^"]*)"|'([^']*)'|([^\s)]+))\s*\)''', text):
        target = check(next(value for value in match.groups() if value is not None), origin)
        if target and target.suffix == '.css':
            stylesheets.add(target)


class Page(HTMLParser):
    def __init__(self, file):
        super().__init__()
        self.file = file
        self.in_style = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        for key in ('href', 'src', 'poster', 'data-src', 'data-photo', 'data-video'):
            target = check(attrs.get(key), self.file)
            if tag == 'link' and key == 'href' and 'stylesheet' in attrs.get('rel', '').split() and target:
                stylesheets.add(target)
        for item in (attrs.get('srcset', '') + ',' + attrs.get('data-srcset', '')).split(','):
            if item.strip():
                check(item.strip().split()[0], self.file)
        if attrs.get('style'):
            css_resources(attrs['style'], self.file)
        if tag == 'style':
            self.in_style = True

    def handle_endtag(self, tag):
        if tag == 'style':
            self.in_style = False

    def handle_data(self, text):
        if self.in_style:
            css_resources(text, self.file)


pages = list(root.rglob('*.html'))
if not pages:
    raise SystemExit(f'No HTML found in {root}; run the Jekyll build first.')
for file in pages:
    page = Page(file)
    page.feed(file.read_text())
visited = set()
while stylesheets - visited:
    file = (stylesheets - visited).pop()
    visited.add(file)
    if file.is_file():
        css_resources(file.read_text(), file)
if errors:
    raise SystemExit('\n'.join(sorted(errors)))
print(f'Checked {len(pages)} HTML files and {len(visited)} local stylesheets: all linked assets exist, including responsive images, deferred videos and CSS fonts/backgrounds.')
