# -*- coding: utf-8 -*-
"""publish_short.py 공개 시각·숫자 검사 규칙 시험. 실행: python 블로그/shorts/test_publish_short.py"""
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from publish_short import KST, _numbers, publish_time


def at(y, m, d, hh, mm):
    return datetime(y, m, d, hh, mm, tzinfo=KST)


# 월요일 9시 발행 → 당일 12시
assert publish_time(at(2026, 10, 5, 9, 5)) == at(2026, 10, 5, 12, 0)
# 11시 30분 정각까지는 당일, 그 뒤는 다음 날
assert publish_time(at(2026, 10, 5, 11, 30)) == at(2026, 10, 5, 12, 0)
assert publish_time(at(2026, 10, 5, 11, 31)) == at(2026, 10, 6, 12, 0)
# 금요일 오후 → 다음 주 월요일
assert publish_time(at(2026, 10, 9, 15, 0)) == at(2026, 10, 12, 12, 0)
# 토·일 → 월요일
assert publish_time(at(2026, 10, 10, 8, 0)) == at(2026, 10, 12, 12, 0)
assert publish_time(at(2026, 10, 11, 8, 0)) == at(2026, 10, 12, 12, 0)

assert _numbers("표준 대기압은 101,325 Pa다. 약 795 N.") == {"101325", "795"}
assert _numbers("0.1 mbar 미만, 1.5~2년") == {"0.1", "1.5", "2"}
assert _numbers("숫자 없음") == set()

print("OK — 9개 통과")
