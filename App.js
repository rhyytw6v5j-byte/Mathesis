import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  TextInput, SafeAreaView, StatusBar as RNStatusBar, Alert,
} from 'react-native';

/* ============================================================
   THEME
============================================================ */
const theme = {
  colors: {
    bg: '#0B0F1A',
    surface: '#131A2A',
    surfaceAlt: '#1B2438',
    primary: '#6C8CFF',
    accent: '#F0B429',
    success: '#37D67A',
    danger: '#FF5C7A',
    warning: '#FFB020',
    text: '#E8ECF5',
    muted: '#8A93A8',
    border: '#243049',
  },
};

/* ============================================================
   DATA — ARBRE DE COMPÉTENCES
============================================================ */
const SKILL_TREE = {
  id: 'root', name: 'Mathématiques', progress: 0.62,
  children: [
    { id: 'analysis', name: 'Analyse', progress: 0.91, color: '#6C8CFF', children: [
      { id: 'limits', name: 'Limites', progress: 0.98 },
      { id: 'continuity', name: 'Continuité', progress: 0.94 },
      { id: 'integration', name: 'Intégration', progress: 0.87 },
      { id: 'measure', name: 'Théorie de la mesure', progress: 0.62 },
      { id: 'functional', name: 'Analyse fonctionnelle', progress: 0.31 },
    ]},
    { id: 'algebra', name: 'Algèbre', progress: 0.82, color: '#B57BFF', children: [
      { id: 'groups', name: 'Groupes', progress: 0.91 },
      { id: 'rings', name: 'Anneaux', progress: 0.76 },
      { id: 'fields', name: 'Corps', progress: 0.68 },
      { id: 'modules', name: 'Modules', progress: 0.42 },
    ]},
    { id: 'topology', name: 'Topologie', progress: 0.64, color: '#37D67A', children: [
      { id: 'general-top', name: 'Topologie générale', progress: 0.71 },
      { id: 'algebraic-top', name: 'Topologie algébrique', progress: 0.38 },
    ]},
    { id: 'probability', name: 'Probabilités', progress: 0.73, color: '#F0B429', children: [
      { id: 'discrete-proba', name: 'Probabilités discrètes', progress: 0.88 },
      { id: 'measure-proba', name: 'Probabilités mesurables', progress: 0.55 },
    ]},
    { id: 'geometry', name: 'Géométrie', progress: 0.51, color: '#FF5C7A', children: [
      { id: 'diff-geo', name: 'Géométrie différentielle', progress: 0.44 },
      { id: 'alg-geo', name: 'Géométrie algébrique', progress: 0.18 },
    ]},
  ],
};

/* ============================================================
   DATA — FAIBLESSES (Mémoire des erreurs)
============================================================ */
const WEAKNESSES = [
  { id: 'w1', skill: 'Convergence uniforme', mastery: 0.42,
    reason: 'Confusion récurrente avec la convergence simple.',
    remedies: ['Mini-cours', 'Contre-exemples', 'Exercices ciblés'] },
  { id: 'w2', skill: 'Sauts de justification', mastery: 0.55,
    reason: 'Étapes implicites non démontrées dans les preuves.',
    remedies: ['Preuves guidées', 'Mode adversaire'] },
];

/* ============================================================
   DATA — MISSION DU JOUR
============================================================ */
const DAILY_MISSION = {
  title: 'Démontrer un théorème',
  subtitle: 'Toute suite monotone et bornée converge.',
  xp: 120,
};

/* ============================================================
   DATA — MODE PREUVE
============================================================ */
const PROOF_EXERCISE = {
  theorem: 'Toute suite monotone et bornée de réels converge.',
  steps: [
    { id: 's1', question: 'Quelles définitions sont nécessaires ?', multi: true,
      options: [
        { id: 'a', label: 'Suite', correct: true },
        { id: 'b', label: 'Monotonie', correct: true },
        { id: 'c', label: 'Bornitude', correct: true },
        { id: 'd', label: 'Convergence', correct: true },
        { id: 'e', label: 'Dérivabilité', correct: false },
        { id: 'f', label: 'Compacité séquentielle', correct: false },
      ]},
    { id: 's2', question: 'Quelle propriété fondamentale de ℝ utilises-tu ?', multi: false,
      options: [
        { id: 'a', label: 'La complétude (borne sup.)', correct: true },
        { id: 'b', label: "L'axiome du choix", correct: false },
        { id: 'c', label: 'La densité de ℚ', correct: false },
      ]},
    { id: 's3', question: 'Formule la conclusion : la suite converge vers…', multi: false,
      options: [
        { id: 'a', label: 'sup{ uₙ : n ∈ ℕ }', correct: true },
        { id: 'b', label: 'inf{ uₙ : n ∈ ℕ }', correct: false },
        { id: 'c', label: '0', correct: false },
      ]},
  ],
};

/* ============================================================
   DATA — RANGS & GÉNOME
============================================================ */
const RANKS = ['Novice', 'Problem Solver', 'Proof Builder', 'Mathematical Thinker',
  'Advanced Mathematician', 'Research Student', 'Researcher'];
const CURRENT_RANK = 4;

const GENOME = [
  { label: 'Intuition conceptuelle', value: 0.92 },
  { label: 'Rigueur des preuves', value: 0.58 },
  { label: 'Calcul', value: 0.88 },
  { label: 'Abstraction', value: 0.61 },
  { label: 'Formalisation de conjectures', value: 0.49 },
  { label: 'Résistance à l’oubli', value: 0.74 },
];

/* ============================================================
   DATA — LABO DE CONJECTURES
============================================================ */
const CONJECTURES = [
  {
    id: 'c1',
    title: 'Conjecture de Collatz (test partiel)',
    formula: 'u(n+1) = n/2 si n pair, 3n+1 si n impair',
    hypothesis: 'Toute suite de Collatz atteint 1.',
    testFn: (n) => {
      let x = n, steps = 0;
      while (x !== 1 && steps < 10000) { x = x % 2 === 0 ? x / 2 : 3 * x + 1; steps++; }
      return { result: x === 1, steps, value: x };
    },
    sampleInputs: [1, 2, 3, 6, 7, 27],
    warning: 'Les tests numériques ne constituent PAS une preuve.',
  },
  {
    id: 'c2',
    title: 'Somme des n premiers entiers',
    formula: '1 + 2 + … + n = n(n+1)/2',
    hypothesis: 'La formule tient pour tout n ≥ 1.',
    testFn: (n) => {
      const sum = (n * (n + 1)) / 2;
      let s = 0; for (let i = 1; i <= n; i++) s += i;
      return { result: s === sum, steps: n, value: s };
    },
    sampleInputs: [1, 2, 5, 10, 100, 1000],
    warning: 'Vérifier numériquement n’équivaut pas à démontrer par récurrence.',
  },
  {
    id: 'c3',
    title: 'n² + n + 41 est premier',
    formula: 'f(n) = n² + n + 41',
    hypothesis: 'f(n) est premier pour tout n ≥ 0.',
    testFn: (n) => {
      const v = n * n + n + 41;
      const isPrime = (x) => { if (x < 2) return false;
        for (let i = 2; i * i <= x; i++) if (x % i === 0) return false; return true; };
      return { result: isPrime(v), steps: n, value: v };
    },
    sampleInputs: [0, 1, 2, 10, 39, 40, 41],
    warning: 'Contre-exemple classique : chercher plus loin que n = 40.',
  },
];

/* ============================================================
   DATA — QUALIFYING EXAM
============================================================ */
const QUALIFYING_EXAM = {
  title: 'Analysis Qualifying Exam',
  durationSec: 45 * 60,
  questions: [
    {
      id: 'q1',
      category: 'Définitions',
      question: 'Énonce précisément la convergence uniforme d’une suite (fₙ) vers f sur E.',
      keywords: ['sup', 'epsilon', 'ε', '∀', 'uniforme'],
      expected: '∀ ε > 0, ∃ N ∈ ℕ, ∀ n ≥ N, ∀ x ∈ E, |fₙ(x) − f(x)| < ε (équiv. sup_{x∈E}|fₙ−f| → 0).',
    },
    {
      id: 'q2',
      category: 'Technique de preuve',
      question: 'Quelle technique utilises-tu pour montrer qu’une suite monotone et bornée converge dans ℝ ?',
      keywords: ['borne sup', 'sup', 'complétude', 'monotone'],
      expected: 'On pose L = sup{uₙ}. Par définition du sup, ∀ ε > 0 il existe N tel que u_N > L − ε, puis par monotonie ∀ n ≥ N, |uₙ − L| ≤ ε.',
    },
    {
      id: 'q3',
      category: 'Résolution',
      question: 'Soit fₙ(x) = xⁿ sur [0,1]. La convergence est-elle uniforme ? Justifie.',
      keywords: ['non', 'pas uniforme', 'discontinuité', 'limite'],
      expected: 'Non uniforme : la limite ponctuelle est f(x)=0 sur [0,1[ et f(1)=1, discontinue ; une limite uniforme de fonctions continues serait continue.',
    },
  ],
};

/* ============================================================
   DATA — INDICES PROGRESSIFS
============================================================ */
const HINTS = [
  { level: 1, text: 'Indice 1 — Relis la définition de la convergence.' },
  { level: 2, text: 'Indice 2 — Pense à utiliser la borne supérieure.' },
  { level: 3, text: 'Indice 3 — Construis N à partir de ε via la caractérisation du sup.' },
  { level: 4, text: 'Solution — L = sup{uₙ}. Soit ε>0. Par définition du sup, ∃N tel que u_N > L−ε. Par monotonie, ∀n≥N : L−ε < u_N ≤ uₙ ≤ L. Donc |uₙ−L|<ε.' },
];

const AUTONOMY_PENALTY = [1, 0.85, 0.65, 0.4, 0.1];

/* ============================================================
   COMPOSANT — BARRE DE PROGRESSION
============================================================ */
function ProgressBar({ value = 0, color = theme.colors.primary, height = 8 }) {
  return (
    <View style={{ height, borderRadius: height / 2,
      backgroundColor: theme.colors.surfaceAlt, overflow: 'hidden' }}>
      <View style={{
        width: `${Math.min(100, Math.max(0, value * 100))}%`,
        height: '100%', backgroundColor: color,
      }} />
    </View>
  );
}

/* ============================================================
   ÉCRAN — ACCUEIL
============================================================ */
function HomeScreen({ goToProof }) {
  return (
    <ScrollView style={s.container} contentContainerStyle={s.scrollPad}>
      <Text style={s.brand}>MATHESIS</Text>
      <Text style={s.tagline}>De zéro à la recherche.</Text>

      <View style={s.card}>
        <View style={s.rowBetween}>
          <Text style={s.cardLabel}>Niveau 17</Text>
          <Text style={s.pct}>82 %</Text>
        </View>
        <ProgressBar value={0.82} />
        <Text style={s.muted}>Advanced Mathematics → Qualifying Exams</Text>
      </View>

      <Pressable style={[s.card, { borderColor: theme.colors.primary }]} onPress={goToProof}>
        <Text style={s.cardLabel}>🎯 Mission du jour</Text>
        <Text style={s.missionTitle}>{DAILY_MISSION.title}</Text>
        <Text style={s.muted}>{DAILY_MISSION.subtitle}</Text>
        <View style={[s.badge, { backgroundColor: '#B57BFF' }]}>
          <Text style={s.badgeTxt}>+{DAILY_MISSION.xp} XP</Text>
        </View>
      </Pressable>

      <View style={s.card}>
        <Text style={s.cardLabel}>🔥 Série</Text>
        <Text style={s.bigNumber}>24 jours</Text>
      </View>

      <View style={[s.card, { borderColor: theme.colors.danger }]}>
        <Text style={[s.cardLabel, { color: theme.colors.danger }]}>🧠 Faiblesse détectée</Text>
        <Text style={s.missionTitle}>{WEAKNESSES[0].skill}</Text>
        <View style={[s.rowBetween, { marginTop: 8 }]}>
          <Text style={[s.muted, { flex: 1 }]}>{WEAKNESSES[0].reason}</Text>
          <Text style={{ color: theme.colors.danger, fontWeight: '700' }}>
            {Math.round(WEAKNESSES[0].mastery * 100)} %
          </Text>
        </View>
        <View style={{ marginTop: 8 }}>
          <ProgressBar value={WEAKNESSES[0].mastery} color={theme.colors.danger} />
        </View>
      </View>

      <Pressable style={s.cta} onPress={goToProof}>
        <Text style={s.ctaTxt}>COMMENCER</Text>
      </Pressable>
    </ScrollView>
  );
}

/* ============================================================
   ÉCRAN — COMPÉTENCES
============================================================ */
function SkillNode({ node, depth = 0 }) {
  return (
    <View style={{ marginLeft: depth * 14, marginBottom: 12 }}>
      <View style={s.rowBetween}>
        <Text style={[s.skillName, depth === 0 && s.skillRoot]}>{node.name}</Text>
        <Text style={s.pct}>{Math.round(node.progress * 100)} %</Text>
      </View>
      <ProgressBar value={node.progress} color={node.color || theme.colors.primary} />
      {node.children?.map((c) => <SkillNode key={c.id} node={c} depth={depth + 1} />)}
    </View>
  );
}

function SkillTreeScreen() {
  return (
    <ScrollView style={s.container} contentContainerStyle={s.scrollPad}>
      <Text style={s.h1}>Ton génome mathématique</Text>
      <Text style={s.sub}>Analyse, algèbre, topologie — mesurées par compréhension, preuve et mémorisation.</Text>

      <View style={s.card}>
        <Text style={s.cardLabel}>CARTE DE TON CERVEAU</Text>
        <View style={{ marginTop: 12 }}>
          <SkillNode node={SKILL_TREE} />
        </View>
      </View>

      <Text style={[s.h2, { marginTop: 20 }]}>Mémoire des erreurs</Text>
      {WEAKNESSES.map((w) => (
        <View key={w.id} style={[s.card, { borderColor: theme.colors.border }]}>
          <Text style={s.missionTitle}>{w.skill}</Text>
          <Text style={s.muted}>{w.reason}</Text>
          <View style={{ marginTop: 8 }}>
            <ProgressBar value={w.mastery} color={theme.colors.danger} />
          </View>
          <View style={s.chips}>
            {w.remedies.map((r) => (
              <View key={r} style={s.chip}><Text style={s.chipTxt}>{r}</Text></View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

/* ============================================================
   ÉCRAN — MODE PREUVE
============================================================ */
function ProofModeScreen({ onBack }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [selected, setSelected] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [freeProof, setFreeProof] = useState('');
  const [aiResponse, setAiResponse] = useState(null);

  const step = PROOF_EXERCISE.steps[stepIdx];
  const progress = stepIdx / PROOF_EXERCISE.steps.length;

  const toggle = (opt) => {
    if (step.multi) {
      setSelected((prev) => prev.includes(opt.id)
        ? prev.filter((x) => x !== opt.id)
        : [...prev, opt.id]);
    } else {
      setSelected([opt.id]);
    }
    setFeedback(null);
  };

  const validate = () => {
    const correctIds = step.options.filter((o) => o.correct).map((o) => o.id).sort();
    const chosen = [...selected].sort();
    const ok = JSON.stringify(correctIds) === JSON.stringify(chosen);
    setFeedback(ok
      ? { type: 'ok', text: '✅ Étape validée.' }
      : { type: 'error', text: '❌ Cette étape est intuitive mais pas démontrée.' });
    if (ok && stepIdx < PROOF_EXERCISE.steps.length - 1) {
      setTimeout(() => {
        setStepIdx(stepIdx + 1);
        setSelected([]);
        setFeedback(null);
      }, 900);
    }
  };

  const askAI = () => {
    if (freeProof.trim().length < 20) {
      setAiResponse({ type: 'warn', text: '⚠️ Ta preuve est trop courte. Développe tes justifications.' });
    } else if (!freeProof.includes('car') && !freeProof.includes('donc')) {
      setAiResponse({ type: 'warn', text: '⚠️ Tu sautes des justifications (pas de "car"/"donc" explicite).' });
    } else {
      setAiResponse({ type: 'ok', text: '✅ Structure cohérente. Vérifie l’usage implicite de la complétude de ℝ.' });
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.scrollPad}>
      <Pressable onPress={onBack} style={s.backBtn}>
        <Text style={s.backTxt}>← Retour</Text>
      </Pressable>

      <Text style={s.kicker}>MODE PREUVE</Text>
      <Text style={s.theorem}>{PROOF_EXERCISE.theorem}</Text>

      <View style={{ marginTop: 12 }}>
        <ProgressBar value={progress} />
      </View>

      <View style={s.card}>
        <Text style={s.cardLabel}>Étape {stepIdx + 1} / {PROOF_EXERCISE.steps.length}</Text>
        <Text style={s.question}>{step.question}</Text>

        {step.options.map((opt) => {
          const isSel = selected.includes(opt.id);
          return (
            <Pressable
              key={opt.id}
              onPress={() => toggle(opt)}
              style={[s.option, isSel && s.optionSel]}
            >
              <Text style={[s.optionTxt, isSel && { color: '#fff' }]}>{opt.label}</Text>
            </Pressable>
          );
        })}

        <Pressable style={s.btn} onPress={validate}>
          <Text style={s.btnTxt}>VALIDER</Text>
        </Pressable>

        {feedback && (
          <Text style={{
            marginTop: 12,
            color: feedback.type === 'ok' ? theme.colors.success
              : feedback.type === 'warn' ? theme.colors.warning
              : theme.colors.danger,
          }}>{feedback.text}</Text>
        )}
      </View>

      <Text style={s.h2}>Preuve libre</Text>
      <TextInput
        multiline
        value={freeProof}
        onChangeText={setFreeProof}
        placeholder="Écris ta démonstration… justifie chaque étape."
        placeholderTextColor={theme.colors.muted}
        style={s.textarea}
      />
      <Pressable style={[s.btn, { backgroundColor: theme.colors.accent }]} onPress={askAI}>
        <Text style={[s.btnTxt, { color: '#0B0F1A' }]}>ANALYSER AVEC L’IA</Text>
      </Pressable>
      {aiResponse && (
        <Text style={{
          marginTop: 12,
          color: aiResponse.type === 'ok' ? theme.colors.success : theme.colors.warning,
        }}>{aiResponse.text}</Text>
      )}
    </ScrollView>
  );
}

/* ============================================================
   ÉCRAN — LABO DE CONJECTURES
============================================================ */
function ConjectureLabScreen() {
  const [active, setActive] = useState(CONJECTURES[0]);
  const [n, setN] = useState('10');
  const [results, setResults] = useState([]);
  const [verdict, setVerdict] = useState(null);

  const testOne = () => {
    const val = parseInt(n, 10);
    if (isNaN(val) || val < 0) { Alert.alert('Entrée invalide', 'Entre un entier ≥ 0.'); return; }
    const r = active.testFn(val);
    setResults((prev) => [{ n: val, ...r }, ...prev].slice(0, 10));
  };

  const testBatch = () => {
    const out = [];
    let counterFound = null;
    for (const v of active.sampleInputs) {
      const r = active.testFn(v);
      out.push({ n: v, ...r });
      if (!r.result) { counterFound = v; break; }
    }
    setResults(out.reverse());
    setVerdict(counterFound !== null ? { type: 'counter', n: counterFound } : { type: 'ok' });
  };

  useEffect(() => { setResults([]); setVerdict(null); }, [active]);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.scrollPad}>
      <Text style={s.h1}>🧪 Laboratoire de conjectures</Text>
      <Text style={s.sub}>Teste, cherche des contre-exemples… puis prouve.</Text>

      <View style={s.tabs}>
        {CONJECTURES.map((c) => (
          <Pressable key={c.id} onPress={() => setActive(c)}
            style={[s.tab, active.id === c.id && s.tabActive]}>
            <Text style={[s.tabTxt, active.id === c.id && { color: '#fff' }]} numberOfLines={1}>
              {c.id.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>{active.title}</Text>
        <Text style={[s.muted, { fontFamily: 'monospace', marginTop: 8 }]}>{active.formula}</Text>
        <Text style={s.muted}>Hypothèse : {active.hypothesis}</Text>
      </View>

      <View style={s.card}>
        <Text style={s.cardLabel}>Tester une valeur</Text>
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <TextInput
            value={n}
            onChangeText={setN}
            keyboardType="numeric"
            style={[s.textarea, { minHeight: 44, flex: 1, marginBottom: 0, marginRight: 8, padding: 10 }]}
            placeholder="n = ..."
            placeholderTextColor={theme.colors.muted}
          />
          <Pressable style={[s.btn, { marginTop: 0, paddingHorizontal: 18 }]} onPress={testOne}>
            <Text style={s.btnTxt}>TESTER</Text>
          </Pressable>
        </View>
        <Pressable style={[s.btn, { backgroundColor: theme.colors.accent, marginTop: 12 }]} onPress={testBatch}>
          <Text style={[s.btnTxt, { color: '#0B0F1A' }]}>TESTER LA SÉRIE</Text>
        </Pressable>
      </View>

      {verdict && (
        <View style={[s.card, {
          borderColor: verdict.type === 'counter' ? theme.colors.danger : theme.colors.success,
        }]}>
          <Text style={[s.cardTitle, {
            color: verdict.type === 'counter' ? theme.colors.danger : theme.colors.success,
          }]}>
            {verdict.type === 'counter' ? `❌ Contre-exemple trouvé : n = ${verdict.n}` : '✓ Aucun contre-exemple trouvé'}
          </Text>
          <Text style={s.muted}>⚠️ {active.warning}</Text>
          <Pressable style={[s.btn, { marginTop: 12 }]}>
            <Text style={s.btnTxt}>CONSTRUIRE UNE PREUVE →</Text>
          </Pressable>
        </View>
      )}

      {results.length > 0 && (
        <View style={s.card}>
          <Text style={s.cardLabel}>Résultats</Text>
          {results.map((r, i) => (
            <View key={i} style={[s.rowBetween, { marginTop: 8 }]}>
              <Text style={{ color: theme.colors.text }}>n = {r.n}</Text>
              <Text style={{ color: theme.colors.muted }}>valeur = {r.value}</Text>
              <Text style={{ color: r.result ? theme.colors.success : theme.colors.danger, fontWeight: '700' }}>
                {r.result ? '✓' : '✗'}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

/* ============================================================
   ÉCRAN — QUALIFYING EXAM
============================================================ */
function QualifyingExamScreen() {
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUALIFYING_EXAM.durationSec);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!started || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); setSubmitted(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started, submitted]);

  const fmt = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const ss = (sec % 60).toString().padStart(2, '0');
    return `${m}:${ss}`;
  };

  const grade = () => {
    let total = 0;
    QUALIFYING_EXAM.questions.forEach((q) => {
      const txt = (answers[q.id] || '').toLowerCase();
      const hits = q.keywords.filter((k) => txt.includes(k.toLowerCase())).length;
      total += hits / q.keywords.length;
    });
    return Math.round((total / QUALIFYING_EXAM.questions.length) * 100);
  };

  if (!started) {
    return (
      <ScrollView style={s.container} contentContainerStyle={s.scrollPad}>
        <Text style={s.h1}>🥶 Qualifying Exam Mode</Text>
        <Text style={s.sub}>Chronomètre actif. Aucun indice. Aucune correction immédiate.</Text>
        <View style={[s.card, { borderColor: theme.colors.danger }]}>
          <Text style={s.cardTitle}>{QUALIFYING_EXAM.title}</Text>
          <Text style={s.muted}>Durée : {QUALIFYING_EXAM.durationSec / 60} minutes</Text>
          <Text style={s.muted}>{QUALIFYING_EXAM.questions.length} questions</Text>
        </View>
        <Pressable style={[s.cta, { backgroundColor: theme.colors.danger }]}
          onPress={() => setStarted(true)}>
          <Text style={s.ctaTxt}>DÉMARRER L’EXAMEN</Text>
        </Pressable>
      </ScrollView>
    );
  }

  if (submitted) {
    const score = grade();
    const pass = score >= 60;
    return (
      <ScrollView style={s.container} contentContainerStyle={s.scrollPad}>
        <Text style={s.h1}>{QUALIFYING_EXAM.title}</Text>
        <View style={[s.card, { borderColor: pass ? theme.colors.success : theme.colors.danger }]}>
          <Text style={[s.cardTitle, { color: pass ? theme.colors.success : theme.colors.danger }]}>
            {pass ? '✓ PASS' : '✗ FAIL'}
          </Text>
          <Text style={s.bigNumber}>{score} %</Text>
          <ProgressBar value={score / 100} color={pass ? theme.colors.success : theme.colors.danger} />
        </View>
        {QUALIFYING_EXAM.questions.map((q) => (
          <View key={q.id} style={s.card}>
            <Text style={s.cardLabel}>{q.category}</Text>
            <Text style={[s.muted, { marginTop: 6 }]}>{q.question}</Text>
            <Text style={{ color: theme.colors.text, marginTop: 10, fontWeight: '700' }}>Ta réponse :</Text>
            <Text style={{ color: theme.colors.muted, marginTop: 4 }}>
              {answers[q.id] || '(vide)'}
            </Text>
            <Text style={{ color: theme.colors.success, marginTop: 10, fontWeight: '700' }}>
              Réponse attendue :
            </Text>
            <Text style={{ color: theme.colors.muted, marginTop: 4 }}>{q.expected}</Text>
          </View>
        ))}
        <Pressable style={s.cta} onPress={() => {
          setStarted(false); setSubmitted(false);
          setAnswers({}); setTimeLeft(QUALIFYING_EXAM.durationSec);
        }}>
          <Text style={s.ctaTxt}>RECOMMENCER</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.scrollPad}>
      <View style={[s.rowBetween, { alignItems: 'center' }]}>
        <Text style={s.h1}>{QUALIFYING_EXAM.title}</Text>
        <View style={[s.badge, {
          backgroundColor: timeLeft < 300 ? theme.colors.danger : theme.colors.surfaceAlt,
          marginTop: 0,
        }]}>
          <Text style={s.badgeTxt}>⏱ {fmt(timeLeft)}</Text>
        </View>
      </View>

      {QUALIFYING_EXAM.questions.map((q, idx) => (
        <View key={q.id} style={s.card}>
          <Text style={s.cardLabel}>Q{idx + 1} · {q.category}</Text>
          <Text style={[s.cardTitle, { marginTop: 8 }]}>{q.question}</Text>
          <TextInput
            multiline
            value={answers[q.id] || ''}
            onChangeText={(t) => setAnswers((a) => ({ ...a, [q.id]: t }))}
            placeholder="Ta réponse…"
            placeholderTextColor={theme.colors.muted}
            style={s.textarea}
          />
        </View>
      ))}

      <Pressable style={[s.cta, { backgroundColor: theme.colors.danger }]}
        onPress={() => { clearInterval(timerRef.current); setSubmitted(true); }}>
        <Text style={s.ctaTxt}>SOUMETTRE</Text>
      </Pressable>
    </ScrollView>
  );
}

/* ============================================================
   ÉCRAN — SYSTÈME D'INDICES
============================================================ */
function HintSystemScreen() {
  const [revealed, setRevealed] = useState([]);
  const autonomy = AUTONOMY_PENALTY[Math.min(revealed.length, AUTONOMY_PENALTY.length - 1)];

  const reveal = (level) => {
    if (revealed.includes(level)) return;
    if (level > revealed.length + 1) {
      Alert.alert('Indice bloqué', 'Débloque les indices dans l’ordre.');
      return;
    }
    if (level === 4) {
      Alert.alert(
        '⚠️ Voir la solution ?',
        'Ton niveau d’autonomie sur cette compétence diminuera.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Voir', style: 'destructive', onPress: () => setRevealed([...revealed, 4]) },
        ]
      );
      return;
    }
    setRevealed([...revealed, level]);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.scrollPad}>
      <Text style={s.h1}>🧠 Système d’indices</Text>
      <Text style={s.sub}>Développe ton cerveau — pas juste la réponse.</Text>

      <View style={[s.card, { borderColor: theme.colors.primary }]}>
        <Text style={s.cardLabel}>Autonomie actuelle</Text>
        <Text style={s.bigNumber}>{Math.round(autonomy * 100)} %</Text>
        <ProgressBar value={autonomy}
          color={autonomy > 0.7 ? theme.colors.success : autonomy > 0.4 ? theme.colors.warning : theme.colors.danger} />
      </View>

      {HINTS.map((h) => {
        const unlocked = revealed.includes(h.level);
        const locked = h.level > revealed.length + 1;
        const isSolution = h.level === 4;
        return (
          <Pressable
            key={h.level}
            onPress={() => reveal(h.level)}
            disabled={unlocked}
            style={[s.card, {
              borderColor: unlocked
                ? (isSolution ? theme.colors.danger : theme.colors.success)
                : theme.colors.border,
              opacity: locked ? 0.4 : 1,
            }]}
          >
            <View style={s.rowBetween}>
              <Text style={[s.cardTitle, isSolution && { color: theme.colors.danger }]}>
                {isSolution ? '🔓 Solution' : `Indice ${h.level}`}
              </Text>
              <Text style={{ color: theme.colors.muted }}>
                {unlocked ? '✓' : locked ? '🔒' : '👆 toucher'}
              </Text>
            </View>
            {unlocked && (
              <Text style={{ color: theme.colors.text, marginTop: 8 }}>{h.text}</Text>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/* ============================================================
   ÉCRAN — PROFESSEUR IA
============================================================ */
const MODES = {
  socratic: {
    title: '👨‍🏫 Mode Socrate',
    desc: 'Je ne donne presque jamais la réponse. Je pose des questions.',
    sample: '« Qu’est-ce que tu sais déjà ? Quelle définition pourrait s’appliquer ici ? »',
  },
  professor: {
    title: '🧑‍🏫 Mode Professeur',
    desc: 'Explication complète : intuition, définition, démonstration, exemples.',
    sample: '« Commençons par l’intuition : une suite monotone et bornée ne peut s’échapper… »',
  },
  adversary: {
    title: '🥊 Mode Adversaire',
    desc: 'J’essaie de casser ta preuve. Tu dois défendre chaque affirmation.',
    sample: '« Tu dis "f est continue". Pourquoi ? Quelle relation utilises-tu ? »',
  },
};

function TeacherScreen() {
  const [mode, setMode] = useState('socratic');
  const m = MODES[mode];

  return (
    <ScrollView style={s.container} contentContainerStyle={s.scrollPad}>
      <Text style={s.h1}>Professeur IA</Text>
      <Text style={s.sub}>Choisis ta personnalité pédagogique.</Text>

      <View style={s.tabs}>
        {Object.entries(MODES).map(([k, v]) => (
          <Pressable
            key={k}
            onPress={() => setMode(k)}
            style={[s.tab, mode === k && s.tabActive]}
          >
            <Text style={[s.tabTxt, mode === k && { color: '#fff' }]}>
              {v.title.split(' ')[0]}
            </Text>
            <Text style={[s.tabSub, mode === k && { color: '#fff' }]}>
              {k}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>{m.title}</Text>
        <Text style={s.desc}>{m.desc}</Text>
        <View style={s.bubble}>
          <Text style={s.bubbleTxt}>{m.sample}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

/* ============================================================
   ÉCRAN — PROFIL / GÉNOME
============================================================ */
function ProfileScreen() {
  return (
    <ScrollView style={s.container} contentContainerStyle={s.scrollPad}>
      <Text style={s.h1}>Ton génome mathématique</Text>
      <Text style={s.sub}>MATHESIS modélise ta façon de raisonner — pas seulement tes scores.</Text>

      <View style={s.card}>
        <Text style={s.cardLabel}>Rang actuel</Text>
        <Text style={s.rank}>{RANKS[CURRENT_RANK]}</Text>
        <View style={{ marginTop: 12 }}>
          <ProgressBar value={(CURRENT_RANK + 1) / RANKS.length} />
        </View>
        <Text style={s.muted}>Prochain palier : {RANKS[CURRENT_RANK + 1]}</Text>
      </View>

      <Text style={s.h2}>Dimensions cognitives</Text>
      {GENOME.map((g) => (
        <View key={g.label} style={{ marginBottom: 14 }}>
          <View style={[s.rowBetween, { marginBottom: 6 }]}>
            <Text style={{ color: theme.colors.text }}>{g.label}</Text>
            <Text style={{ color: theme.colors.muted }}>{Math.round(g.value * 100)} %</Text>
          </View>
          <ProgressBar
            value={g.value}
            color={g.value < 0.6 ? theme.colors.danger : theme.colors.success}
          />
        </View>
      ))}

      <Text style={s.h2}>Trajectoire recommandée</Text>
      <View style={[s.card, { backgroundColor: theme.colors.surfaceAlt }]}>
        <Text style={{ color: theme.colors.text, fontWeight: '700' }}>
          Analyse → Réelle → Mesure → Analyse fonctionnelle
        </Text>
        <Text style={s.muted}>Branche recommandée selon ton profil.</Text>
      </View>
    </ScrollView>
  );
}

/* ============================================================
   NAVIGATION
============================================================ */
const TABS = [
  { key: 'home', label: 'Accueil', icon: '🏠', component: HomeScreen },
  { key: 'skills', label: 'Compétences', icon: '🌳', component: SkillTreeScreen },
  { key: 'lab', label: 'Labo', icon: '🧪', component: ConjectureLabScreen },
  { key: 'exam', label: 'Exam', icon: '🥶', component: QualifyingExamScreen },
  { key: 'hints', label: 'Indices', icon: '🧠', component: HintSystemScreen },
  { key: 'teacher', label: 'Prof', icon: '🤖', component: TeacherScreen },
  { key: 'profile', label: 'Profil', icon: '🧬', component: ProfileScreen },
];

export default function App() {
  const [tab, setTab] = useState('home');
  const [screen, setScreen] = useState(null);

  if (screen === 'proof') {
    return (
      <SafeAreaView style={s.safe}>
        <RNStatusBar barStyle="light-content" backgroundColor={theme.colors.bg} />
        <ProofModeScreen onBack={() => setScreen(null)} />
      </SafeAreaView>
    );
  }

  const Active = TABS.find((t) => t.key === tab)?.component;
  return (
    <SafeAreaView style={s.safe}>
      <RNStatusBar barStyle="light-content" backgroundColor={theme.colors.bg} />
      <View style={{ flex: 1 }}>
        <Active goToProof={() => setScreen('proof')} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.border, flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: 8 }}
      >
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <Pressable key={t.key} style={s.tabItem} onPress={() => setTab(t.key)}>
              <Text style={[s.tabIcon, { opacity: active ? 1 : 0.5 }]}>{t.icon}</Text>
              <Text style={[s.tabLabel, { color: active ? theme.colors.primary : theme.colors.muted }]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ============================================================
   STYLES
============================================================ */
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  container: { flex: 1, backgroundColor: theme.colors.bg },
  scrollPad: { padding: 20, paddingBottom: 40 },

  brand: { color: theme.colors.text, fontSize: 34, fontWeight: '900', letterSpacing: 4 },
  tagline: { color: theme.colors.muted, marginTop: 4, marginBottom: 22 },

  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  cardLabel: { color: theme.colors.muted, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' },
  pct: { color: theme.colors.text, fontWeight: '700' },
  muted: { color: theme.colors.muted, marginTop: 8 },

  missionTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '700', marginTop: 8 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, marginTop: 12 },
  badgeTxt: { color: '#fff', fontWeight: '700', fontSize: 12 },

  bigNumber: { color: theme.colors.text, fontSize: 28, fontWeight: '800', marginTop: 6 },

  cta: { backgroundColor: theme.colors.primary, padding: 18,
    borderRadius: 14, alignItems: 'center', marginTop: 8 },
  ctaTxt: { color: '#fff', fontWeight: '800', letterSpacing: 3 },

  h1: { color: theme.colors.text, fontSize: 24, fontWeight: '800' },
  sub: { color: theme.colors.muted, marginTop: 6, marginBottom: 18, lineHeight: 20 },
  h2: { color: theme.colors.text, fontSize: 18, fontWeight: '700', marginBottom: 12 },

  skillName: { color: theme.colors.text, fontSize: 14, marginBottom: 6 },
  skillRoot: { fontSize: 17, fontWeight: '800' },

  chips: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  chip: { borderColor: theme.colors.border, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  chipTxt: { color: theme.colors.text, fontSize: 12 },

  kicker: { color: theme.colors.primary, letterSpacing: 3, fontSize: 11, marginBottom: 8 },
  theorem: { color: theme.colors.text, fontSize: 19, fontWeight: '700', lineHeight: 27 },
  question: { color: theme.colors.text, fontSize: 16, fontWeight: '600', marginVertical: 14 },

  option: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: 14,
    padding: 14, marginBottom: 8, backgroundColor: theme.colors.surfaceAlt },
  optionSel: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  optionTxt: { color: theme.colors.text, fontSize: 15 },

  btn: { backgroundColor: theme.colors.primary, padding: 14,
    borderRadius: 12, alignItems: 'center', marginTop: 8 },
  btnTxt: { color: '#fff', fontWeight: '800', letterSpacing: 2 },

  textarea: { minHeight: 120, backgroundColor: theme.colors.surface,
    borderRadius: 14, borderWidth: 1, borderColor: theme.colors.border,
    color: theme.colors.text, padding: 14, textAlignVertical: 'top', marginBottom: 12 },

  backBtn: { marginBottom: 16 },
  backTxt: { color: theme.colors.primary, fontWeight: '700' },

  tabs: { flexDirection: 'row', marginBottom: 20 },
  tab: { flex: 1, padding: 10, borderRadius: 12, borderWidth: 1,
    borderColor: theme.colors.border, alignItems: 'center', marginRight: 6 },
  tabActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  tabTxt: { color: theme.colors.text, fontSize: 14 },
  tabSub: { color: theme.colors.muted, fontSize: 10, marginTop: 2, textTransform: 'capitalize' },

  cardTitle: { color: theme.colors.text, fontSize: 20, fontWeight: '700' },
  desc: { color: theme.colors.muted, marginTop: 10, lineHeight: 20 },
  bubble: { marginTop: 20, padding: 16, backgroundColor: theme.colors.surfaceAlt,
    borderRadius: 14, borderLeftWidth: 3, borderLeftColor: theme.colors.primary },
  bubbleTxt: { color: theme.colors.text, fontStyle: 'italic' },

  rank: { color: theme.colors.text, fontSize: 22, fontWeight: '800', marginTop: 6 },

  tabItem: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 14, minWidth: 72 },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: 11, marginTop: 2 },
});
