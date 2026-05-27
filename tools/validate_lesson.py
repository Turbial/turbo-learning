#!/usr/bin/env python3
"""
validate_lesson.py — validate a lesson's steps against the platform step schema
BEFORE it is ingested into Supabase. Zero dependencies (stdlib only).

Usage:
    python3 validate_lesson.py path/to/lesson.json

Accepts either a full lesson object {"steps": [...]} or a bare steps array [...].
Exit code 0 = OK (warnings allowed), 1 = errors found (do NOT ingest).
"""
import sys, json

STEP_TYPES = {
    "info","scenario_card","example","mc","scenario","tf","highlight","fillblank",
    "match","good_fit","quiz","builder","copy_action","paste_capture","compare",
    "reflection","badge_unlock","streak_commitment","reminder_setup","completion",
}

def is_str(x):  return isinstance(x, str) and x.strip() != ""
def is_list(x): return isinstance(x, list)

def validate(steps):
    errors, warnings = [], []
    ids = [s.get("id") for s in steps if isinstance(s, dict)]
    builder_ids = {s.get("id") for s in steps if isinstance(s, dict) and s.get("type") == "builder"}

    # unique ids
    seen = set()
    for i in ids:
        if i in seen: errors.append(f"duplicate step id: {i!r}")
        seen.add(i)

    for idx, s in enumerate(steps):
        tag = f"step[{idx}] id={s.get('id') if isinstance(s,dict) else '?'}"
        if not isinstance(s, dict):
            errors.append(f"{tag}: not an object"); continue
        if not is_str(s.get("id")): errors.append(f"{tag}: missing string 'id'")
        t = s.get("type")
        if t not in STEP_TYPES:
            errors.append(f"{tag}: unknown type {t!r}"); continue
        if "xp" in s and not isinstance(s["xp"], (int, float)):
            errors.append(f"{tag}: 'xp' must be a number")

        def need(field, pred, msg):
            if not pred(s.get(field)): errors.append(f"{tag} ({t}): {msg}")

        if t in ("info","scenario_card"):
            need("body", is_str, "needs non-empty 'body'")
        elif t == "example":
            need("prompt", is_str, "needs non-empty 'prompt'")
        elif t in ("mc","scenario"):
            need("question", is_str, "needs 'question'")
            opts, corr, fb = s.get("options"), s.get("correct"), s.get("feedback")
            if not (is_list(opts) and len(opts) >= 2): errors.append(f"{tag}: 'options' needs >=2 entries")
            elif not (isinstance(corr, int) and 0 <= corr < len(opts)): errors.append(f"{tag}: 'correct' out of range")
            if not (is_list(fb) and is_list(opts) and len(fb) == len(opts)): errors.append(f"{tag}: 'feedback' length must equal 'options' length")
        elif t == "tf":
            need("question", is_str, "needs 'question'")
            if not isinstance(s.get("correct"), bool): errors.append(f"{tag}: 'correct' must be true/false")
            if not (is_list(s.get("feedback")) and len(s["feedback"]) == 2): errors.append(f"{tag}: 'feedback' must have 2 entries")
        elif t == "highlight":
            need("body", is_str, "needs 'body'")
            hl = s.get("highlights")
            if not (is_list(hl) and len(hl) >= 1): errors.append(f"{tag}: 'highlights' needs >=1 entry")
            else:
                for h in hl:
                    if is_str(s.get("body")) and h not in s["body"]:
                        warnings.append(f"{tag}: highlight {h!r} not found verbatim in body")
        elif t == "fillblank":
            need("question", is_str, "needs 'question'")
            need("answer", is_str, "needs 'answer'")
            if not (is_list(s.get("feedback")) and len(s["feedback"]) == 2): errors.append(f"{tag}: 'feedback' must have 2 entries")
        elif t == "match":
            pairs = s.get("pairs")
            if not (is_list(pairs) and len(pairs) >= 2): errors.append(f"{tag}: 'pairs' needs >=2 entries")
            else:
                for p in pairs:
                    if not (isinstance(p, dict) and is_str(p.get("left")) and is_str(p.get("right"))):
                        errors.append(f"{tag}: each pair needs 'left' and 'right'")
        elif t == "good_fit":
            need("question", is_str, "needs 'question' (the task)")
            if s.get("correct") not in ("good","notideal"): errors.append(f"{tag}: 'correct' must be 'good' or 'notideal'")
            if not (is_list(s.get("feedback")) and len(s["feedback"]) == 2): errors.append(f"{tag}: 'feedback' must have 2 entries")
        elif t == "quiz":
            qs = s.get("questions")
            if not (is_list(qs) and len(qs) >= 1): errors.append(f"{tag}: 'questions' needs >=1 entry")
            else:
                for q in qs:
                    if not isinstance(q, dict) or q.get("type") not in ("mc","tf","fillblank"):
                        errors.append(f"{tag}: each quiz question needs type mc/tf/fillblank")
        elif t == "builder":
            flds = s.get("fields")
            if not (is_list(flds) and len(flds) >= 1): errors.append(f"{tag}: 'fields' needs >=1 entry")
            if not is_str(s.get("template")): errors.append(f"{tag}: needs 'template'")
            elif is_list(flds):
                for f in flds:
                    fid = f.get("id") if isinstance(f, dict) else None
                    if fid and ("{{"+fid+"}}") not in s["template"]:
                        warnings.append(f"{tag}: template missing placeholder {{{{{fid}}}}}")
        elif t == "copy_action":
            need("body", is_str, "needs 'body'")
            src = s.get("sourceStepId")
            if not is_str(src): errors.append(f"{tag}: needs 'sourceStepId'")
            elif src not in builder_ids: errors.append(f"{tag}: sourceStepId {src!r} is not a builder step in this lesson")
            elif ids.index(src) > idx: errors.append(f"{tag}: sourceStepId {src!r} must come BEFORE this step")
        elif t == "paste_capture":
            need("body", is_str, "needs 'body'")
            if "minLength" in s and not isinstance(s["minLength"], int): errors.append(f"{tag}: 'minLength' must be int")
        elif t == "compare":
            need("question", is_str, "needs 'question'")
        elif t == "reflection":
            qs = s.get("questions")
            if not (is_list(qs) and len(qs) >= 1): errors.append(f"{tag}: 'questions' needs >=1 entry")
            else:
                for q in qs:
                    if not isinstance(q, dict) or q.get("type") not in ("single_choice","textarea") or not is_str(q.get("label")):
                        errors.append(f"{tag}: each reflection question needs type single_choice/textarea + label")
        elif t == "badge_unlock":
            need("badgeSlug", is_str, "needs 'badgeSlug'")
        elif t == "streak_commitment":
            if not (is_list(s.get("commitOptions")) and all(isinstance(x,int) for x in s.get("commitOptions",[]))):
                errors.append(f"{tag}: 'commitOptions' must be a list of ints")
        elif t == "reminder_setup":
            if not (is_list(s.get("reminderOptions")) and len(s["reminderOptions"]) >= 1):
                errors.append(f"{tag}: 'reminderOptions' needs >=1 entry")
        elif t == "completion":
            need("body", is_str, "needs 'body'")

    # lesson-level advisories (quality, not correctness)
    interactive = {"mc","scenario","tf","highlight","fillblank","match","good_fit","quiz",
                   "builder","copy_action","paste_capture","compare","reflection"}
    types = [s.get("type") for s in steps if isinstance(s, dict)]
    for i in range(1, len(types)):
        if types[i] in interactive and types[i] == types[i-1]:
            warnings.append(f"two {types[i]} interactions in a row at step[{i}] — vary the rhythm")
    if types and types[-1] != "completion":
        warnings.append("lesson does not end with a 'completion' step")
    return errors, warnings

def main():
    if len(sys.argv) != 2:
        print("usage: python3 validate_lesson.py lesson.json"); sys.exit(2)
    data = json.load(open(sys.argv[1]))
    steps = data["steps"] if isinstance(data, dict) and "steps" in data else data
    if not is_list(steps):
        print("ERROR: no steps array found"); sys.exit(1)
    errors, warnings = validate(steps)
    for w in warnings: print(f"  WARN  {w}")
    for e in errors:   print(f"  ERROR {e}")
    print(f"\n{len(steps)} steps · {len(errors)} errors · {len(warnings)} warnings")
    sys.exit(1 if errors else 0)

if __name__ == "__main__":
    main()
