#!/usr/bin/env python3
"""Validate every mocks/fixtures/*.json against api/openapi.v1.yaml.
Each fixture file is {"schema": "<components.schemas name>", "data": {...}}.
Usage: python3 mocks/validate_fixtures.py   (needs: pip install pyyaml jsonschema)"""
import json, glob, os, sys, yaml
from jsonschema import Draft202012Validator
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = yaml.safe_load(open(os.path.join(root, "api", "openapi.v1.yaml")))
reg = Registry().with_resource("urn:skipa", Resource.from_contents(spec, default_specification=DRAFT202012))
failed = 0
for f in sorted(glob.glob(os.path.join(root, "mocks", "fixtures", "*.json"))):
    d = json.load(open(f))
    errs = list(Draft202012Validator({"$ref": f"urn:skipa#/components/schemas/{d['schema']}"}, registry=reg).iter_errors(d["data"]))
    print(("OK   " if not errs else "FAIL ") + os.path.basename(f), *[e.message for e in errs[:5]])
    failed += bool(errs)
sys.exit(1 if failed else 0)
