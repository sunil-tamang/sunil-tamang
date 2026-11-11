"""Generate stable cache versions for local CSS/JS without runtime dependencies."""
from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parents[1]
versions={}
for folder in ['assets/css','assets/js']:
 for path in sorted((root/folder).rglob('*')):
  if path.suffix not in ['.css','.js']:continue
  versions['/'+path.relative_to(root).as_posix()]=hashlib.sha256(path.read_bytes()).hexdigest()[:12]
sass=hashlib.sha256()
for path in sorted([*(root/'_sass').rglob('*'),*(root/'assets/css').glob('*.scss')]):
 if path.is_file():sass.update(path.relative_to(root).as_posix().encode());sass.update(path.read_bytes())
versions['/assets/css/main.css']=sass.hexdigest()[:12]
target=root/'_data/asset_versions.json'
content=json.dumps(versions,sort_keys=True,indent=2)+'\n'
if not target.exists() or target.read_text()!=content:target.write_text(content)
