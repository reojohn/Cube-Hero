#!/usr/bin/env python3
"""Install official Cube Hero rival PNGs from existing artwork ZIPs or folders.

Examples (run in CubeHero project root):
  python scripts/install-rival-art.py "C:/Downloads/CubeHero_Rival_Select_Phase2_FullProject.zip"
  python scripts/install-rival-art.py "C:/Downloads/Batch 1.zip" "C:/Downloads/Batch 2.zip" ...
  python scripts/install-rival-art.py "C:/Downloads/CubeHero_Rival_PNGs"

Only PNG files with Sub-N_Name filename (matching the authoritative 55
identities in src/lib/rivals.ts) are copied. No game logic is changed.
"""
from __future__ import annotations
import argparse
import re
import sys
import zipfile
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
DEST = PROJECT / 'src' / 'assets' / 'rivals'
CODE = PROJECT / 'src' / 'lib' / 'rivals.ts'
IDENTITY_REGEX = re.compile(r"\[(\d+),'([^']+)'\s*,")
# Case-insensitive, allows zero-padded tiers, spaces, underscores, hyphens.
FILENAME_REGEX = re.compile(r'(?i)^sub[\s_-]*0*(\d{1,2})[\s_-]+(.+?)\.png$')
PNG_HEADER = b'\x89PNG\r\n\x1a\n'


def identities() -> dict[int, str]:
    found = {int(tier): name for tier, name in IDENTITY_REGEX.findall(CODE.read_text(encoding='utf-8'))}
    if sorted(found) != list(range(6, 61)):
        raise RuntimeError('Rival identity list was changed: expected Sub-6 through Sub-60')
    return found


def candidates(source: Path):
    if source.is_dir():
        for p in source.rglob('*'):
            if p.is_file() and p.suffix.lower() == '.png':
                yield p.name, p.read_bytes(), str(p)
    elif source.is_file() and source.suffix.lower() == '.zip':
        with zipfile.ZipFile(source) as archive:
            for member in archive.infolist():
                if member.is_dir() or not member.filename.lower().endswith('.png'):
                    continue
                # Do not unzip arbitrary paths onto disk.
                yield Path(member.filename).name, archive.read(member), f'{source.name}:{member.filename}'
    else:
        raise ValueError(f'Expected a ZIP file or folder: {source}')


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('sources', nargs='*', type=Path, help='Existing character-art ZIPs, Phase 2 project ZIP, or image folder')
    parser.add_argument('--check', action='store_true', help='Check existing artwork without copying (sources not needed with --check)')
    args = parser.parse_args()
    if not args.check and not args.sources:
        parser.error('Provide at least one ZIP or folder, or use --check')
    roster = identities()
    DEST.mkdir(parents=True, exist_ok=True)
    best: dict[int, tuple[bytes, str]] = {}
    skipped = 0
    if not args.check:
        for source in args.sources:
            try:
                for filename, data, origin in candidates(source):
                    match = FILENAME_REGEX.match(filename)
                    if not match:
                        skipped += 1
                        continue
                    tier = int(match.group(1))
                    name = match.group(2).strip().replace('_', ' ').replace('-', ' ')
                    if tier not in roster or name.casefold() != roster[tier].casefold():
                        skipped += 1
                        continue
                    if not data.startswith(PNG_HEADER):
                        print(f'WARNING: skipping invalid PNG: {origin}', file=sys.stderr)
                        skipped += 1
                        continue
                    if tier not in best or len(data) > len(best[tier][0]):
                        best[tier] = (data, origin)
            except (ValueError, OSError, zipfile.BadZipFile) as e:
                print(f'ERROR: {e}', file=sys.stderr)
                return 2
        for tier, (data, origin) in sorted(best.items()):
            target = DEST / f'Sub-{tier}_{roster[tier]}.png'
            target.write_bytes(data)
            print(f'  Installed {target.name} ({len(data):,} bytes) from {origin}')
    present = []
    missing = []
    for tier, name in roster.items():
        path = DEST / f'Sub-{tier}_{name}.png'
        if path.is_file() and path.read_bytes()[:8] == PNG_HEADER:
            present.append(tier)
        else:
            missing.append(tier)
    print(f'\nPortraits installed: {len(present)}/55 | Not found: {len(missing)} | Ignored PNGs: {skipped}')
    if missing:
        print('Missing:', ', '.join(f'Sub-{tier} {roster[tier]}' for tier in missing))
        print('Missing portraits use original crests; AI racing remains fully functional.')
    else:
        print('All original character portraits are installed! Run npm run build to verify.')
    return 0 if not missing else 1


if __name__ == '__main__':
    sys.exit(main())
