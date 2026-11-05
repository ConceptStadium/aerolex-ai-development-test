from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import posixpath
root=Path('dist').resolve()
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__(); self.refs=[]; self.ids=set(); self.h1=0; self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.add(a['id'])
  if tag=='h1':self.h1+=1
  for key in ('href','src'):
   if a.get(key):self.refs.append(a[key])
pages={p:Page(p.read_text()) for p in root.rglob('*.html')}
count=0
for path,page in pages.items():
 assert page.h1==1,f'{path}: expected one h1'
 base='/' + str(path.relative_to(root)).removesuffix('index.html')
 for ref in page.refs:
  u=urlsplit(ref)
  if u.scheme or u.netloc:continue
  dest=root / unquote(posixpath.normpath(posixpath.join(posixpath.dirname(base),u.path))).lstrip('/') if u.path else path
  if dest.is_dir():dest=dest/'index.html'
  assert dest.exists(),f'{path}: broken reference {ref}'
  if u.fragment and dest in pages:assert unquote(u.fragment) in pages[dest].ids,f'{path}: missing anchor {ref}'
  count+=1
print(f'Checked {len(pages)} HTML pages and {count} local links/assets; no broken references.')
