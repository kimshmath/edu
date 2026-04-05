# Mellow Math — Narration & Video Pipeline

Sound 챕터 파일럿: 나레이션 생성 → 브라우저 자동화 → 영상 합성

## 디렉토리 구조

```
mellow-narration/
├── .env                          # API 키
├── narration_texts/
│   └── sound_en.json             # 섹션별 나레이션 스크립트
├── scripts/
│   ├── generate_narration.py     # ElevenLabs TTS 배치 생성
│   └── record_video.py           # Playwright 영상 자동화
├── audio/
│   └── en/                       # 생성된 mp3 파일들
└── video/                        # 녹화된 영상
```

## Step 1: 환경 설정

```bash
cd mellow-narration

# Python 패키지
pip install requests python-dotenv playwright

# Playwright 브라우저
playwright install chromium

# ffmpeg (macOS)
brew install ffmpeg
```

## Step 2: 크레딧 확인 (생성 전 미리보기)

```bash
cd scripts
python generate_narration.py --list
```

출력 예시:
```
  Section                   Chars  Credits  ~Minutes
  00_hero.mp3                 230      230       0.3
  01_sine_wave.mp3            680      680       0.8
  ...
  TOTAL                      6842     6842       7.6
```

전체 ~6,800 크레딧. Creator 플랜 10만 크레딧의 약 7%.

## Step 3: 나레이션 오디오 생성

```bash
# 전체 생성 (약 2분 소요)
python generate_narration.py

# 또는 특정 섹션만 테스트
python generate_narration.py --section 01

# 또는 Flash 모델로 저렴한 미리듣기
python generate_narration.py --section 01 --preview
```

생성된 파일: `audio/en/00_hero.mp3`, `audio/en/01_sine_wave.mp3`, ...

**→ 여기서 오디오를 들어보고 만족스러우면 Step 4로.**
voice_settings 조정이 필요하면 `generate_narration.py` 상단의 VOICE_SETTINGS 수정.

## Step 4: 영상 녹화

```bash
# 드라이런 — 실행 계획만 출력
python record_video.py --url https://edu.kimsh.kr/sound.html --dry-run

# 실제 녹화 (브라우저가 열리고 자동 조작됨)
python record_video.py --url https://edu.kimsh.kr/sound.html

# 특정 섹션만 녹화
python record_video.py --url https://edu.kimsh.kr/sound.html --section sec-wave sec-fourier
```

## Step 5: 최종 합성

녹화가 완료되면 자동으로 ffmpeg 합성이 실행됨.
수동으로 다시 합성하려면:

```bash
python record_video.py --composite-only --url dummy
```

최종 결과: `video/sound_final.mp4`

## 나레이션 스크립트 커스터마이즈

`narration_texts/sound_en.json`을 수정하면 됨.
각 섹션의 `"text"` 필드를 편집 후 다시 `generate_narration.py` 실행.

주의사항:
- 수식은 읽을 수 있는 말로: `2^{1/12}` → "two to the power one-twelfth"
- 숫자는 풀어서: `440` → "four hundred forty" (TTS가 더 자연스럽게 읽음)
- 쉼표(,)와 마침표(.)로 호흡 조절
- `<break time="0.5s"/>` SSML 태그로 명시적 쉼표 가능

## 연출 스크립트 커스터마이즈

`record_video.py`의 `CHOREOGRAPHY` 배열을 수정.
각 action의 `"t"` 값은 해당 섹션 오디오 시작점 기준 초(seconds).

오디오 생성 후 `audio/en/_timing.json`에 각 파일의 실제 duration이 기록되므로,
이 값을 보고 action 타이밍을 미세 조정하면 됨.
