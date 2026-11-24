#!/usr/bin/env python3
"""Sentences shared between encyclopaedia pages.

Writers working side by side can only compare their pages with what the others had written so far,
so this runs over the whole section before a push: every sentence of eight words or more that
appears, word for word, on two pages or more. Front matter, headings and link targets are left out;
link text is kept.

    python3 plan/kit/overlap.py [--since <git rev>] [--lang en|fr]

With --since, only sentences on pages changed since that revision are reported (their matches can be
anywhere in the section).
"""
import argparse, collections, glob, os, re, subprocess

ap = argparse.ArgumentParser()
ap.add_argument('--since')
ap.add_argument('--lang', default='both')
a = ap.parse_args()
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(root)

changed = None
if a.since:
    out = subprocess.run(['git', 'diff', '--name-only', a.since, '--', 'content'], capture_output=True, text=True).stdout
    changed = {p for p in out.split() if '/astrology/' in p}
    out = subprocess.run(['git', 'ls-files', '--others', '--exclude-standard', 'content'], capture_output=True, text=True).stdout
    changed |= {p for p in out.split() if '/astrology/' in p}

def sentences(path):
    text = open(path, encoding='utf-8').read()
    if text.startswith('---'):
        text = text.split('\n---', 1)[1] if '\n---' in text[3:] else text
    text = re.sub(r'\{\{[<%].*?[>%]\}\}', ' ', text)
    text = re.sub(r'\]\([^)]*\)', ']', text)
    text = re.sub(r'\{#[^}]*\}', ' ', text)
    lines = [l for l in text.split('\n') if not l.lstrip().startswith('#')]
    text = ' '.join(lines).replace('[', '').replace(']', '').replace('*', '')
    for s in re.split(r'(?<=[.!?…])\s+', text):
        s = re.sub(r'\s+', ' ', s.strip(' -:;')).strip()
        if len(s.split()) >= 8:
            yield s.lower()

langs = ['en', 'fr'] if a.lang == 'both' else [a.lang]
for lang in langs:
    seen = collections.defaultdict(set)
    for p in sorted(glob.glob(f'content/{lang}/astrology/*.md')):
        for s in set(sentences(p)):
            seen[s].add(os.path.basename(p)[:-3])
    shared = {s: ids for s, ids in seen.items() if len(ids) > 1}
    if changed is not None:
        mine = {os.path.basename(p)[:-3] for p in changed if p.startswith(f'content/{lang}/')}
        shared = {s: ids for s, ids in shared.items() if ids & mine}
    print(f'[{lang}] {len(shared)} sentences shared between pages')
    for s, ids in sorted(shared.items(), key=lambda x: -len(x[1]))[:400]:
        print(f'  {len(ids)}× {", ".join(sorted(ids))[:220]}\n      “{s[:200]}”')
