# 클로드 코드의 핵심 기능 5가지 리서치

> 리서치 기준일: 2026년 05월 29일
> 소스 수: 8개

---

## 1. 에이전틱 코딩 (Agentic Coding) — 자율적인 개발 작업 수행

클로드 코드(Claude Code)는 단순한 코드 제안 도구가 아니라, 개발자가 지시한 작업을 스스로 계획하고 실행하는 에이전틱(agentic) 코딩 시스템이다. 2025년 2월 프리뷰로 출시됐고, 2025년 5월 클로드 4(Claude 4)와 함께 정식 출시됐다.

클로드 코드는 프로젝트 전체 코드베이스를 읽고 디렉터리를 탐색해 모듈 간 연결 구조를 이해한다. 이를 바탕으로 파일을 직접 생성·수정하고 터미널 명령어를 실행하며, 테스트가 실패하면 오류 메시지를 읽고 코드를 수정한 뒤 테스트를 다시 돌리는 과정을 반복한다. GitHub와 GitLab의 CI 파이프라인을 모니터링하고 자동으로 커밋하는 기능도 포함돼 있다.

GitHub Copilot 같은 코드 자동완성 도구와 달리, 클로드 코드는 멀티파일 리팩터링, 새 기능 개발, 풀 리퀘스트 제출까지 하나의 에이전트가 종단 간(end-to-end)으로 처리한다. 2026년 2월 기준으로 클로드 Opus 4.6은 인간이 14.5시간 걸리는 작업을 50% 성공률로 무감독 완료할 수 있다고 앤트로픽은 밝혔다.

---

## 2. 멀티 에이전트 오케스트레이션 (Multi-Agent Orchestration)

클로드 코드는 단일 세션뿐 아니라 여러 에이전트 인스턴스를 동시에 협업시키는 멀티 에이전트 기능을 지원한다. 2026년 현재 이 기능은 에이전트 뷰(Agent View), 서브에이전트(Subagents), 에이전트 팀(Agent Teams) 세 가지 방식으로 구분된다.

- **에이전트 뷰**: 터미널 대시보드로, 실행 중인 세션을 한 화면에서 시작·백그라운드 전환·상태 확인·재진입할 수 있다. 터미널 창이 닫혀도 슈퍼바이저 프로세스가 세션을 독립적으로 유지하므로, 노트북을 닫아도 에이전트는 계속 작업을 수행한다.
- **서브에이전트**: 각 서브에이전트는 독립된 컨텍스트 창을 가지며, 방대한 정보 중 필요한 결과만 오케스트레이터에게 돌려준다. 테스트 실행, 문서 생성, 모듈 리팩터링, 버그 조사 등을 동시에 병렬 처리할 수 있다.
- **에이전트 팀**: 에이전트 팀은 공유 태스크 목록을 통해 작업을 조율한다. 각 에이전트는 파일에서 태스크를 읽고 자신의 작업을 "진행 중"으로 표시한 뒤 완료 후 결과를 기록한다. 서브에이전트와 달리 팀원 에이전트들은 서로 직접 소통할 수 있다.

병렬 에이전트 실행은 비용도 병렬로 소모되므로(10개 동시 실행 시 토큰 쿼터 10배 소모), 작업 규모와 예산에 따라 활용 전략을 세워야 한다.

---

## 3. 확장된 사고(Extended Thinking)와 고급 추론

클로드 코드는 확장된 사고(Extended Thinking) 기능을 내장하고 있다. 이는 응답을 생성하기 전 전용 추론 단계를 거치는 방식으로, 어려운 문제에서 지연 시간을 일부 감수하는 대신 현저히 더 나은 답변을 얻을 수 있다.

기본적으로 클로드 코드는 적응형 사고(adaptive thinking)를 사용한다. 즉, 모델이 스스로 사고 여부와 사고량을 결정하며, 사용자는 `effort` 파라미터(low, medium, high)로 이를 조절할 수 있다. 복잡한 아키텍처 설계, 성능 최적화, 버그 원인 분석 등 난이도가 높은 작업일수록 고급 추론 과정의 이점이 크게 발휘된다.

---

## 4. MCP(모델 컨텍스트 프로토콜) 통합 및 확장 에코시스템

MCP(Model Context Protocol)는 앤트로픽이 관리하고 AI 에이전트 생태계 전반에서 채택된 개방형 표준 프로토콜이다. 클로드 코드는 MCP를 통해 외부 데이터 소스와 도구에 연결된다.

클로드 코드의 한 세션이 시작될 때 모델은 BashTool, FileReadTool 같은 내장 도구 외에도 MCP 서버가 제공하는 데이터베이스 쿼리 도구, .claude/skills/에 정의된 커스텀 린트 스킬, 설치된 플러그인이 기여하는 도구 등을 함께 사용할 수 있다.

구체적인 활용 사례로는 Google Drive에서 설계 문서 읽기, Jira 티켓 업데이트, Slack 데이터 가져오기 등이 있다. MCP 생태계는 2026년 현재 수백 개의 서드파티 MCP 서버로 확장되고 있다.

확장 메커니즘은 네 가지로 구분된다:
- **MCP 서버**: 외부 도구 연동
- **플러그인**: 컴포넌트 묶음 패키징 및 배포
- **스킬(Skills)**: 도메인별 지침 주입, `.claude/skills/`에 마크다운 파일로 정의
- **훅(Hooks)**: 도구 실행 라이프사이클 개입 (PreToolUse, PostToolUse, Stop 등)

---

## 5. 메모리 시스템, 커스텀 슬래시 명령어 및 훅(Hooks)

클로드 코드는 프로젝트와 사용자에 대한 지식을 영구적으로 기억하는 메모리 시스템을 갖추고 있다. `CLAUDE.md` 파일이 이 메모리의 핵심으로, 프로젝트 개요와 핵심 명령어, 팀 선호도 등을 기록해 에이전트가 세션 사이에도 컨텍스트를 유지하도록 한다. CLAUDE.md는 계층 구조를 지원하며, 프로젝트 루트와 하위 디렉터리에 각각 배치할 수 있다.

**커스텀 슬래시 명령어**는 `.claude/commands/` 폴더에 마크다운 파일로 정의하며, `/명령어이름` 형식으로 호출할 수 있다. 스킬(Skills)과 병합돼 `.claude/skills/<n>/SKILL.md` 형식도 지원한다. 이를 통해 팀 고유의 워크플로우, 코드 리뷰 규칙, 배포 절차 등을 재사용 가능한 명령어로 표준화할 수 있다.

**훅(Hooks)**은 도구 실행 생명주기의 특정 시점에 자동으로 스크립트를 실행하는 기능이다. 예를 들어 파일 쓰기 후 Prettier를 자동 실행하거나, 편집 후 타입 체크를 수행하는 식으로 설정할 수 있다. `/hooks` 명령어로 훅 설정을 관리한다.

추가로 **2026년에 도입된 드리밍(Dreaming)** 기능은 에이전트가 과거 세션을 검토하고 반복되는 실수, 공유 워크플로우, 팀 선호도 등 패턴을 추출해 메모리를 자동으로 개선하는 예약 프로세스다.

---

## 6. IDE 통합 및 안전 제어 (보너스 기능)

클로드 코드는 CLI 외에도 주요 IDE와 통합돼 있다. VS Code 확장 프로그램은 사이드바 패널의 인라인 diff, 계획 검토 및 수락, @-멘션으로 파일·라인 범위 참조, 대화 기록, 체크포인트 기반 되돌리기 기능을 제공한다. JetBrains 계열 IDE도 지원한다.

**안전 제어** 측면에서는 파일 수정이나 명령어 실행 전 명시적 허가를 요구하는 기본 모드, 계획만 수립하고 실행하지 않는 읽기 전용 모드, 신뢰 환경에서 자율성을 극대화하는 자동 수락 모드를 유연하게 선택할 수 있다. 모든 코드 배포 결정은 인간 개발자에게 남아 있다는 점이 앤트로픽이 강조하는 안전 철학이다.

---

## 참고 소스

- [Claude Code | Anthropic's agentic coding system (공식)](https://www.anthropic.com/product/claude-code)
- [Overview - Claude Code Docs (공식 문서)](https://code.claude.com/docs/en/overview)
- [Orchestrate teams of Claude Code sessions - Claude Code Docs](https://code.claude.com/docs/en/agent-teams)
- [Enabling Claude Code to work more autonomously - Anthropic](https://www.anthropic.com/news/enabling-claude-code-to-work-more-autonomously)
- [Claude Code Agents In 2026: Agent View, Subagents, Teams - CloudZero](https://www.cloudzero.com/blog/claude-code-agents/)
- [Code with Claude 2026: 5 New Agent Features Anthropic Just Shipped | MindStudio](https://www.mindstudio.ai/blog/code-with-claude-2026-new-agent-features)
- [Claude Code and Extended Thinking: The Hybrid Reasoning Revolution | Medium](https://medium.com/@cognidownunder/claude-code-and-extended-thinking-the-hybrid-reasoning-revolution-thats-changing-how-we-code-4c59cb714015)
- [The Complete Claude Code Power User Guide: Slash Commands, Hooks, Skills & More - DEV Community](https://dev.to/numbpill3d/the-complete-claude-code-power-user-guide-slash-commands-hooks-skills-more-6ep)
