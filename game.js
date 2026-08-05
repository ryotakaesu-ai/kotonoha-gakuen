/* ============================================================
   ことのは学園ものがたり — ゲーム本体
   ときメモ（好感度・イベント・エンディング分岐）×
   パワプロ サクセス（週コマンド・キャラ配置・経験点・特訓・試合＝テスト）
   ============================================================ */
"use strict";

/* ---------- 定数 ---------- */
const SCHOOL = "柏女学園";
const WEEKS = 48;
const MONTHS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
const weekLabel = w => `${MONTHS[Math.floor(w / 4)]}月${(w % 4) + 1}週`;
const termOf = w => w <= 15 ? "1学期" : w <= 35 ? "2学期" : "3学期";
/* 季節（背景・装飾が変わる） */
function seasonOf(w) {
  const m = MONTHS[Math.floor(w / 4)];
  if (m === 4 || m === 5) return { k: "spring", sky: "#cdeeff,#ffe6ef", gr: "#a6dd8c", deco: ["🌸", "🌷", "🦋"], note: "桜がちり、あたらしい葉が のびてきた。" };
  if (m === 6) return { k: "tsuyu", sky: "#bcd4e6,#dde9f0", gr: "#7ecb7e", deco: ["☔", "🐌", "💧"], note: "つゆ空。しっとりした 空気。" };
  if (m === 7 || m === 8) return { k: "summer", sky: "#8fd8ff,#dff3ff", gr: "#63bf63", deco: ["🌻", "🌞", "🍉"], note: "せみの声が ひびいている。" };
  if (m === 9 || m === 10) return { k: "autumn", sky: "#ffe0b8,#fff2dd", gr: "#c9b06a", deco: ["🍁", "🍂", "🌰"], note: "空が高い。ふうっと 風がすずしい。" };
  if (m === 11) return { k: "lateautumn", sky: "#f5d6c0,#fdeee4", gr: "#c79a5e", deco: ["🍂", "🍁", "🦌"], note: "木々が いろづいて 落ち葉の 道になった。" };
  if (m === 12 || m === 1 || m === 2) return { k: "winter", sky: "#d8ecff,#f2f8ff", gr: "#dfe8e2", deco: ["❄️", "⛄", "🧣"], note: "はく息が 白い。" };
  return { k: "spring2", sky: "#ffe0ec,#fff2f6", gr: "#b6e09a", deco: ["🌸", "🌱", "🐦"], note: "また 桜が さきはじめた。" };
}
/* テスト1週間前は 部活動停止（本物の中学と同じ） */
const TEST_WEEKS = [6, 12, 28, 31, 44];
const isNoClub = w => TEST_WEEKS.includes(w + 1);

const CHARS = {
  sakura: { name: "さくら", em: "🌸", img: "assets/sakura.png", role: "幼なじみ・いつも元気", col: "#ff9ab5", like: "kanji",
    hello: ["おはよ〜！ 今日もいっしょに がんばろ！", "ねえねえ、放課後ひま？", "その調子その調子〜！"] },
  miyabi: { name: "みやび", em: "📘", img: "assets/miyabi.png", role: "学年1位のライバル", col: "#8fb8f0", like: "goi",
    hello: ["……ふん。まあ、せいぜい がんばりなさい。", "わたしに 追いつけるかしら。", "……その問題、まちがえないでよ。"] },
  kaede: { name: "かえで", em: "🍁", img: "assets/kaede.png", role: "文芸部の部長・先輩", col: "#f5a76c", like: "bukatsu",
    hello: ["おっ、来たね。today も 特訓しよっか！", "ことばはね、心を運ぶ舟なんだよ。", "キミの文章、わたしは好きだな。"] },
  hinata: { name: "ひなた", em: "🎀", img: "assets/hinata.png", role: "後輩・ふわふわ天然", col: "#ffc95e", like: "dokkai",
    hello: ["せんぱぁい！ まってましたぁ〜", "きょうも おしえてください〜！", "せんぱいって すごいです…！"] },
  /* --- 学校の大人・あこがれの先輩 --- */
  tanin: { name: "水野先生", em: "👩‍🏫", img: "assets/tanin.png", role: "1年3組の担任", col: "#b39ddb", npc: true,
    hello: ["宿題、ちゃんと やってきましたか？", "こまったことは いつでも 言ってね。"] },
  komon: { name: "白石先生", em: "📗", img: "assets/komon.png", role: "部活の顧問", col: "#89b98f", npc: true,
    hello: ["部活、たのしんでますか？", "むりは しないようにね。"] },
  kaicho: { name: "ことは先輩", em: "🎗️", img: "assets/kaicho.png", role: "生徒会長・あこがれの先輩", col: "#9575cd",
    hello: ["……あら、あなた。がんばってるわね。", "きみの書く文章、わたし 好きよ。"] },
  /* --- 家族 --- */
  haha: { name: "お母さん", em: "👩", img: "assets/haha.png", role: "家族", col: "#ffab91", family: true,
    hello: ["おかえり！ おやつ あるわよ〜", "むりしてない？"] },
  chichi: { name: "お父さん", em: "👨", img: "assets/chichi.png", role: "家族", col: "#90caf9", family: true,
    hello: ["お、がんばってるな。", "父さんも 応援してるからな。"] },
  minori: { name: "みのり", em: "🎒", img: "assets/minori.png", role: "妹・小学4年生", col: "#ffd54f", family: true,
    hello: ["おねえちゃん、あそぼー！", "ねえねえ、これ おしえて！"] },
};
/* 好感度の対象（友だち＋あこがれの先輩＋家族） */
const CID = ["sakura", "miyabi", "kaede", "hinata"];
const AFF_ALL = ["sakura", "miyabi", "kaede", "hinata", "kaicho", "haha", "chichi", "minori"];

/* ---------- 部活（入部するものを選ぶ） ---------- */
const CLUBS = {
  bungei: { name: "文芸部", em: "🖋️", stat: "hyogen", exp: "h", d: "表現力が のびる",
    cats: ["bungaku", "giongo", "gairai", "goyo"], desc: "小説や詩を書く。ことばで 表現する部。", buddy: "kaede" },
  shinbun: { name: "新聞部", em: "📰", stat: "dokkai", exp: "d", d: "読解力が のびる",
    cats: ["goku", "keigo", "bunpo", "jukugo"], desc: "取材して 記事を書く。読む力が つく部。", buddy: "kaicho" },
  karuta: { name: "かるた部", em: "🎴", stat: "kanji", exp: "k", d: "漢字力が のびる",
    cats: ["kaki", "doon", "dokun", "kana"], desc: "百人一首。反射と 漢字に強くなる部。", buddy: "sakura" },
  hoso: { name: "放送部", em: "🎙️", stat: "goi", exp: "g", d: "語彙力が のびる",
    cats: ["kanyo", "kotowaza", "yoji", "wago"], desc: "朗読とアナウンス。ことばの ひきだしが ふえる部。", buddy: "hinata" },
};

const CMDS = [
  { id: "kanji", em: "✏️", t: "漢字ドリル", d: "漢字力＋", cls: "k", stat: "kanji", exp: "k",
    cats: ["kaki", "doon", "dokun", "yomi"], hp: 14 },
  { id: "goi", em: "📚", t: "図書室", d: "語彙力＋", cls: "g", stat: "goi", exp: "g",
    cats: ["kanyo", "kotowaza", "yoji", "taigi", "ruigi"], hp: 14 },
  { id: "dokkai", em: "🔍", t: "読解ゼミ", d: "読解力＋", cls: "d2", stat: "dokkai", exp: "d",
    cats: ["bunpo", "fukushi", "keigo", "jukugo", "goku", "wago", "goyo"], hp: 16 },
  { id: "bukatsu", em: "🖋️", t: "部活", d: "表現力＋", cls: "b", stat: "hyogen", exp: "h",
    cats: ["bungaku", "giongo", "gairai", "bushu", "sanji", "kana"], hp: 15 },
];
/* 入部した部活を コマンドに 反映する */
function applyClub() {
  const c = CLUBS[G.club] || CLUBS.bungei;
  const cm = CMDS.find(x => x.id === "bukatsu");
  cm.em = c.em; cm.t = c.name; cm.d = c.d; cm.stat = c.stat; cm.exp = c.exp;
  cm.cats = c.cats.concat(["bushu", "sanji"]);
}
const STAT_NAME = { kanji: "漢字力", goi: "語彙力", dokkai: "読解力", hyogen: "表現力" };
const EXP_NAME = { k: "漢字P", g: "語彙P", d: "読解P", h: "表現P" };
const STAT_EXP = { kanji: "k", goi: "g", dokkai: "d", hyogen: "h" };
const MOODS = ["絶不調 😖", "不調 😢", "ふつう 🙂", "好調 😊", "絶好調 🤩"];
const MOOD_MUL = [.65, .85, 1, 1.2, 1.45];

/* ---------- セーブ ---------- */
const DEF = () => ({
  ver: 1, week: 0,
  st: { kanji: 8, goi: 8, dokkai: 8, hyogen: 8 },
  hp: 100, mood: 2,
  exp: { k: 0, g: 0, d: 0, h: 0 },
  aff: { sakura: 0, miyabi: 0, hinata: 0, kaede: 0, kaicho: 0, haha: 20, chichi: 20, minori: 30 },
  club: "bungei",
  evDone: {}, place: {}, lastCmd: "", sameCnt: 0,
  total: 0, correct: 0, bestCombo: 0, tests: [], slump: 0, seen: {},
});
let G = null;
const SAVE_KEY = "kotonohaSave", ALBUM_KEY = "kotonohaAlbum", OPT_KEY = "kotonohaOpt";
const save = () => localStorage.setItem(SAVE_KEY, JSON.stringify(G));
const loadSave = () => { try { return JSON.parse(localStorage.getItem(SAVE_KEY) || "null"); } catch (e) { return null; } };
const getAlbum = () => { try { return JSON.parse(localStorage.getItem(ALBUM_KEY) || "[]"); } catch (e) { return []; } };
const putAlbum = a => localStorage.setItem(ALBUM_KEY, JSON.stringify(a.slice(0, 12)));
let OPT = { mute: false };
try { OPT = Object.assign(OPT, JSON.parse(localStorage.getItem(OPT_KEY) || "{}")); } catch (e) { }
const saveOpt = () => localStorage.setItem(OPT_KEY, JSON.stringify(OPT));

/* ---------- 音 ---------- */
let AC = null;
function beep(f, dur, type = "sine", vol = .13, when = 0) {
  if (OPT.mute) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(vol, AC.currentTime + when);
    g.gain.exponentialRampToValueAtTime(.001, AC.currentTime + when + dur);
    o.connect(g); g.connect(AC.destination);
    o.start(AC.currentTime + when); o.stop(AC.currentTime + when + dur + .05);
  } catch (e) { }
}
const sfx = {
  tap: () => beep(660, .05, "square", .05),
  ok: () => { beep(784, .08); beep(1046, .1, "sine", .12, .06); },
  combo: n => { const b = 700 + Math.min(n, 10) * 45; beep(b, .07); beep(b * 1.5, .1, "sine", .12, .05); },
  ng: () => beep(160, .26, "sawtooth", .1),
  talk: () => beep(560, .03, "triangle", .05),
  up: () => [523, 659, 784, 1046].forEach((f, i) => beep(f, .16, "triangle", .13, i * .08)),
  fanfare: () => [523, 659, 784, 1046, 1318].forEach((f, i) => beep(f, .22, "sine", .14, i * .12)),
  heart: () => { beep(880, .1, "triangle", .12); beep(1174, .18, "triangle", .12, .09); },
};

/* ---------- 汎用 ---------- */
const $ = id => document.getElementById(id);
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[b[i], b[j]] = [b[j], b[i]]; } return b; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const hensachi = () => Math.round(36 + (G.st.kanji + G.st.goi + G.st.dokkai + G.st.hyogen) / 4 * 0.34);
function show(id) { document.querySelectorAll(".scr").forEach(s => s.classList.remove("on")); $("scr-" + id).classList.add("on"); }
function toast(m) { const t = document.createElement("div"); t.className = "toast"; t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 1900); }
/* キャラの見た目：画像があれば画像、なければ絵文字 */
function avHTML(id, full) {
  const c = CHARS[id]; if (!c) return "";
  if (!c.img) return c.em;
  const src = full ? c.img : c.img.replace(".png", "_face.png");
  return `<img class="cav" src="${src}" alt="${c.name}">`;
}
function confetti(n = 34) {
  const e = ["🌸", "🎉", "✨", "⭐️", "💗", "🎊"];
  for (let i = 0; i < n; i++) { const c = document.createElement("div"); c.className = "conf"; c.textContent = pick(e); c.style.left = Math.random() * 100 + "vw"; c.style.animationDuration = (1.6 + Math.random() * 1.7) + "s"; c.style.animationDelay = Math.random() * .5 + "s"; document.body.appendChild(c); setTimeout(() => c.remove(), 4200); }
}
for (let i = 0; i < 9; i++) { const p = document.createElement("div"); p.className = "petal"; p.textContent = "🌸"; p.style.left = Math.random() * 100 + "vw"; p.style.animationDuration = (9 + Math.random() * 9) + "s"; p.style.animationDelay = -Math.random() * 12 + "s"; p.style.fontSize = (10 + Math.random() * 9) + "px"; document.body.appendChild(p); }

/* ---------- 会話 ---------- */
let DL = null;
function say(lines) {
  return new Promise(res => { DL = { lines, i: 0, res }; $("dlg").classList.add("on"); openLine(); });
}
function openLine() {
  const L = DL.lines[DL.i];
  const who = L.who, txt = L.t, ch = L.choices;
  const c = who && CHARS[who];
  $("dlgChar").style.display = c ? "block" : "none";
  if (c) { $("dlgAv").innerHTML = avHTML(who); $("dlgAv").style.borderColor = c.col; }
  $("dlgWho").style.display = c ? "block" : "none";
  if (c) { $("dlgWho").textContent = c.name; $("dlgWho").style.background = c.col; }
  $("dlgChoice").classList.remove("on"); $("dlgChoice").innerHTML = "";
  $("dlgNext").style.display = ch ? "none" : "block";
  const el = $("dlgText"); el.textContent = ""; DL.typing = true; DL.full = txt;
  let j = 0;
  DL.tm = setInterval(() => {
    j++; el.textContent = txt.slice(0, j);
    if (j % 3 === 0) sfx.talk();
    if (j >= txt.length) {
      clearInterval(DL.tm); DL.typing = false;
      if (ch) {
        const box = $("dlgChoice"); box.classList.add("on");
        ch.forEach(o => { const b = document.createElement("button"); b.className = "chbtn"; b.textContent = o.t; b.onclick = ev => { ev.stopPropagation(); sfx.tap(); endDlg(o.v); }; box.appendChild(b); });
      }
    }
  }, 28);
}
function endDlg(v) { clearInterval(DL.tm); $("dlg").classList.remove("on"); const r = DL.res; DL = null; r(v); }
function dlgTap() {
  if (!DL) return;
  if (DL.typing) { clearInterval(DL.tm); $("dlgText").textContent = DL.full; DL.typing = false; if (DL.lines[DL.i].choices) { const box = $("dlgChoice"); box.classList.add("on"); DL.lines[DL.i].choices.forEach(o => { const b = document.createElement("button"); b.className = "chbtn"; b.textContent = o.t; b.onclick = ev => { ev.stopPropagation(); sfx.tap(); endDlg(o.v); }; box.appendChild(b); }); } return; }
  if (DL.lines[DL.i].choices) return;
  DL.i++;
  if (DL.i >= DL.lines.length) endDlg(null); else openLine();
}
$("dlg").addEventListener("pointerdown", e => { e.stopPropagation(); sfx.tap(); dlgTap(); });
const L = (who, t, choices) => ({ who, t, choices });

/* ---------- 画面更新 ---------- */
function capStats() { Object.keys(STAT_NAME).forEach(k => { G.st[k] = clamp(Math.round(G.st[k]), 0, 100); }); }
function renderHud() {
  capStats();
  $("hDate").textContent = weekLabel(G.week);
  $("hHp").style.width = G.hp + "%";
  const bar = $("hHpBar"); bar.className = "hpbar" + (G.hp < 30 ? " dan" : G.hp < 55 ? " low" : "");
  $("hMood").textContent = MOODS[G.mood];
  ["kanji", "goi", "dokkai", "hyogen"].forEach(k => { $("st-" + k).querySelector(".v").textContent = G.st[k]; });
  $("hHensa").textContent = hensachi();
  $("hLeft").textContent = WEEKS - G.week;
  const sc = seenCount(), tot = QUESTIONS.length;
  $("hSeen").textContent = sc + "/" + tot;
  $("hSeenBar").style.width = (sc / tot * 100) + "%";
  const tp = G.exp.k + G.exp.g + G.exp.d + G.exp.h;
  $("tBdg").textContent = tp; $("tBdg").style.display = tp > 0 ? "inline-block" : "none";
  $("btnTrain").classList.toggle("ready", canTrain());
}
const canTrain = () => Object.keys(STAT_NAME).some(st => G.st[st] < 100 && G.exp[STAT_EXP[st]] >= cost(G.st[st]));
const TIPS = [
  "体力が へると 練習の 効果が 下がるよ。ときどき やすもう！",
  "おなじ練習ばかりだと あきちゃう。いろいろ やってみて！",
  "コマンドに 出ている 友だちと 練習すると なかよし度アップ！",
  "けいけんちは「とっくん」で つかって ステータスを上げよう。",
  "テストの点は 4つの ステータスで 決まるよ。",
  "なかよし度が 上がると スペシャルイベントが おきる！",
  "絶好調のときに 練習すると たくさん のびる！",
];
function renderMain() {
  renderHud();
  const cid = pick(CID), c = CHARS[cid];
  $("mainAv").innerHTML = avHTML(cid); $("mainAv").style.borderColor = c.col;
  $("mainNm").textContent = pick(c.hello);
  $("tips").textContent = (isNoClub(G.week) ? "📢 テスト1週間前！ 部活動は 停止中です。"
    : G.week % 3 === 0 ? "🍃 " + seasonOf(G.week).note
      : "💡 " + TIPS[G.week % TIPS.length]);
  // キャラ配置（パワプロ式：毎週ランダムに3人が練習場所に現れる）
  if (!G.place || G.place.w !== G.week) {
    const p = { w: G.week };
    const cmdIds = shuffle(CMDS.map(c2 => c2.id));
    shuffle(CID).slice(0, 3).forEach((id, i) => { p[cmdIds[i]] = id; });
    G.place = p;
  }
  // 季節で 背景と 装飾が かわる
  const se = seasonOf(G.week);
  const bg = document.querySelector("#stage .bg");
  bg.style.background = `linear-gradient(180deg,${se.sky})`;
  document.querySelector("#stage .ground").style.background = se.gr;
  let dc = document.getElementById("seasonDeco");
  if (!dc) { dc = document.createElement("div"); dc.id = "seasonDeco"; document.getElementById("stage").appendChild(dc); }
  dc.innerHTML = se.deco.map((e, i) => `<span style="left:${8 + i * 33}%;animation-delay:${i * .7}s">${e}</span>`).join("");

  const box = $("cmds"); box.innerHTML = "";
  const noClub = isNoClub(G.week);
  CMDS.forEach(cm => {
    const b = document.createElement("button"); b.className = "cmd " + cm.cls;
    const who = G.place[cm.id];
    const blocked = noClub && cm.id === "bukatsu";
    if (blocked) b.classList.add("locked");
    b.innerHTML = `<span class="em">${cm.em}</span><span class="t">${cm.t}</span>`
      + `<span class="d">${blocked ? "テスト前で 部活動停止" : cm.d + "　体力-" + cm.hp}</span>`
      + (who && !blocked ? `<span class="who" style="border-color:${CHARS[who].col}">${avHTML(who)}</span><span class="heart">💗</span>` : "");
    b.onclick = () => {
      sfx.tap();
      if (blocked) { say([L(null, "📢 テスト1週間前なので 部活動は 停止中。\n今週は 勉強に 集中しよう！")]).then(renderMain); return; }
      doStudy(cm);
    };
    box.appendChild(b);
  });
  const rest = document.createElement("button"); rest.className = "cmd rest";
  rest.innerHTML = `<span class="em">🏠</span><span class="t">おうちで すごす</span><span class="d">体力かいふく・家族イベント</span>`;
  rest.onclick = () => { sfx.tap(); doRest(); };
  box.appendChild(rest);
  const play = document.createElement("button"); play.className = "cmd play";
  play.innerHTML = `<span class="em">🍰</span><span class="t">あそぶ</span><span class="d">なかよし度＋ やる気＋</span>`;
  play.onclick = () => { sfx.tap(); doPlay(); };
  box.appendChild(play);
  show("main");
}

/* ---------- コマンド ---------- */
/* ---------- おうちで すごす（家庭パート） ---------- */
const HOME_EV = [
  async () => {
    await say([L("haha", "おかえり〜。ホットケーキ 焼いたのよ、食べる？"), L(null, "お母さんの おやつを 食べた。ほっとする あまさ。")]);
    G.hp = clamp(G.hp + 55, 0, 100); G.mood = clamp(G.mood + 1, 0, 4); G.aff.haha = clamp(G.aff.haha + 8, 0, 100);
  },
  async () => {
    await say([L("chichi", "お、まだ 起きてたのか。"), L("chichi", "……これ、駅前の本屋で 見つけたんだ。読んでみるか？"), L(null, "📕 お父さんが 本を 買ってきてくれた！")]);
    ["k", "g", "d", "h"].forEach(k => G.exp[k] += 16); G.aff.chichi = clamp(G.aff.chichi + 10, 0, 100);
  },
  async () => {
    const r = await say([L("minori", "おねえちゃーん！ この漢字、なんて読むの？"),
    L(null, "妹の みのりが 宿題を 持ってきた。", [{ t: "教えてあげる", v: 1 }, { t: "今は 自分の勉強を…", v: 2 }])]);
    if (r === 1) {
      await say([L(null, "みのりに ことばを 教えてあげた。"), L("minori", "わかった！ おねえちゃん せんせいみたい！"),
      L(null, "人に教えると、自分の 理解も 深まる。")]);
      G.st.dokkai += 2; G.st.hyogen += 2; G.aff.minori = clamp(G.aff.minori + 14, 0, 100); G.mood = clamp(G.mood + 1, 0, 4);
    } else {
      await say([L("minori", "……ちぇ。わかった、じぶんで やる。"), L(null, "少し 集中して 勉強できた。")]);
      ["k", "g", "d", "h"].forEach(k => G.exp[k] += 10); G.aff.minori = clamp(G.aff.minori - 4, 0, 100);
    }
    G.hp = clamp(G.hp + 30, 0, 100);
  },
  async () => {
    await say([L(null, "🍚 today は 家族そろって 夕ごはん。"), L("chichi", "学校は どうだ？"), L("minori", "おねえちゃん、部活で なにしてるの〜？"),
    L("haha", "ふふ、にぎやかね。"), L(null, "なんでもない 夜が、いちばん あたたかい。")]);
    G.hp = 100; G.mood = clamp(G.mood + 1, 0, 4);
    ["haha", "chichi", "minori"].forEach(k => G.aff[k] = clamp(G.aff[k] + 7, 0, 100));
  },
  async () => {
    await say([L(null, "🛁 おふろに ゆっくり つかった。"), L(null, "一日の つかれが とけていく。")]);
    G.hp = clamp(G.hp + 60, 0, 100); G.mood = clamp(G.mood + 1, 0, 4);
  },
];
async function doRest() {
  const heal = 45 + Math.floor(Math.random() * 20);
  G.hp = clamp(G.hp + heal, 0, 100);
  if (Math.random() < .65) { await pick(HOME_EV)(); }
  else { if (G.mood < 4 && Math.random() < .5) G.mood++; await say([L(null, `おうちで ゆっくりした。体力が ${heal} かいふくした！`)]); }
  nextWeek();
}
async function doPlay() {
  const id = pick(CID), c = CHARS[id];
  G.aff[id] = clamp(G.aff[id] + 9, 0, 100);
  G.mood = clamp(G.mood + 1, 0, 4);
  G.hp = clamp(G.hp - 6, 0, 100);
  const spots = ["公園", "駅前のカフェ", "商店街", "学校の中庭", "図書館のとなりのパン屋"];
  await say([
    L(null, `${pick(spots)}で ${c.name}と あそんだ！`),
    L(id, pick(["たのしかったね！ また いこーね！", "こういう時間、だいじだよね。", "ふふ、なんだか 元気でた！", "…べつに、ヒマだっただけよ。"])),
    L(null, `${c.name}との なかよし度が 上がった！　やる気も アップ！`),
  ]);
  sfx.heart();
  nextWeek();
}
async function doStudy(cm) {
  if (G.hp < 12) { await say([L(null, "つかれすぎて 集中できない…。今日は やすんだ方が よさそう。")]); renderMain(); return; }
  await startQuiz(cm, G.place[cm.id], 8, false);
  nextWeek();
}

/* ---------- クイズ ---------- */
let Q = null, QRES = null;
function catPool(cats) { const p = QUESTIONS.filter(q => cats.includes(q.t)); return p.length ? p : QUESTIONS; }
/* 出題アルゴリズム：まだ出していない問題を最優先。
   一巡しきるまで 同じ問題は 二度出さない（＝686問すべてが出る） */
function pickQuestions(pool, n) {
  if (!G.seen) G.seen = {};
  const bucket = {};
  pool.forEach(q => { const c = G.seen[q.id] || 0; (bucket[c] = bucket[c] || []).push(q); });
  const out = [];
  Object.keys(bucket).map(Number).sort((a, b) => a - b).forEach(c => {
    if (out.length >= n) return;
    shuffle(bucket[c]).forEach(q => { if (out.length < n) out.push(q); });
  });
  out.forEach(q => { G.seen[q.id] = (G.seen[q.id] || 0) + 1; });
  saveSeen();
  return shuffle(out);
}
const seenCount = () => G && G.seen ? Object.keys(G.seen).length : 0;
/* 出題履歴は 周回をまたいで 引き継ぐ（何周かで 686問すべてに 出会える） */
const SEEN_KEY = "kotonohaSeen";
const saveSeen = () => { try { localStorage.setItem(SEEN_KEY, JSON.stringify(G.seen)); } catch (e) { } };
const loadSeen = () => { try { return JSON.parse(localStorage.getItem(SEEN_KEY) || "{}"); } catch (e) { return {}; } };
function startQuiz(cm, who, n, isTest) {
  return new Promise(res => {
    QRES = res;
    const pool = isTest ? QUESTIONS : catPool(cm.cats);
    Q = { cm, who, qs: pickQuestions(pool, n), i: 0, ok: 0, combo: 0, best: 0, lock: false, isTest };
    $("qTag").textContent = isTest ? "📝 テスト" : cm.em + " " + cm.t;
    $("qCheer").innerHTML = who ? `<span style="color:${CHARS[who].col}">${CHARS[who].em} ${CHARS[who].name}と いっしょ！</span>` : "";
    const bonus = [];
    if (who) bonus.push("なかま +50%");
    if (G.mood >= 3) bonus.push("好調 +" + Math.round((MOOD_MUL[G.mood] - 1) * 100) + "%");
    if (G.week >= 16 && G.week <= 19) bonus.push("夏合宿 +50%");
    $("qBonus").style.display = bonus.length && !isTest ? "block" : "none";
    $("qBonus").textContent = "🔥 " + bonus.join(" / ");
    show("quiz"); nextQ();
  });
}
function finishQuiz() { const r = QRES; QRES = null; Q = null; if (r) r(); }
function nextQ() {
  const q = Q.qs[Q.i];
  $("qProg").textContent = (Q.i + 1) + "/" + Q.qs.length;
  $("qBar").style.width = (Q.i / Q.qs.length * 100) + "%";
  $("qCat").textContent = q.t ? (CATNAME[q.t] || "") : "";
  $("qText").innerHTML = q.q;
  $("qText").className = "qtext" + (q.q.length > 20 ? " sm" : "");
  const box = $("opts"); box.innerHTML = "";
  shuffle(q.opts).forEach(o => {
    const b = document.createElement("button");
    b.className = "opt" + (o.length <= 2 ? " big" : "");
    b.textContent = o;
    b.onclick = () => ans(b, o, q);
    box.appendChild(b);
  });
}
const CATNAME = { kaki: "漢字の書き", yomi: "漢字の読み", doon: "同じ読みの漢字", dokun: "同訓異字", goku: "説明文の重要語", kanyo: "慣用句", taigi: "対義語", ruigi: "類義語", yoji: "四字熟語", kotowaza: "ことわざ", bunpo: "ことばのきまり", bungaku: "文学史", keigo: "敬語", bushu: "部首", giongo: "擬音語・擬態語", goyo: "ことばの誤り", jukugo: "熟語の組み立て", sanji: "三字熟語", gairai: "外来語", fukushi: "呼応の副詞", wago: "ことばの意味", kana: "かなづかい" };
function ans(btn, chosen, q) {
  if (!Q || Q.lock) return;
  Q.lock = true; G.total++;
  if (chosen === q.a) {
    G.correct++; Q.ok++; Q.combo++; Q.best = Math.max(Q.best, Q.combo);
    G.bestCombo = Math.max(G.bestCombo, Q.combo);
    btn.classList.add("ok");
    if (Q.combo >= 3) { sfx.combo(Q.combo); const c = $("combo"); c.textContent = Q.combo + "れんぞく！ 🔥"; c.classList.remove("on"); void c.offsetWidth; c.classList.add("on"); }
    else sfx.ok();
    setTimeout(() => { Q.lock = false; adv(); }, 270);
  } else {
    Q.combo = 0; sfx.ng(); btn.classList.add("ng");
    [...$("opts").children].forEach(b => { if (b.textContent === q.a) b.classList.add("ok"); });
    setTimeout(() => say([L(null, `おしい！ こたえは「${q.a}」\n${q.h || ""}`)]).then(() => { Q.lock = false; adv(); }), 480);
  }
}
function adv() { Q.i++; if (Q.i >= Q.qs.length) endQuiz(); else nextQ(); }

async function endQuiz() {
  if (Q.isTest) return endTest();
  const cm = Q.cm, who = Q.who;
  let mul = MOOD_MUL[G.mood];
  if (who) mul *= 1.5;
  if (G.week >= 16 && G.week <= 19) mul *= 1.5;
  if (G.slump > 0) mul *= .6;
  if (G.hp < 30) mul *= .7;
  const base = Q.ok * 8 + Q.best * 2;
  const gain = Math.max(1, Math.round(base * mul));
  G.exp[cm.exp] += gain;
  const sub = Math.round(gain * .3);
  ["k", "g", "d", "h"].forEach(k => { if (k !== cm.exp) G.exp[k] += Math.round(sub / 3); });
  G.hp = clamp(G.hp - cm.hp - (Q.ok < 3 ? 5 : 0), 0, 100);
  if (who) { G.aff[who] = clamp(G.aff[who] + 7, 0, 100); }
  // 飽き判定
  if (G.lastCmd === cm.id) { G.sameCnt++; if (G.sameCnt >= 3 && G.mood > 0) { G.mood--; G.sameCnt = 0; } } else { G.lastCmd = cm.id; G.sameCnt = 0; }
  if (G.hp < 22 && G.mood > 0 && Math.random() < .5) G.mood--;
  if (Q.ok === Q.qs.length && G.mood < 4) G.mood++;

  $("rBig").textContent = Q.ok === 5 ? "🎉 かんぺき！" : Q.ok >= 4 ? "✨ いい調子！" : Q.ok >= 2 ? "👍 おつかれさま" : "💦 むずかしかった…";
  $("rScore").textContent = Q.ok + " / " + Q.qs.length;
  $("rSub").innerHTML = `さいこう ${Q.best}れんぞく　体力 -${cm.hp}`;
  let g = `<span class="up">${EXP_NAME[cm.exp]} +${gain}</span>`;
  if (who) g += `<br>💗 ${CHARS[who].name}との なかよし度 +7`;
  if (G.slump > 0) g += `<br>😵 スランプ中… 効果ダウン`;
  if (canTrain()) g += `<br><span style="color:#e0559a">✨「とっくん」で ステータスを 上げられるよ！</span>`;
  $("rGain").innerHTML = g;
  sfx.up(); if (Q.ok === Q.qs.length) confetti(20);
  show("result");
  $("rNext").onclick = () => { sfx.tap(); finishQuiz(); };
}

/* ---------- 週送り ---------- */
async function nextWeek() {
  if (G.slump > 0) G.slump--;
  save();
  // 好感度イベント
  for (const id of CID) { if (await affEvent(id)) { save(); break; } }
  // ランダムイベント
  if (Math.random() < .3) { await randomEvent(); save(); }
  G.week++;
  if (G.week >= WEEKS) { return ending(); }
  G.place = {};
  const f = FIXED[G.week];
  if (f) { await f(); save(); if (G.ended) return; }
  save(); renderMain();
}

/* ---------- 好感度イベント ---------- */
const AFF_EV = {
  sakura: [
    [25, [L("sakura", "ねー、いっしょに 帰らない？"), L("sakura", "…あのさ。あたし、前は 国語ってニガテだったんだ。"), L("sakura", "でも あなたが がんばってるの見てたら、なんかね、あたしも やってみようって 思えたの。"), L("sakura", "だから…ありがと！ これからも よろしくね！"), L(null, "さくらと もっと なかよくなった！　やる気が 上がった！")]],
    [50, [L("sakura", "じゃーん！ おべんとう 作ってきた！"), L("sakura", "たまごやき、ちょっと こげちゃったけど…"), L(null, "ふたりで 中庭で おべんとうを 食べた。"), L("sakura", "こういうの、いいね。ずっと つづけばいいのに。"), L(null, "体力が 全回復した！　絶好調に なった！")]],
    [75, [L("sakura", "ねえ、おぼえてる？ 小学校のとき、漢字テストで あたしが 0点とったの。"), L("sakura", "あのとき あなただけ 笑わないで、いっしょに 練習してくれたよね。"), L("sakura", "…あたし、あのときから ずっと あなたのこと すごいと思ってる。"), L("sakura", "だからさ。ぜったい 一緒に 合格しようね！ 約束！"), L(null, "🌸 さくらの 特訓を 受けた！　漢字力が 大きく上がった！")]],
    [100, [L("sakura", "ここまで来たね。ほんとに すごいよ、あなた。"), L("sakura", "あたしね、あなたの となりに いられて よかった。"), L("sakura", "…これからも、ずっと 友だちだよ！"), L(null, "💗 さくらとの 絆が さいこうに なった！")]],
  ],
  miyabi: [
    [25, [L("miyabi", "……ちょっと。"), L("miyabi", "あなた、最近 成績 上げてきてるでしょう。"), L("miyabi", "わたしは 学年1位を ゆずる気はないの。せいぜい 追いかけてらっしゃい。"), L(null, "みやびを ライバルとして 意識した！　やる気が 上がった！")]],
    [50, [L("miyabi", "……これ。わたしが まとめた ノートよ。"), L("miyabi", "べ、べつに あなたのために 作ったわけじゃないから。よぶんに あっただけ。"), L(null, "みやびの ノートを 借りた！"), L("miyabi", "……ちゃんと 使いなさいよ。読まなかったら 承知しないんだから。"), L(null, "📘 語彙力が 大きく上がった！")]],
    [75, [L("miyabi", "…わたしね、ずっと 1位でいなきゃって 思ってたの。"), L("miyabi", "だれかに 負けたら、わたしには 何も 残らないって。"), L("miyabi", "でも あなたと 競うようになって、勉強が ちょっとだけ たのしくなった。"), L("miyabi", "…ありがとう。って、言わせないでよ、ばか。"), L(null, "🔥 みやびと 高めあった！　全ステータスが 上がった！")]],
    [100, [L("miyabi", "次の テスト、本気で いくわよ。"), L("miyabi", "あなたが 相手じゃないと、つまらないもの。"), L("miyabi", "……ふふ。いいライバルに 会えたわ。"), L(null, "💗 みやびとの 絆が さいこうに なった！")]],
  ],
  kaede: [
    [25, [L("kaede", "よく 部活に 来てくれてるね。ありがとう。"), L("kaede", "文芸部はね、へたでも いいんだ。書きたいって 気持ちが あればね。"), L("kaede", "キミには それが ある。わたしには わかるよ。"), L(null, "かえで先輩に みとめられた！　表現力が 上がった！")]],
    [50, [L("kaede", "きょうは 部誌の 原稿、いっしょに 書こうか。"), L(null, "夕暮れの 部室で、ふたりで ペンを 走らせた。"), L("kaede", "……いい文だ。キミの言葉には、体温が あるんだよ。"), L(null, "🖋️ 表現力が 大きく上がった！")]],
    [75, [L("kaede", "わたしね、来年 卒業なんだ。"), L("kaede", "この部を つづけてくれる人が いるかなって、ずっと 心配してた。"), L("kaede", "でも もう 心配ない。キミが いるから。"), L("kaede", "この部を…ことのはを、たのむね。"), L(null, "🍁 部長の想いを 受けついだ！　読解力と表現力が 大きく上がった！")]],
    [100, [L("kaede", "キミと出会えて、この一年 ほんとに たのしかった。"), L("kaede", "ことばはね、心を運ぶ舟なんだ。"), L("kaede", "キミの舟は もう、どこまでも 行けるよ。"), L(null, "💗 かえで先輩との 絆が さいこうに なった！")]],
  ],
  hinata: [
    [25, [L("hinata", "せんぱぁい！ ここ、わかんないんですけど〜"), L(null, "ひなたに 問題を 教えてあげた。"), L("hinata", "わぁ…！ せんぱい、教えるの じょうずですね！"), L(null, "人に教えると、自分の 理解も 深まる。読解力が 上がった！")]],
    [50, [L("hinata", "せんぱい、これ どうぞ！ クッキー 焼いたんです〜"), L("hinata", "あっ、形は 気にしないでください…！ 味は たぶん だいじょうぶです…！"), L(null, "ひなたの クッキーを 食べた。すこし こげていたけれど、おいしかった。"), L(null, "体力が かいふくして、やる気も 上がった！")]],
    [75, [L("hinata", "せんぱい…わたし、じつは 国語が いちばん キライだったんです。"), L("hinata", "でも せんぱいが たのしそうに 本を読んでるの 見てたら…"), L("hinata", "わたしも、ことばって すてきかもって 思えたんです。"), L("hinata", "せんぱいは わたしの ヒーローです！"), L(null, "🎀 後輩に 慕われている！　全ステータスが 上がった！")]],
    [100, [L("hinata", "せんぱい、来年も…その、いてくれますよね？"), L("hinata", "わたし、せんぱいみたいな 人に なりたいんです。"), L("hinata", "だから…ずっと 見ててくださいね！"), L(null, "💗 ひなたとの 絆が さいこうに なった！")]],
  ],
};
async function affEvent(id) {
  const list = AFF_EV[id];
  for (const [th, lines] of list) {
    const key = id + th;
    if (G.aff[id] >= th && !G.evDone[key]) {
      G.evDone[key] = 1; sfx.heart();
      await say(lines);
      // 効果
      if (th === 25) { G.mood = clamp(G.mood + 1, 0, 4); if (id === "kaede") G.st.hyogen += 3; if (id === "hinata") G.st.dokkai += 3; }
      if (th === 50) {
        if (id === "sakura") { G.hp = 100; G.mood = 4; }
        if (id === "miyabi") G.st.goi += 6;
        if (id === "kaede") G.st.hyogen += 6;
        if (id === "hinata") { G.hp = clamp(G.hp + 45, 0, 100); G.mood = clamp(G.mood + 1, 0, 4); }
      }
      if (th === 75) {
        if (id === "sakura") G.st.kanji += 9;
        else if (id === "miyabi") { ["kanji", "goi", "dokkai", "hyogen"].forEach(k => G.st[k] += 4); }
        else if (id === "kaede") { G.st.dokkai += 6; G.st.hyogen += 6; }
        else { ["kanji", "goi", "dokkai", "hyogen"].forEach(k => G.st[k] += 4); }
        confetti(24);
      }
      if (th === 100) { ["kanji", "goi", "dokkai", "hyogen"].forEach(k => G.st[k] += 3); confetti(30); }
      return true;
    }
  }
  return false;
}

/* ---------- ランダムイベント ---------- */
const RND = [
  async () => {
    const r = await say([L(null, "テスト前だけど、さくらが あそびに さそってきた！"), L("sakura", "ねー、きょうだけ！ ね？", [{ t: "いっしょに あそぶ", v: 1 }, { t: "ごめん、勉強する", v: 2 }])]);
    if (r === 1) { G.aff.sakura = clamp(G.aff.sakura + 12, 0, 100); G.mood = clamp(G.mood + 1, 0, 4); G.hp = clamp(G.hp - 8, 0, 100); await say([L(null, "たくさん わらった！　なかよし度＋　やる気＋")]); }
    else { G.st.kanji += 2; G.mood = clamp(G.mood - 1, 0, 4); await say([L("sakura", "そっか…えらいね。がんばって！"), L(null, "集中して 勉強した。漢字力＋2　でも すこし さみしい…")]); }
  },
  async () => {
    await say([L(null, "図書室で 古い本を 見つけた。"), L(null, "ページの すきまに、だれかの しおりが はさまっていた。"), L(null, "「ことばは、いつか だれかを 助ける」…そう 書いてあった。"), L(null, "✨ なんだか やる気が わいてきた！")]);
    G.mood = clamp(G.mood + 2, 0, 4);
  },
  async () => {
    await say([L(null, "かぜを ひいてしまった…！"), L(null, "😷 体力が 大きく へって、しばらく 調子が 出ない。")]);
    G.hp = clamp(G.hp - 30, 0, 100); G.slump = 2; G.mood = clamp(G.mood - 1, 0, 4);
  },
  async () => {
    const r = await say([L("miyabi", "……ちょっと。この問題、あなた 解ける？"), L("miyabi", "解けたら みとめてあげてもいいけど。", [{ t: "受けて立つ！", v: 1 }, { t: "遠慮しておく", v: 2 }])]);
    if (r === 1) {
      await say([L(null, "みやびの 難問に ちょうせん！")]);
      await startQuiz({ id: "goi", em: "📘", t: "みやびの挑戦状", cats: ["yoji", "kanyo", "kotowaza", "goku"], exp: "g", hp: 8, stat: "goi" }, "miyabi", 3, false);
      G.aff.miyabi = clamp(G.aff.miyabi + 6, 0, 100);
      await say([L("miyabi", "……ふん。まあまあね。")]);
    }
    else { G.aff.miyabi = clamp(G.aff.miyabi - 3, 0, 100); await say([L("miyabi", "……ふん。つまらないの。")]); }
  },
  async () => {
    await say([L("kaede", "きゅうけい、きゅうけい！ おかし 食べよ〜"), L(null, "部室で みんなで おかしを 食べた。体力が かいふく！")]);
    G.hp = clamp(G.hp + 35, 0, 100); CID.forEach(id => G.aff[id] = clamp(G.aff[id] + 3, 0, 100));
  },
  async () => {
    await say([L("hinata", "せんぱい、いっしょに 帰りませんか〜？"), L(null, "帰り道、ひなたと たくさん おしゃべりした。")]);
    G.aff.hinata = clamp(G.aff.hinata + 10, 0, 100); G.mood = clamp(G.mood + 1, 0, 4);
  },
  async () => {
    await say([L(null, "先生に ほめられた！"), L(null, "「最近、ことばの 使い方が よくなったね」"), L(null, "✨ 自信が ついた！　やる気アップ！")]);
    G.mood = 4;
  },
  async () => {
    const r = await say([L(null, "夜おそくまで 勉強する？"), L(null, "でも つかれが たまっている…", [{ t: "がんばる！", v: 1 }, { t: "はやめに ねる", v: 2 }])]);
    if (r === 1) { const g = 18; ["k", "g", "d", "h"].forEach(k => G.exp[k] += Math.round(g / 4)); G.hp = clamp(G.hp - 22, 0, 100); await say([L(null, `けいけんちを 少しずつ もらった！　でも 体力が へった…`)]); }
    else { G.hp = clamp(G.hp + 30, 0, 100); G.mood = clamp(G.mood + 1, 0, 4); await say([L(null, "ぐっすり ねむった。体力が かいふく！")]); }
  },
];
async function randomEvent() { const r = await pick(RND)(); return r; }

/* ---------- 固定イベント ---------- */
function testRank(score) {
  const h = hensachi();
  const rank = Math.max(1, Math.round(200 * (1 - (score / 100) * .93) * (70 - h) / 34));
  return clamp(rank, 1, 200);
}
async function doTest(title, memo) {
  await say([L(null, `📝 ${title}の 日が やってきた！`), L(null, "これまでの 成果を 出しきろう！")]);
  TEST_TITLE = title; TEST_MEMO = memo;
  await startQuiz({ id: "test", em: "📝", t: title, cats: [], exp: "k", hp: 10, stat: "kanji" }, null, 10, true);
}
let TEST_TITLE = "", TEST_MEMO = "";
async function endTest() {
  const base = Q.ok * 8;
  const bonus = Math.round((G.st.kanji + G.st.goi + G.st.dokkai + G.st.hyogen) / 4 * .2);
  const score = clamp(base + bonus, 0, 100);
  const rank = testRank(score);
  G.tests.push({ t: TEST_TITLE, s: score, r: rank, w: G.week });
  G.hp = clamp(G.hp - 10, 0, 100);
  sfx.fanfare();
  if (score >= 80) { confetti(40); G.mood = 4; } else if (score < 40) { G.mood = clamp(G.mood - 1, 0, 4); }
  $("rBig").textContent = score >= 90 ? "🏆 学年トップクラス！" : score >= 75 ? "🎉 よくできました！" : score >= 55 ? "👍 まずまず！" : "💦 つぎ がんばろう";
  $("rScore").textContent = score + "点";
  $("rSub").innerHTML = `${TEST_TITLE}<br>正解 ${Q.ok}/10　学年 <b>${rank}位</b>／200人`;
  $("rGain").innerHTML = `こくご偏差値 <span class="up">${hensachi()}</span><br>${TEST_MEMO || ""}`;
  show("result");
  $("rNext").onclick = async () => {
    sfx.tap();
    const c = pick(CID);
    if (score >= 75) { G.aff[c] = clamp(G.aff[c] + 6, 0, 100); await say([L(c, pick(["すごーい！ がんばったね！", "……やるじゃない。", "さすがだね！", "せんぱい かっこいい〜！"]))]); }
    else await say([L(c, pick(["つぎ つぎ！ まだ いけるよ！", "……こんなもの？ 期待してるのに。", "だいじょうぶ、これからだよ。", "せんぱい、いっしょに がんばりましょ〜"]))]);
    finishQuiz();
  };
}
/* 通知表（学期末）5段階評定 */
function hyotei() {
  const avg = (G.st.kanji + G.st.goi + G.st.dokkai + G.st.hyogen) / 4;
  return avg >= 78 ? 5 : avg >= 60 ? 4 : avg >= 42 ? 3 : avg >= 25 ? 2 : 1;
}
async function tsuchihyo(term) {
  const h = hyotei(), hs = hensachi();
  const memo = { 5: "たいへん よくできました。ことばへの 感度が すばらしい。", 4: "よくがんばりました。この調子で つづけましょう。", 3: "基礎は 身についています。もう一歩 ふみこもう。", 2: "苦手な分野に くり返し 取り組みましょう。", 1: "まずは 毎日 少しずつ 続けることから。" }[h];
  await say([
    L("tanin", `${term}、おつかれさま。通知表を わたしますね。`),
    L(null, `📋 国語　評定 ${h} ／ 5　（こくご偏差値 ${hs}）`),
    L("tanin", `所見：${memo}`),
  ]);
  // 家に持ち帰る
  await say([
    L("haha", h >= 4 ? "あら〜！ すごいじゃない！ 今日は ごちそうね！" : h >= 3 ? "うん、がんばってるね。お母さん ちゃんと 見てるよ。" : "……だいじょうぶ。あせらなくて いいからね。"),
    L("minori", h >= 4 ? "おねえちゃん すごーい！ わたしも がんばる！" : "おねえちゃん、いっしょに 勉強しよ！"),
  ]);
  ["haha", "minori"].forEach(k => G.aff[k] = clamp(G.aff[k] + 5, 0, 100));
  if (h >= 4) { G.mood = 4; confetti(20); }
}
/* 三者面談（お母さん＋担任＋自分） */
async function sansha() {
  const hs = hensachi();
  await say([
    L(null, "🪑 三者面談の日。となりに お母さんが すわっている。"),
    L("tanin", `${SCHOOL}に入って 3か月。国語は こくご偏差値 ${hs} です。`),
    L("tanin", hs >= 58 ? "ことばへの 感度が とても 育っています。すばらしい。"
      : hs >= 48 ? "少しずつ 力が ついてきています。この調子で。"
        : "基礎の 積み重ねを 大事に していきましょう。"),
    L("haha", "先生、この子 家でも ちゃんと やってるみたいで…"),
  ]);
  const r = await say([L(null, "夏休みの 目標を 言おう。", [
    { t: "苦手を なくしたい", v: 1 }, { t: "友だちと 高めあいたい", v: 2 }, { t: "本を たくさん 読みたい", v: 3 }])]);
  if (r === 1) { ["k", "g", "d", "h"].forEach(k => G.exp[k] += 22); await say([L("tanin", "いいですね。にがてと 向き合うのが いちばん 伸びます。")]); }
  else if (r === 2) { CID.forEach(id => G.aff[id] = clamp(G.aff[id] + 8, 0, 100)); await say([L("tanin", "友だちは 最高の 先生ですよ。")]); }
  else { G.st.dokkai += 3; G.st.hyogen += 3; await say([L("tanin", "読書は ぜんぶの 教科の 土台に なります。")]); }
  G.aff.haha = clamp(G.aff.haha + 10, 0, 100);
  await say([L("haha", "……大きくなったね。お母さん、うれしい。")]);
}
const FIXED = {
  4: async () => {
    await say([L(null, "🎏 ゴールデンウィーク！"), L(null, "しっかり 休んで、体力が 全回復した。")]);
    G.hp = 100; G.mood = clamp(G.mood + 1, 0, 4);
  },
  6: async () => { await doTest("1学期 中間テスト", "はじめての 定期テスト！"); },
  8: async () => {
    await say([L(null, "👚 6月1日、衣がえ。"), L("sakura", "夏服になると、なんだか 気分も かわるよね！")]);
  },
  12: async () => { await doTest("1学期 期末テスト", "1学期の しめくくり！"); },
  14: async () => { await sansha(); },
  15: async () => {
    await say([L(null, "🎋 1学期の 終業式。")]);
    await tsuchihyo("1学期");
  },
  16: async () => {
    await say([L(null, "☀️ 夏休みが はじまった！"), L("kaede", "よーし、夏の강化合宿だ！ この4週間は のびるよ〜！"), L(null, "🔥 8月のあいだ、練習の 効果が 1.5倍！")]);
    G.hp = 100;
  },
  20: async () => { await say([L(null, "🌻 2学期の 始業式。ひとまわり 成長した気がする。")]); },
  22: async () => {
    const r = await say([L(null, "🏃 体育祭！ あなたは 何に 出る？", [{ t: "リレーの アンカー", v: 1 }, { t: "応援団", v: 2 }, { t: "記録係（本を読む）", v: 3 }])]);
    if (r === 1) { CID.forEach(id => G.aff[id] = clamp(G.aff[id] + 8, 0, 100)); G.hp = clamp(G.hp - 25, 0, 100); G.mood = 4; await say([L(null, "全力で 走りぬいた！ クラスが もりあがった！"), L(null, "💗 みんなとの なかよし度が 上がった！ でも つかれた…")]); }
    else if (r === 2) { G.mood = 4; G.st.hyogen += 3; await say([L(null, "声を からして 応援した！"), L(null, "🖋️ 表現力＋3　やる気が 最高に！")]); }
    else { ["k", "g", "d", "h"].forEach(k => G.exp[k] += 20); await say([L(null, "すみっこで 本を 読んでいた…"), L(null, "✨ けいけんちを もらった（でも すこし さみしい）")]); }
  },
  24: async () => { await say([L(null, "🧥 10月1日、衣がえ。"), L("miyabi", "……冬服のほうが、わたしは 好きよ。")]); },
  26: async () => {
    const r = await say([L(null, `🎪 柏女祭（文化祭）の 季節！ ${CLUBS[G.club].name}も 出しものを 作ることに なった。`),
    L("kaede", "キミには 表紙の ことばを たのみたいな。どうする？", [{ t: "全力で 書く！", v: 1 }, { t: "みんなで 考える", v: 2 }])]);
    if (r === 1) { G.st.hyogen += 7; G.hp = clamp(G.hp - 18, 0, 100); await say([L(null, "夜おそくまで ことばを えらんだ。"), L("kaede", "……すごい。これ、キミにしか 書けない ことばだよ。"), L(null, "🖋️ 表現力が 大きく上がった！")]); }
    else { CID.forEach(id => G.aff[id] = clamp(G.aff[id] + 10, 0, 100)); await say([L(null, "みんなで 意見を 出しあった。"), L("sakura", "こういうの たのしいね！"), L(null, "💗 みんなとの なかよし度が 上がった！")]); }
    await say([
      L(null, "🎪 柏女祭 当日 —"),
      L(null, `${CLUBS[G.club].name}の 出しものには、たくさんの人が 来てくれた。`),
      L("kaicho", "……ちょっと いいかしら。"),
      L("kaicho", "あなたたちの 出しもの、見せてもらったわ。"),
      L("kaicho", "ことばを だいじに してるのが 伝わってきた。……いいものね。"),
      L(null, "🎗️ 生徒会長の ことは先輩に みとめられた！"),
      L(null, "ことばが だれかに とどく。その うれしさを 知った。"),
    ]);
    G.aff.kaicho = clamp(G.aff.kaicho + 20, 0, 100);
    G.mood = 4; confetti(40);
  },
  31: async () => { await doTest("2学期 期末テスト", "後半戦の 手ごたえは？"); },
  35: async () => {
    await say([L(null, "🎄 2学期の 終業式、そして クリスマス。")]);
    await tsuchihyo("2学期");
    await say([L(null, "みんなから メッセージカードが とどいた。"), L("sakura", "メリークリスマス！ 来年も よろしくね！"), L("miyabi", "……ま、まあ、よい年を。"), L("kaede", "よいお年を！ 冬休みも ちゃんと 休むんだよ。"), L("hinata", "せんぱい、だいすきです〜！")]);
    CID.forEach(id => G.aff[id] = clamp(G.aff[id] + 6, 0, 100)); G.hp = 100; G.mood = 4;
  },
  36: async () => {
    const r = await say([L(null, "⛩️ 3学期のはじめに、初詣。何を おねがいする？", [{ t: "成績が 上がりますように", v: 1 }, { t: "みんなと ずっと 友だちで", v: 2 }])]);
    if (r === 1) { ["k", "g", "d", "h"].forEach(k => G.exp[k] += 25); await say([L(null, "✨ やる気に 火が ついた！　けいけんちを もらった！")]); }
    else { CID.forEach(id => G.aff[id] = clamp(G.aff[id] + 12, 0, 100)); await say([L(null, "💗 みんなとの なかよし度が 上がった！")]); }
  },
  41: async () => {
    await say([L(null, "🍫 バレンタイン。"), L("sakura", "はい、友チョコ！ いつも ありがとね。"), L("hinata", "せんぱいにも どうぞ〜！"), L("kaede", "ふふ、日ごろの 感謝をこめて。"), L("miyabi", "……はい。べつに 特別な 意味は ないから。"), L(null, "💗 みんなから 気持ちを もらった！　絶好調に なった！")]);
    G.mood = 4; G.hp = 100; CID.forEach(id => G.aff[id] = clamp(G.aff[id] + 8, 0, 100));
  },
  44: async () => { await doTest("学年末テスト", "1年間の 集大成！"); },
  46: async () => {
    await say([
      L(null, "🌸 3月。卒業式の日。"),
      L(null, "かえで先輩が、3年間を おえて 学校を 去っていく。"),
      L("kaede", "……なんだか、あっという間だったな。"),
      L("kaede", "この部室で キミと 話した時間、ぜんぶ おぼえてるよ。"),
      L("kaede", "文芸部、たのむね。……いってきます。"),
      L(null, "先輩の うしろ姿が、桜のむこうに 小さくなっていった。"),
    ]);
    G.aff.kaede = clamp(G.aff.kaede + 15, 0, 100);
    G.st.hyogen += 4; G.st.dokkai += 4;
  },
  47: async () => { await tsuchihyo("学年末"); await ending(); },
};

/* ---------- とっくん ---------- */
const cost = v => 5 + Math.floor(v / 8) * 4;
// おまかせ特訓：買えるだけ 安いものから 自動で上げる
function autoTrain() {
  let n = 0;
  for (let i = 0; i < 400; i++) {
    const cand = Object.keys(STAT_NAME)
      .filter(st => G.st[st] < 100 && G.exp[STAT_EXP[st]] >= cost(G.st[st]))
      .sort((a, b) => cost(G.st[a]) - cost(G.st[b]));
    if (!cand.length) break;
    const st = cand[0];
    G.exp[STAT_EXP[st]] -= cost(G.st[st]); G.st[st]++; n++;
  }
  return n;
}
function renderTrain() {
  $("ptBox").innerHTML = ["k", "g", "d", "h"].map(k => `<div class="pt"><div class="n">${EXP_NAME[k]}</div><div class="v">${G.exp[k]}</div></div>`).join("");
  const auto = $("btnAuto");
  auto.disabled = !canTrain();
  auto.onclick = () => { const n = autoTrain(); if (n) { sfx.up(); confetti(14); toast("✨ ステータスが 合計 " + n + " 上がった！"); save(); renderTrain(); renderHud(); } };
  const box = $("trainRows"); box.innerHTML = "";
  Object.keys(STAT_NAME).forEach(st => {
    const e = STAT_EXP[st], c = cost(G.st[st]), can = G.exp[e] >= c && G.st[st] < 100;
    const row = document.createElement("div"); row.className = "trow";
    row.innerHTML = `<span class="em">${{ kanji: "✏️", goi: "📚", dokkai: "🔍", hyogen: "🖋️" }[st]}</span>
      <div class="info"><div class="nm">${STAT_NAME[st]} <span style="color:#a4909b;font-size:11px">${G.st[st]}/100</span></div>
      <div class="bar"><i style="width:${G.st[st]}%;background:linear-gradient(90deg,#ff9ab5,#ffb85e)"></i></div></div>
      <div class="cost">${EXP_NAME[e]}<br>${c}</div>`;
    const b = document.createElement("button"); b.className = "tbtn2"; b.textContent = "+1"; b.disabled = !can;
    b.onclick = () => { if (G.exp[e] < c || G.st[st] >= 100) return; G.exp[e] -= c; G.st[st]++; sfx.up(); save(); renderTrain(); renderHud(); const el = $("st-" + st); el.classList.remove("up"); void el.offsetWidth; el.classList.add("up"); };
    row.appendChild(b); box.appendChild(row);
  });
}
function renderFriends() {
  const box = $("friendRows"); box.innerHTML = "";
  const c0 = CLUBS[G.club] || CLUBS.bungei;
  const head = document.createElement("div");
  head.className = "trow";
  head.innerHTML = `<span class="em">${c0.em}</span><div class="info"><div class="nm">${c0.name}（入部中）</div>
    <div style="font-size:10px;color:#a4909b;font-weight:700">${c0.desc}</div></div>`;
  box.appendChild(head);
  const sect = (t) => { const d = document.createElement("div"); d.style.cssText = "font-size:11px;font-weight:800;color:#a4909b;margin:10px 0 4px"; d.textContent = t; box.appendChild(d); };
  sect("👭 ともだち");
  AFF_ALL.forEach(id => {
    if (id === "kaicho") sect("🎗️ あこがれの先輩");
    if (id === "haha") sect("🏠 家族");
    const c = CHARS[id], a = G.aff[id];
    const lv = a >= 100 ? "💗 さいこうの なかま！" : a >= 75 ? "💖 とても なかよし" : a >= 50 ? "💕 なかよし" : a >= 25 ? "🙂 ともだち" : "🤝 クラスメイト";
    const row = document.createElement("div"); row.className = "frow";
    row.innerHTML = `<div class="av" style="border-color:${c.col}">${avHTML(id)}</div>
      <div class="info"><div class="nm">${c.name}</div><div class="rl">${c.role}</div>
      <div class="hb"><i style="width:${a}%"></i></div><div class="lv">${lv}　${a}/100</div></div>`;
    box.appendChild(row);
  });
}

/* ---------- エンディング ---------- */
function rankOf(h) {
  if (h >= 66) return ["S", "ことばの申し子", "#ff6f92"];
  if (h >= 60) return ["A", "国語の達人", "#f5a76c"];
  if (h >= 54) return ["B", "がんばりやさん", "#7fd4b0"];
  if (h >= 48) return ["C", "成長中！", "#8fb8f0"];
  return ["D", "これからだ！", "#a78bd6"];
}
async function ending() {
  G.ended = true; capStats();
  const h = hensachi(), [rk, title, col] = rankOf(h);
  const best = CID.slice().sort((a, b) => G.aff[b] - G.aff[a])[0];
  const bc = CHARS[best];
  await say([L(null, "🌸 3月 — 修了式の日。"), L(null, "1年間が おわろうとしている。")]);
  await say([L(best, {
    sakura: "1年間、ずっと となりで 見てたよ。あなた、ほんとに 強くなった！",
    miyabi: "……この1年、あなたが いたから わたしも 伸びたわ。感謝してあげる。",
    kaede: "キミと過ごした 部室の時間、わたしの たからものだよ。",
    hinata: "せんぱい！ わたし、せんぱいの こと ずっと わすれません！",
  }[best])]);
  await say([L(best, "また 来年も、いっしょに いようね。")]);
  await say([
    L(null, "— その夜、家で。"),
    L("minori", "おねえちゃん、1年生 おわったんだね！"),
    L("haha", "がんばったね。ほんとうに。"),
    L("chichi", "……父さん、ちょっと 泣きそうだ。"),
    L(null, "家族が、ずっと 見ていてくれた。"),
  ]);
  if (h >= 60) await say([L(null, "✨ あなたの こくご偏差値は " + h + "。"), L(null, "1年前の 自分が 見たら、きっと おどろくだろう。")]);
  else await say([L(null, "あなたの こくご偏差値は " + h + "。"), L(null, "まだ 途中。でも たしかに 前に 進んでいる。")]);
  sfx.fanfare(); confetti(70);
  const acc = G.total ? Math.round(G.correct / G.total * 100) : 0;
  const bestTest = G.tests.length ? Math.max(...G.tests.map(t => t.s)) : 0;
  const rec = {
    d: new Date().toLocaleDateString("ja-JP"), h, rk, title, best: bc.name, bestEm: bc.em,
    st: { ...G.st }, total: G.total, acc, bestTest, combo: G.bestCombo,
  };
  const al = getAlbum(); al.unshift(rec); putAlbum(al);
  localStorage.removeItem(SAVE_KEY);
  $("endWrap").innerHTML = `
    <div style="text-align:center;color:#fff;font-size:22px;font-weight:800;margin:16px 0 10px;text-shadow:0 2px 0 #ff7ba3">
      🌸 ENDING 🌸</div>
    <div class="card">
      <h2>${SCHOOL} 修了証</h2>
      <div class="rank" style="color:${col}">${rk}</div>
      <div class="title" style="background:${col}">${title}</div>
      <table>
        <tr><td>こくご偏差値</td><td>${h}</td></tr>
        <tr><td>✏️ 漢字力</td><td>${G.st.kanji}</td></tr>
        <tr><td>📚 語彙力</td><td>${G.st.goi}</td></tr>
        <tr><td>🔍 読解力</td><td>${G.st.dokkai}</td></tr>
        <tr><td>🖋️ 表現力</td><td>${G.st.hyogen}</td></tr>
        <tr><td>といた問題</td><td>${G.total}問（正答率${acc}%）</td></tr>
        <tr><td>さいこう連続</td><td>${G.bestCombo}問</td></tr>
        <tr><td>テスト最高点</td><td>${bestTest}点</td></tr>
        <tr><td>いちばんの なかま</td><td>${bc.em} ${bc.name}</td></tr>
        <tr><td>入部した部活</td><td>${(CLUBS[G.club] || CLUBS.bungei).em} ${(CLUBS[G.club] || CLUBS.bungei).name}</td></tr>
        <tr><td>家族との きずな</td><td>${Math.round((G.aff.haha + G.aff.chichi + G.aff.minori) / 3)} / 100</td></tr>
      </table>
      <div class="memo">${{
      sakura: "さくらとは、これからも ずっと 一緒に 走っていく。",
      miyabi: "みやびという ライバルが いたから、ここまで来られた。",
      kaede: "かえで先輩から 受けついだ ことのはを、次へ つないでいく。",
      hinata: "ひなたの あこがれる せんぱいで いつづけよう。",
    }[best]}<br>1年間、おつかれさま。この物語は アルバムに 保存されました。</div>
    </div>
    <button class="tbtn" id="endBack" style="width:100%;max-width:320px;margin:14px auto 24px;display:block">タイトルへ ▶</button>`;
  show("ending");
  $("endBack").onclick = () => { sfx.tap(); show("title"); };
}

/* ---------- アルバム ---------- */
function renderAlbum() {
  const al = getAlbum(), box = $("albumBox");
  if (!al.length) { box.innerHTML = `<p style="text-align:center;font-size:12px;color:#a4909b;font-weight:700;line-height:1.9">まだ 記録が ないよ。<br>1年間を やりきると ここに 残るよ！</p>`; return; }
  box.innerHTML = al.map(r => {
    const col = rankOf(r.h)[2];
    return `<div class="trow" style="align-items:flex-start">
      <span class="em" style="color:${col};font-weight:800;font-size:26px">${r.rk}</span>
      <div class="info"><div class="nm">${r.title}　<span style="font-size:11px;color:#a4909b">偏差値${r.h}</span></div>
      <div style="font-size:11px;color:#7a6a74;font-weight:700;line-height:1.7">
        ${r.bestEm} ${r.best}と いちばん なかよし<br>
        ${r.total}問クリア／正答率${r.acc}%／テスト最高${r.bestTest}点<br>
        <span style="color:#b8a5b0">${r.d}</span></div></div></div>`;
  }).join("");
}

/* ---------- 入部する部活を えらぶ ---------- */
async function chooseClub() {
  const ids = Object.keys(CLUBS);
  const v = await say([L("komon", "どの部に する？", ids.map((k, i) => ({ t: `${CLUBS[k].em} ${CLUBS[k].name}（${CLUBS[k].d}）`, v: i })))]);
  const id = ids[v == null ? 0 : v];
  G.club = id; applyClub(); save();
  const c = CLUBS[id], bud = CHARS[c.buddy];
  await say([
    L("komon", `${c.name}ね。いい選択だと 思うわ。`),
    L(null, `📌 ${c.desc}`),
    L(c.buddy, {
      kaede: "おっ、入ってくれるんだ！ うれしいなあ。いっしょに 書こうね。",
      kaicho: "……あら。あなた、見どころ あるじゃない。きたえてあげる。",
      sakura: "えっ、いっしょの部！？ やった〜！ ぜったい たのしいよ！",
      hinata: "せんぱいと 同じ部だぁ〜！ うれしいです〜！",
    }[c.buddy]),
    L(null, `🎽 ${c.name}に 入部した！（${bud.name}と 同じ部）`),
  ]);
  G.aff[c.buddy] = clamp(G.aff[c.buddy] + 10, 0, 100);
}

/* ---------- 起動 ---------- */
$("btnNew").onclick = async () => {
  sfx.tap();
  if (loadSave() && !confirm("とちゅうの データが あります。消して はじめますか？")) return;
  G = DEF(); G.seen = loadSeen(); save();
  await say([
    L(null, `🌸 4月。あなたは ${SCHOOL}に 入学した。`),
    L(null, "校門の 桜が、ひらひらと 舞っている。"),
    L("sakura", "おーい！ こっちこっち〜！"),
    L("sakura", "同じクラスだね！ よろしくね！"),
    L("tanin", "1年3組の 担任の 水野です。1年間 よろしくね。"),
    L("tanin", "1年後、みんなは どんな自分に なっていたい？"),
    L(null, "— これは、あなたの 1年間の 物語。"),
    L(null, "放課後。部活動の 見学に 来た。"),
    L("komon", "あら、いらっしゃい。どの部に 入るか 決めた？"),
  ]);
  await chooseClub();
  await say([L(null, `こうして、${SCHOOL}での 1年が はじまった。`)]);
  const f = FIXED[0]; if (f) await f();
  renderMain();
};
$("btnCont").onclick = () => {
  sfx.tap();
  const s = loadSave();
  if (!s) { toast("セーブデータが ないよ"); return; }
  G = Object.assign(DEF(), s);
  G.place = {};
  renderMain();
};
$("btnAlbum").onclick = () => { sfx.tap(); renderAlbum(); show("album"); };
$("btnTrain").onclick = () => { sfx.tap(); renderTrain(); show("train"); };
$("btnFriends").onclick = () => { sfx.tap(); renderFriends(); show("friends"); };
$("btnSave").onclick = () => { sfx.tap(); save(); toast("💾 セーブしました！"); };
document.querySelectorAll("[data-back]").forEach(b => b.onclick = () => { sfx.tap(); const t = b.dataset.back; if (t === "main") renderMain(); else show(t); });
$("muteBtn").onclick = () => { OPT.mute = !OPT.mute; saveOpt(); $("muteBtn").textContent = OPT.mute ? "🔇" : "🔊"; };
$("muteBtn").textContent = OPT.mute ? "🔇" : "🔊";
if (!loadSave()) $("btnCont").style.opacity = ".45";
