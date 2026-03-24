import re

file_path = "/Users/kimsh/.gemini/antigravity/playground/icy-armstrong/BedtimeStories/BedtimeStories/Models/Chapter.swift"

new_array = """    static let all: [Chapter] = [
        // ── Part I: Pure Mathematics ──
        Chapter(
            id: "sound", number: 1,
            titleEN: "The Mathematics of Sound", titleKO: "소리의 수학",
            subtitleEN: "From Pythagoras to Fourier", subtitleKO: "피타고라스에서 푸리에까지",
            descriptionEN: "From Pythagoras to Fourier to your smartphone. Build waveforms from harmonics, compare tuning systems, and explore how the cochlea performs frequency analysis.",
            descriptionKO: "피타고라스에서 푸리에, 그리고 당신의 스마트폰까지. 하모닉에서 파형을 만들고, 조율 시스템을 비교하세요.",
            tags: ["Fourier Analysis", "Acoustics", "Web Audio"],
            htmlFileEN: "sound", htmlFileKO: "sound_ko",
            part: .pureMathematics, narrationSegmentsFile: "sound_narration"
        ),
        Chapter(
            id: "drum", number: 2,
            titleEN: "Can You Hear the Shape of a Drum?", titleKO: "북의 모양을 들을 수 있을까?",
            subtitleEN: "Spectral Geometry", subtitleKO: "스펙트럼 기하학",
            descriptionEN: "Mark Kac's famous 1966 question, made audible. Strike virtual drums and hear why two differently shaped drums can produce identical spectra.",
            descriptionKO: "마크 카츠의 유명한 1966년 질문을 소리로 구현합니다. 가상 드럼을 두드려 보세요.",
            tags: ["Spectral Geometry", "Eigenvalues", "Audio"],
            htmlFileEN: "drum", htmlFileKO: "drum_ko",
            part: .pureMathematics, narrationSegmentsFile: "drum_narration"
        ),
        Chapter(
            id: "clt", number: 3,
            titleEN: "Why Do the Polls Look the Same?", titleKO: "왜 여론조사 결과는 비슷할까?",
            subtitleEN: "The Central Limit Theorem", subtitleKO: "중심극한정리",
            descriptionEN: "A visual exploration of the Central Limit Theorem and modern probability. Draw your own distribution and watch the Gaussian bell curve emerge.",
            descriptionKO: "중심극한정리와 현대 확률론의 시각적 탐험. 직접 분포를 그리고 가우시안 종형 곡선이 나타나는 것을 보세요.",
            tags: ["CLT", "Random Matrices", "Probability"],
            htmlFileEN: "clt", htmlFileKO: "clt_ko",
            part: .pureMathematics, narrationSegmentsFile: "clt_narration"
        ),
        Chapter(
            id: "hyperbolic", number: 4,
            titleEN: "Living in a Hyperbolic Space", titleKO: "쌍곡 공간에서 살기",
            subtitleEN: "Beyond Euclid", subtitleKO: "유클리드 너머",
            descriptionEN: "Where the parallel postulate fails and triangles contain less than 180°. Walk through hyperbolic 3-space and follow Mirzakhani's path.",
            descriptionKO: "평행선 공준이 무너지고 삼각형의 내각의 합이 180°보다 작은 공간. 미르자하니의 길을 따라가 보세요.",
            tags: ["Hyperbolic Geometry", "Tessellations", "Mirzakhani"],
            htmlFileEN: "hyperbolic", htmlFileKO: "hyperbolic_ko",
            part: .pureMathematics, narrationSegmentsFile: "hyperbolic_narration"
        ),
        Chapter(
            id: "homology", number: 5,
            titleEN: "Shapes Have Memories", titleKO: "도형에는 기억이 있다",
            subtitleEN: "Homology", subtitleKO: "호몰로지",
            descriptionEN: "Counting holes in spaces — from loops on a torus to chains, cycles, and boundaries. See how algebraic topology assigns computable invariants to shapes.",
            descriptionKO: "공간의 구멍을 세다 — 토러스 위의 루프에서 사슬, 순환, 경계까지. 대수적 위상수학이 도형에 계산 가능한 불변량을 부여하는 방법을 보세요.",
            tags: ["Algebraic Topology", "Betti Numbers"],
            htmlFileEN: "homology", htmlFileKO: "homology_kr",
            part: .pureMathematics, narrationSegmentsFile: "homology_narration"
        ),
        Chapter(
            id: "mirror", number: 6,
            titleEN: "Through the Symplectic Looking-Glass", titleKO: "심플렉틱 거울 너머로",
            subtitleEN: "Mirror Symmetry", subtitleKO: "거울 대칭",
            descriptionEN: "A journey through symplectic geometry — from Hamilton's equations to mirror symmetry and the dualities connecting topology and physics.",
            descriptionKO: "심플렉틱 기하학으로의 여정 — 해밀턴 방정식부터 거울 대칭, 그리고 위상수학과 물리학을 융합하는 쌍대성까지.",
            tags: ["Symplectic Geometry", "Mirror Symmetry"],
            htmlFileEN: "mirror", htmlFileKO: "mirror-ko",
            part: .pureMathematics, narrationSegmentsFile: "mirror_narration"
        ),
        Chapter(
            id: "banach", number: 7,
            titleEN: "Banach–Tarski: F₂ on S²", titleKO: "바나흐–타르스키: S² 위의 F₂",
            subtitleEN: "Splitting Infinity", subtitleKO: "무한을 쪼개다",
            descriptionEN: "The most counterintuitive theorem in mathematics, visualized. Watch the free group F₂ act on the sphere via rotations.",
            descriptionKO: "수학에서 가장 반직관적인 정리를 시각화합니다. 자유군 F₂가 회전을 통해 구에 작용하는 모습을 관찰하세요.",
            tags: ["Free Groups", "Paradoxical Decomposition"],
            htmlFileEN: "banach", htmlFileKO: "banach_ko",
            part: .pureMathematics, narrationSegmentsFile: "banach_narration"
        ),
        Chapter(
            id: "volume", number: 8,
            titleEN: "Can You Measure Everything?", titleKO: "모든 것의 크기를 잴 수 있을까?",
            subtitleEN: "The Paradox of Volume", subtitleKO: "부피의 역설",
            descriptionEN: "Explore the surprising limits of what can be measured and the strange consequences of the Axiom of Choice.",
            descriptionKO: "측정할 수 있는 것의 한계와 선택 공리의 기이한 결과들을 탐험해 보세요.",
            tags: ["Measure Theory", "Axiom of Choice"],
            htmlFileEN: "volume", htmlFileKO: "volume-ko",
            part: .pureMathematics, narrationSegmentsFile: "volume_narration"
        ),
        Chapter(
            id: "banach-tarski", number: 9,
            titleEN: "Making the Sun from a Single Bean", titleKO: "콩 한 알로 태양 만들기",
            subtitleEN: "The Banach-Tarski Paradox", subtitleKO: "바나흐-타르스키 역설",
            descriptionEN: "A visual journey through the impossible decomposition that challenges our deepest intuitions about geometry.",
            descriptionKO: "기하학적 직관에 도전하는 불가능한 분해 과정을 시각적으로 체험하세요.",
            tags: ["Banach-Tarski", "Infinity"],
            htmlFileEN: "banach-tarski", htmlFileKO: "banach-tarski-ko",
            part: .pureMathematics, narrationSegmentsFile: "banach-tarski_narration"
        ),

        // ── Part II: Mathematics of Machine Learning ──
        Chapter(
            id: "think", number: 10,
            titleEN: "Does a Machine Think?", titleKO: "기계는 생각하는가?",
            subtitleEN: "When thought reduces to multiplication", subtitleKO: "사고가 곱셈으로 환원될 때",
            descriptionEN: "From logic gates to neural networks, explore the mathematical foundations of computation.",
            descriptionKO: "논리 게이트부터 신경망까지, 연산의 수학적 기초를 탐험합니다.",
            tags: ["Computation", "Neural Networks"],
            htmlFileEN: "think", htmlFileKO: "think_ko",
            part: .mathematicsOfML, narrationSegmentsFile: "think_narration"
        ),
        Chapter(
            id: "see", number: 11,
            titleEN: "Does a Machine See?", titleKO: "기계는 보는가?",
            subtitleEN: "Convolution and Computer Vision", subtitleKO: "합성곱과 컴퓨터 비전의 수학",
            descriptionEN: "How machines learn to detect edges and recognize patterns through mathematical operations.",
            descriptionKO: "기계가 수학적 연산을 통해 모서리를 검출하고 패턴을 인식하는 방법을 배웁니다.",
            tags: ["Convolution", "Computer Vision"],
            htmlFileEN: "see", htmlFileKO: "see_ko",
            part: .mathematicsOfML, narrationSegmentsFile: "see_narration"
        ),
        Chapter(
            id: "speak", number: 12,
            titleEN: "Does a Machine Speak?", titleKO: "기계는 말하는가?",
            subtitleEN: "Fourier Transforms to Speech Synthesis", subtitleKO: "푸리에 변환에서 음성 합성까지",
            descriptionEN: "How machines decompose and generate the human voice through the mathematics of frequency and time.",
            descriptionKO: "기계가 주파수와 시간의 수학을 통해 인간의 목소리를 어떻게 분해하고 또 만들어내는지 탐험합니다.",
            tags: ["Fourier Transforms", "Speech Synthesis"],
            htmlFileEN: "speak", htmlFileKO: "speak_ko",
            part: .mathematicsOfML, narrationSegmentsFile: "speak_narration"
        ),
        Chapter(
            id: "diffusion1", number: 13,
            titleEN: "How Does Information Spread?", titleKO: "정보는 어떻게 퍼질까?",
            subtitleEN: "Diffusion Part 1/2", subtitleKO: "확산 파트 1/2",
            descriptionEN: "The physics of diffusion — from a stone dropped in still water to the one equation that governs heat, probability, and the spread of information.",
            descriptionKO: "확산의 물리학 — 잔잔한 물에 떨어진 돌에서 열, 확률, 정보의 확산을 지배하는 하나의 방정식까지.",
            tags: ["Diffusion Equation", "Heat Equation"],
            htmlFileEN: "diffusion-1", htmlFileKO: "diffusion-1-ko",
            part: .mathematicsOfML, narrationSegmentsFile: "diffusion1_narration"
        ),
        Chapter(
            id: "diffusion2", number: 14,
            titleEN: "Does a Machine Dream?", titleKO: "기계는 꿈을 꾸는가?",
            subtitleEN: "Diffusion Part 2/2", subtitleKO: "확산 파트 2/2",
            descriptionEN: "Noise, latent space, and the imagination of AI — watch images emerge from pure noise and see the mathematics behind Stable Diffusion.",
            descriptionKO: "노이즈, 잠재 공간, 그리고 AI의 상상력 — 순수한 노이즈에서 이미지가 탄생하는 과정을 보세요.",
            tags: ["Diffusion Models", "Generative AI"],
            htmlFileEN: "diffusion-2", htmlFileKO: "diffusion-2-ko",
            part: .mathematicsOfML, narrationSegmentsFile: "diffusion2_narration"
        ),
        Chapter(
            id: "remember", number: 15,
            titleEN: "Does a Machine Remember?", titleKO: "기계는 기억하는가?",
            subtitleEN: nil, subtitleKO: nil,
            descriptionEN: "How machines store, retrieve, and reconstruct information — from Hopfield networks to modern memory-augmented architectures.",
            descriptionKO: "기계가 정보를 저장하고, 검색하고, 재구성하는 방법 — 홉필드 네트워크에서 현대의 메모리 확장 아키텍처까지.",
            tags: ["Hopfield Networks", "Associative Memory"],
            htmlFileEN: "remember", htmlFileKO: "remember_ko",
            part: .mathematicsOfML, narrationSegmentsFile: "remember_narration"
        ),
        Chapter(
            id: "transformer", number: 16,
            titleEN: "Does a Machine Understand?", titleKO: "기계는 이해하는가?",
            subtitleEN: nil, subtitleKO: nil,
            descriptionEN: "From linear algebra to language — see how dot products become attention and a single architecture learned to read, write, and reason.",
            descriptionKO: "선형대수에서 언어까지 — 내적이 어떻게 어텐션이 되고, 하나의 아키텍처가 읽고 쓰고 추론하는 법을 배웠는지 보세요.",
            tags: ["Transformers", "Self-Attention", "NLP"],
            htmlFileEN: "transformer", htmlFileKO: "transformer_ko",
            part: .mathematicsOfML, narrationSegmentsFile: "transformer_narration"
        ),
        Chapter(
            id: "imagine", number: 17,
            titleEN: "Does a Machine Imagine?", titleKO: "기계는 상상하는가?",
            subtitleEN: "GANs and Adversarial Creation", subtitleKO: "GAN과 적대적 창조의 수학",
            descriptionEN: "How two competing networks learn to generate images, music, and worlds that never existed.",
            descriptionKO: "두 신경망이 경쟁하며 한 번도 존재하지 않았던 이미지와 음악을 만들어내는 원리입니다.",
            tags: ["GANs", "Generative Models"],
            htmlFileEN: "imagine", htmlFileKO: "imagine_ko",
            part: .mathematicsOfML, narrationSegmentsFile: "imagine_narration"
        ),
        Chapter(
            id: "judge", number: 18,
            titleEN: "Does a Machine Judge?", titleKO: "기계는 판단하는가?",
            subtitleEN: "Algorithmic Fairness", subtitleKO: "알고리즘 공정성의 수학",
            descriptionEN: "Explore the impossibility theorems and trade-offs when machines make decisions affecting human lives.",
            descriptionKO: "기계가 인간의 삶에 영향을 미치는 결정을 내릴 때 발생하는 알고리즘의 한계와 딜레마를 알아봅니다.",
            tags: ["Algorithmic Fairness", "Bias"],
            htmlFileEN: "judge", htmlFileKO: "judge_ko",
            part: .mathematicsOfML, narrationSegmentsFile: "judge_narration"
        ),
        Chapter(
            id: "suffer", number: 19,
            titleEN: "Does a Machine Suffer?", titleKO: "기계는 고통받는가?",
            subtitleEN: "The Science of AI Consciousness", subtitleKO: "AI 의식의 과학",
            descriptionEN: "Where mathematics meets philosophy at the boundary of what machines can and cannot feel.",
            descriptionKO: "기계가 무언가를 느낄 수 있는지에 대한 수학과 철학의 경계선상의 질문을 던집니다.",
            tags: ["AI Consciousness", "Philosophy of Mind"],
            htmlFileEN: "suffer", htmlFileKO: "suffer_ko",
            part: .mathematicsOfML, narrationSegmentsFile: "suffer_narration"
        )
    ]"""

with open(file_path, 'r') as f:
    content = f.read()

# Replace everything from "static let all: [Chapter] = [" to the matching "    ]"
start_idx = content.find("    static let all: [Chapter] = [")
# find the next "    ]" that ends the array
end_idx = content.find("    ]", start_idx) + 5

new_content = content[:start_idx] + new_array + content[end_idx:]

with open(file_path, 'w') as f:
    f.write(new_content)

print("Updated Chapter.swift!")
