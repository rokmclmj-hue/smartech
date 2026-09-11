"""Offline safety checks. No production queue, log, subprocess or network use.

Run: python -B -m unittest discover -s 블로그 -p test_auto_upload_schedule.py -v
"""
import copy
import importlib.util
import json
from contextlib import ExitStack
from datetime import datetime
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch, Mock


spec = importlib.util.spec_from_file_location('auto_upload', Path(__file__).with_name('auto_upload.py'))
upload = importlib.util.module_from_spec(spec)
spec.loader.exec_module(upload)


class ScheduleSafetyTests(unittest.TestCase):
    def run_slot(self, on, slot='day2', week='2026-W38', approved=True,
                 uploaded=False, flags=(), change_queue=False, **post_fields):
        queue = {'_week': week, slot: {'folder': 'test-only', 'title': 'test',
                 'approved': approved, 'uploaded': uploaded, **post_fields}}
        with tempfile.TemporaryDirectory() as directory, ExitStack() as stack:
            queue_path = Path(directory) / 'queue.json'
            queue_path.write_text(json.dumps(queue), encoding='utf-8')
            stack.enter_context(patch.object(upload, 'QUEUE_FILE', str(queue_path)))
            stack.enter_context(patch.object(upload, 'log'))
            clock = stack.enter_context(patch.object(upload, 'datetime'))
            clock.now.return_value = datetime.fromisoformat(on).replace(tzinfo=upload.KST)
            stack.enter_context(patch.object(upload.sys, 'argv', ['auto_upload.py', '--slot', slot, *flags]))
            network = stack.enter_context(patch('urllib.request.urlopen', side_effect=AssertionError('network forbidden')))
            stack.enter_context(patch.object(upload.time, 'sleep', side_effect=AssertionError('sleep forbidden')))

            def fake_upload(*args, **kwargs):
                if change_queue:
                    replacement = copy.deepcopy(queue)
                    replacement['_week'] = '2026-W39'
                    queue_path.write_text(json.dumps(replacement), encoding='utf-8')
                return Mock(returncode=0, stdout='', stderr='')

            process = stack.enter_context(patch.object(upload.subprocess, 'run', side_effect=fake_upload))
            exit_code = 0
            try:
                upload.main()
            except SystemExit as exc:
                exit_code = exc.code
            network.assert_not_called()
            return process.call_count, exit_code, json.loads(queue_path.read_text(encoding='utf-8'))

    def test_transition_dates_and_stale_queues(self):
        cases = [
            ('2026-09-09', 'day2', '2026-W37', 1),
            ('2026-09-11', 'day3', '2026-W37', 1),
            ('2026-09-14', 'day1', '2026-W38', 1),
            ('2026-09-16', 'day2', '2026-W38', 0),
            ('2026-09-17', 'day2', '2026-W38', 1),
            ('2026-09-18', 'day3', '2026-W38', 0),
            ('2026-09-15', 'day4', '2026-W38', 0),
            ('2026-09-17', 'day5', '2026-W38', 0),
            ('2026-09-18', 'day3', '2026-W37', 0),
            ('2026-09-21', 'day1', '2026-W38', 0),
            ('2026-09-10', 'day2', '2026-W38', 0),
            ('2027-01-04', 'day1', '2026-W01', 0),
        ]
        for on, slot, week, calls in cases:
            with self.subTest(on=on, slot=slot, week=week):
                count, code, queue = self.run_slot(on, slot, week)
                self.assertEqual(count, calls)
                self.assertEqual(queue[slot]['uploaded'], bool(calls))

    def test_approval_and_duplicate_guards(self):
        for approved, uploaded, expected_calls in [
            (False, False, 0),
            (True, True, 0),
            (True, None, 1),
        ]:
            with self.subTest(approved=approved, uploaded=uploaded):
                calls, _, _ = self.run_slot('2026-09-17', approved=approved, uploaded=uploaded)
                self.assertEqual(calls, expected_calls)

    def test_invalid_uploaded_value_is_rejected(self):
        calls, code, _ = self.run_slot('2026-09-17', approved=True, uploaded='true')
        self.assertEqual((calls, code), (0, 1))

    def test_bad_week_or_conflicting_date_is_rejected(self):
        for week in ['', '2026-W99', '2026-W00', '2026-38', None]:
            with self.subTest(week=week):
                calls, code, _ = self.run_slot('2026-09-17', week=week)
                self.assertEqual((calls, code), (0, 1))
        calls, code, _ = self.run_slot('2026-09-17', scheduled_date='2026-09-16')
        self.assertEqual((calls, code), (0, 1))

    def test_dry_run_never_uploads_or_marks_done(self):
        calls, code, queue = self.run_slot('2026-09-17', flags=('--dry-run',))
        self.assertEqual((calls, code), (0, 0))
        self.assertFalse(queue['day2']['uploaded'])

    def test_force_cannot_bypass_schedule(self):
        calls, code, _ = self.run_slot('2026-09-16', flags=('--force',))
        self.assertEqual((calls, code), (0, 1))

    def test_concurrent_queue_change_is_preserved(self):
        calls, code, queue = self.run_slot('2026-09-17', change_queue=True)
        self.assertEqual((calls, code), (1, 1))
        self.assertEqual(queue['_week'], '2026-W39')
        self.assertFalse(queue['day2']['uploaded'])


if __name__ == '__main__':
    unittest.main()
