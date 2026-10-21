# Redesign de UX — Harpa Cristã — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the app to the approved spec:
- bottom tabs (Hinos / Minhas listas / Ajustes);
- light, dark and system themes;
- accent-insensitive search that also looks inside the lyrics;
- recently opened hymns;
- a reading screen with the chorus highlighted, A−/A+, previous/next and keep-awake;
- user-created lists, with migration of the old favorites;
- the new "D" icon.

**Architecture:**
- Pure logic lives in small, unit-tested modules: `src/utils`, plus the pure helpers in `src/services`.
- Two React contexts hold app state: `SettingsContext` (settings + theme colors) and `ListsContext` (lists + actions that persist). Screens only read from them.
- Navigation is a native stack whose first screen is a bottom-tab navigator.

**Tech Stack:** Expo SDK 54, React Native 0.81, JavaScript, React Navigation 7 (native-stack + bottom-tabs), AsyncStorage, expo-keep-awake, @expo/vector-icons, jest-expo for tests.

**Spec:** `docs/superpowers/specs/2026-10-21-redesign-ux-design.md`

## Global Constraints

- All UI copy is in pt-BR.
- Icons come from `@expo/vector-icons` (Ionicons). No emoji used as icons.
- New native libraries are installed with `npx expo install`.
- Do not change the package name `com.eduardosilva184.harpacrista`, the `extra.eas.projectId`, or `android.blockedPermissions` in `app.json`.
- No network, analytics or ads. The app stays offline.
- Light palette: bg `#F8F5F0`, card `#FFFFFF`, text `#2C1810`, muted `#8B7355`, accent `#A0522D`, chip `#F1EAE0`, line `#E8DCC8`.
- Dark palette: bg `#17120F`, card `#231C17`, text `#EFE6DA`, muted `#A8977F`, accent `#D9A06B`, chip `#2E251E`, line `#3A2F27`.
- Privacy URL: `https://github.com/eduardo7321/harpa-crista-app/blob/main/PRIVACY.md`.
- Icon buttons get an `accessibilityLabel` and a touch target of at least 44×44 (use `hitSlop` where needed).

## Review Focus

1. Corrupt or unexpected JSON in AsyncStorage (`@harpa_lists`, `@harpa_settings`, `@harpa_favorites`) → fall back to defaults, never crash on launch.
2. Old favorites with duplicates, or ids that no longer exist → migrated deduplicated and filtered to valid hymn ids. Nothing valid is lost.
3. Search with surrounding spaces, mixed case or accents (`"  GRAÇA "`, `"graca"`) → same results as the clean query. An empty or whitespace-only query → all hymns.
4. Lyrics with an unclosed `**` → the remaining lines are treated as chorus, with no crash and no lost lines.
5. A list name that is empty, whitespace-only or duplicated (case- and accent-insensitive) → rejected with a message. The list is not created or renamed.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/utils/normalize.js` | `normalize(str)` for comparisons that ignore accents and case |
| `src/utils/parseLetra.js` | `parseLetra(letra)` → verse and chorus blocks |
| `src/services/hinoService.js` (modify) | ranked search, and getting the next or previous hymn |
| `src/services/listService.js` | list data model, pure helpers, load and save, migration |
| `src/services/settingsService.js` | settings defaults, load and save |
| `src/services/favoriteService.js` (modify) | keep only the recent-hymns functions; the favorites functions move into lists |
| `src/theme/colors.js` | the two palettes and the list color palette |
| `src/context/SettingsContext.js` | `SettingsProvider`, `useSettings()`, `useTheme()` |
| `src/context/ListsContext.js` | `ListsProvider`, `useLists()` |
| `src/navigation/AppNavigator.js` | tabs + stack |
| `src/components/HinoRow.js` | a row in a hymn list |
| `src/components/SaveToListSheet.js` | the "Salvar em…" sheet |
| `src/components/ListFormModal.js` | create or edit a list (name + color) |
| `src/screens/HomeScreen.js` (rewrite) | Hinos tab |
| `src/screens/HinoDetailScreen.js` (rewrite) | reading screen |
| `src/screens/ListasScreen.js` | Minhas listas tab |
| `src/screens/ListaDetailScreen.js` | the hymns of one list |
| `src/screens/AjustesScreen.js` | Ajustes tab |
| `src/screens/FavoritosScreen.js` | **delete** |
| `scripts/gerar-icones.sh` | rasterize the icon from SVG |
| `__tests__/*.test.js` | unit tests |

---

### Task 1: Commit the store-prep work and set up tests

**Files:**
- Modify: `package.json` (add a `"test": "jest"` script and `"jest": {"preset": "jest-expo"}`)
- Create: `__tests__/normalize.test.js`, `src/utils/normalize.js`

**Interfaces:**
- Produces: `normalize(str: string | null | undefined): string`. It applies NFD, removes combining marks, lowercases, trims and collapses inner whitespace to a single space. `null` or `undefined` returns `''`.

- [ ] **Step 1:** Commit the pending working-tree changes as they are: `git add -A && git commit -m "chore: prepara projeto para Play Store"`. These are the app.json, eas.json, assets, screens and PRIVACY.md changes, plus `docs/`.
- [ ] **Step 2:** Run `npx expo install jest-expo jest -- --save-dev`, then add the script and the preset.
- [ ] **Step 3: Write the failing test**

```js
import { normalize } from '../src/utils/normalize';
test('remove acentos, caixa e espaços extras', () => {
  expect(normalize('  Chuvas de GRAÇA ')).toBe('chuvas de graca');
  expect(normalize('Ó  Desce   Fogo')).toBe('o desce fogo');
  expect(normalize(undefined)).toBe('');
});
```

- [ ] **Step 4:** Run `npm test -- normalize`. Expected: FAIL (module not found).
- [ ] **Step 5:** Implement `normalize`.
- [ ] **Step 6:** Run `npm test -- normalize`. Expected: PASS.
- [ ] **Step 7:** Commit: `git commit -am "test: configura jest-expo e normalize"` (add the new files).

### Task 2: Ranked search and neighboring hymns

**Files:**
- Modify: `src/services/hinoService.js`
- Test: `__tests__/hinoService.test.js`

**Interfaces:**
- Consumes: `normalize`.
- Produces:
  - `getAllHinos(): Hino[]` (unchanged);
  - `getHinoById(id: number): Hino | undefined`;
  - `searchHinos(query: string): Hino[]`;
  - `getHinoVizinho(numero: number, delta: 1 | -1): Hino`, which wraps around: 640 + 1 → 1 and 1 − 1 → 640.
- Ranking in `searchHinos`:
  1. the exact `numero` match, when the normalized query is all digits;
  2. other hymns whose number contains the digits, in numeric order;
  3. matches in the title, in numeric order;
  4. matches only in the lyrics, in numeric order.
- No duplicates. Precompute the normalized title and lyrics once, at module load.

- [ ] **Step 1: Write the failing tests**

```js
import { searchHinos, getHinoVizinho, getAllHinos } from '../src/services/hinoService';
test('número exato vem primeiro', () => {
  const r = searchHinos('15');
  expect(r[0].numero).toBe(15);
  expect(r.slice(1).every(h => String(h.numero).includes('15'))).toBe(true);
});
test('ignora acento e espaços', () => {
  expect(searchHinos('  graca ').map(h => h.numero)).toEqual(searchHinos('GRAÇA').map(h => h.numero));
  expect(searchHinos('graca')[0].titulo).toMatch(/Graça/);
});
test('título antes de letra, sem duplicados', () => {
  const r = searchHinos('consolador');
  const ids = r.map(h => h.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(r.some(h => h.numero === 1)).toBe(true); // "Consolador" aparece só na letra do hino 1
});
test('vazio retorna todos', () => {
  expect(searchHinos('   ').length).toBe(getAllHinos().length);
});
test('vizinho dá a volta', () => {
  expect(getHinoVizinho(640, 1).numero).toBe(1);
  expect(getHinoVizinho(1, -1).numero).toBe(640);
  expect(getHinoVizinho(10, 1).numero).toBe(11);
});
```

- [ ] **Step 2:** Run `npm test -- hinoService`. Expected: FAIL.
- [ ] **Step 3:** Implement the functions.
- [ ] **Step 4:** Run `npm test -- hinoService`. Expected: PASS.
- [ ] **Step 5:** Commit: `feat: busca sem acento, na letra, e hino vizinho`.

### Task 3: Lyrics parser

**Files:**
- Create: `src/utils/parseLetra.js`
- Test: `__tests__/parseLetra.test.js`

**Interfaces:**
- Produces: `parseLetra(letra: string): Array<{tipo: 'estrofe', numero: string | null, linhas: string[]} | {tipo: 'coro', linhas: string[]}>`.
- Rules:
  - trim every line and drop empty lines;
  - a line that is only digits starts a new verse with that `numero`;
  - text between `**` markers is chorus, even across lines, and the markers are removed;
  - an unclosed `**` makes everything after it chorus;
  - lines before the first number go into a verse with `numero: null`.

- [ ] **Step 1: Write the failing tests**

```js
import { parseLetra } from '../src/utils/parseLetra';
import { getHinoById } from '../src/services/hinoService';
test('hino 1: estrofe, coro, estrofe', () => {
  const b = parseLetra(getHinoById(1).letra);
  expect(b[0]).toEqual({ tipo: 'estrofe', numero: '1', linhas: ['Deus prometeu com certeza', 'Chuvas de graça mandar;', 'Ele nos dá fortaleza,', 'E ricas bênçãos sem par'] });
  expect(b[1].tipo).toBe('coro');
  expect(b[1].linhas[0]).toBe('Chuvas de graça,');
  expect(b[1].linhas[3]).toBe('Chuvas do Consolador.');
  expect(b[2].numero).toBe('2');
});
test('** não fechado vira coro até o fim', () => {
  expect(parseLetra('1\nA\n**B\nC')).toEqual([
    { tipo: 'estrofe', numero: '1', linhas: ['A'] },
    { tipo: 'coro', linhas: ['B', 'C'] },
  ]);
});
test('coro na mesma linha', () => {
  expect(parseLetra('**Só coro**')).toEqual([{ tipo: 'coro', linhas: ['Só coro'] }]);
});
test('todos os 640 hinos parseiam sem perder texto', () => {
  const { getAllHinos } = require('../src/services/hinoService');
  for (const h of getAllHinos()) {
    const b = parseLetra(h.letra);
    expect(b.length).toBeGreaterThan(0);
  }
});
```

- [ ] **Step 2:** Run `npm test -- parseLetra`. Expected: FAIL.
- [ ] **Step 3:** Implement `parseLetra`.
- [ ] **Step 4:** Run `npm test -- parseLetra`. Expected: PASS.
- [ ] **Step 5:** Commit: `feat: parser de letra com estrofes e coro`.

### Task 4: List service and migration

**Files:**
- Create: `src/services/listService.js`, `src/theme/colors.js`
- Modify: `src/services/favoriteService.js` (delete `loadFavorites`, `addFavorite`, `removeFavorite` and `isFavorite` if present; keep the recent-hymns functions and the `FAVORITES_KEY` export used by the migration)
- Test: `__tests__/listService.test.js` (mock AsyncStorage with `jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'))`)

**Interfaces:**
- `colors.js` exports:
  - `light` and `dark` palettes `{bg, card, text, muted, accent, chip, line}`, with the values from Global Constraints;
  - `LIST_COLORS`: 6 hex values. Builder chooses them; they must read well on both themes.
- `Lista = { id: string, nome: string, cor: string, hinos: number[], fixa: boolean }`.
- Constants:
  - `LISTS_KEY = '@harpa_lists'`;
  - `FAVORITOS_ID = 'favoritos'`;
  - `LISTAS_SUGERIDAS = ['Pregação', 'Sangue', 'Oração', 'Consagração']`.
- Pure helpers (they return new arrays and never mutate the input):
  - `toggleHino(listas, listaId, hinoId) → Lista[]`;
  - `listasDoHino(listas, hinoId) → Lista[]`;
  - `validarNome(listas, nome, ignorarId?) → string | null`. It returns the error message `'Dê um nome para a lista.'` for an empty name, or `'Já existe uma lista com esse nome.'` for a duplicate (compared with `normalize`).
  - `criarLista(listas, {nome, cor}) → {listas, lista}`. It trims the name, the id is `String(Date.now())` plus a random suffix, `fixa` is false, and it throws `Error(msg)` if `validarNome` fails.
  - `editarLista(listas, id, {nome?, cor?}) → Lista[]`. It throws on an invalid name or if the list is `fixa` and `nome` is being changed.
  - `excluirLista(listas, id) → Lista[]`. A `fixa` list is never removed (no-op).
- Async:
  - `carregarListas(hinoIdsValidos: Set<number>) → Promise<Lista[]>`:
    - if `LISTS_KEY` parses to an array, return it;
    - otherwise build Favoritos from `@harpa_favorites` (deduplicated, filtered by `hinoIdsValidos`, invalid JSON → `[]`) and the 4 suggested lists, empty, with `LIST_COLORS[0..3]`;
    - save the result and return it.
  - `salvarListas(listas) → Promise<void>`.

- [ ] **Step 1: Write the failing tests.** Assert:
  - first load with `@harpa_favorites = '[3,3,1,9999]'` → Favoritos `{id:'favoritos', nome:'Favoritos', fixa:true, hinos:[3,1]}`, followed by the 4 suggested lists in order, all with `hinos: []`;
  - a second load returns what was saved, so a suggested list deleted before the second load does not come back;
  - corrupt JSON in both keys → defaults, no throw;
  - `toggleHino` adds a missing id and removes an existing one;
  - `validarNome(listas, '  ')` returns the empty-name message;
  - `validarNome(listas, 'oracao')` returns the duplicate message;
  - `excluirLista(listas, 'favoritos')` leaves the array unchanged;
  - `editarLista` throws when renaming Favoritos.
- [ ] **Step 2:** Run `npm test -- listService`. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run `npm test -- listService`. Expected: PASS.
- [ ] **Step 5:** Commit: `feat: serviço de listas com migração de favoritos`.

### Task 5: Settings service and the two contexts

**Files:**
- Create: `src/services/settingsService.js`, `src/context/SettingsContext.js`, `src/context/ListsContext.js`
- Test: `__tests__/settingsService.test.js`

**Interfaces:**
- `settingsService` exports:
  - `SETTINGS_KEY = '@harpa_settings'`;
  - `FONT_SIZES = [16, 18, 20, 22, 24, 27, 30]`;
  - `DEFAULT_SETTINGS = { tema: 'sistema', fontSize: 20, fonte: 'serif', manterTelaLigada: true }`;
  - `carregarAjustes() → Promise<Settings>`. It merges the saved values over the defaults, ignores unknown or invalid values (for example `tema: 'roxo'` → `'sistema'`, or a `fontSize` that is not in `FONT_SIZES` → `20`), and returns the defaults on corrupt JSON.
  - `salvarAjustes(settings) → Promise<void>`.
- `SettingsContext`:
  - `<SettingsProvider>` and `useSettings() → { settings, atualizar(partial) }`. `atualizar` merges the change, persists it, and updates the state right away.
  - `useTheme() → { cores, escuro: boolean }`. It resolves `'sistema'` with `useColorScheme()`.
  - While the settings are loading, render nothing.
- `ListsContext`:
  - `<ListsProvider>` and `useLists() → { listas, toggleHino(listaId, hinoId), criar({nome, cor}) → Lista, editar(id, patch), excluir(id), listasDoHino(hinoId), isFavorito(hinoId) }`.
  - Every action applies the pure helper, sets the state and calls `salvarListas`.
  - `criar` and `editar` re-throw validation errors so the UI can show the message.
- `app.json`: set `"userInterfaceStyle": "automatic"` so that `useColorScheme` reports dark mode (`expo-system-ui` is already installed).

- [ ] **Step 1: Write the failing tests.** Assert:
  - defaults when nothing is saved;
  - a round-trip of `{tema:'escuro', fontSize:24}`;
  - an invalid `tema` or `fontSize` falls back to the default;
  - corrupt JSON returns the defaults.
- [ ] **Step 2:** Run `npm test -- settingsService`. Expected: FAIL.
- [ ] **Step 3:** Implement the service, then the two contexts.
- [ ] **Step 4:** Run `npm test`. Expected: all PASS.
- [ ] **Step 5:** Commit: `feat: ajustes e contextos de tema e listas`.

### Task 6: Navigation shell, Hinos tab and HinoRow

**Files:**
- Create: `src/navigation/AppNavigator.js`, `src/components/HinoRow.js`
- Modify: `App.js`, `src/screens/HomeScreen.js` (rewrite)
- Delete: `src/screens/FavoritosScreen.js`

**Interfaces:**
- Install with `npx expo install @react-navigation/bottom-tabs expo-keep-awake`.
- `App.js` nesting: `SafeAreaProvider > SettingsProvider > ListsProvider > ThemedStatusBar + AppNavigator`.
  - The status bar style is `'light'` when `escuro`, otherwise `'dark'`.
  - `NavigationContainer` gets a theme built from `cores` (background and card) so that no white flashes appear in dark mode.
- Stack routes: `Tabs`, then `HinoDetail` with params `{ hinoId: number }`, then `ListaDetail` with params `{ listaId: string }`. The tab screen names are `Hinos`, `Listas` and `Ajustes`.
  - Tab labels: "Hinos", "Minhas listas", "Ajustes".
  - Ionicons: `book-outline`, `bookmarks-outline`, `settings-outline`.
  - All headers are hidden; the screens draw their own.
- `HinoRow({ hino, onPress, salvo, onToggleSalvo })`:
  - shows the number on a chip background, then the title, then a bookmark icon button;
  - the icon is `bookmark` when `salvo`, otherwise `bookmark-outline`, in the accent color;
  - `accessibilityLabel`: "Salvar nos favoritos" or "Remover dos favoritos".
  - `ListaDetail` reuses it later, so `onToggleSalvo` is optional.
- HomeScreen:
  - header "Harpa Cristã" with the subtitle `${n} hinos`;
  - search field with the placeholder "Número, título ou trecho da letra", plus a clear button;
  - the results come from `searchHinos`;
  - the "Abertos recentemente" chips come from `getRecentHinos()` and reload on focus; they are hidden while searching or when there are none;
  - `HinoRow` with `salvo={isFavorito(id)}` and `onToggleSalvo={() => toggleHino(FAVORITOS_ID, id)}`;
  - empty state "Nenhum hino encontrado";
  - `keyboardShouldPersistTaps="handled"`.
- Every screen uses `SafeAreaView` from `react-native-safe-area-context` and colors from `useTheme()`. No hard-coded colors.

- [ ] **Step 1:** Build it.
- [ ] **Step 2:** Run `npm test && npx expo export --platform android --output-dir /tmp/harpa-export`. Expected: tests pass and the bundle builds.
- [ ] **Step 3:** Commit: `feat: navegação por abas e nova tela de hinos`.

### Task 7: Reading screen and the "Salvar em…" sheet

**Files:**
- Modify: `src/screens/HinoDetailScreen.js` (rewrite)
- Create: `src/components/SaveToListSheet.js`, `src/components/ListFormModal.js`

**Interfaces:**
- `ListFormModal({ visible, inicial?: {nome, cor}, titulo: string, onSalvar({nome, cor}), onCancelar })`:
  - a name `TextInput` with autofocus and a row of `LIST_COLORS` swatches;
  - if `onSalvar` throws, the error message appears inline under the field and the modal stays open.
- `SaveToListSheet({ visible, hino, onFechar })`:
  - a bottom-anchored `Modal` (`animationType="slide"`, transparent backdrop, tapping the backdrop closes it);
  - title `Salvar "${hino.titulo}" em…`;
  - one checkbox row per list (Favoritos first), toggled with `toggleHino`;
  - the last row, "+ Criar nova lista", opens `ListFormModal`; on save it creates the list and adds the hymn to it.
- HinoDetailScreen (route param `hinoId`):
  - **Header:**
    - a back button (`chevron-back`, "Voltar");
    - "Hino N" in small muted text, then the title in serif;
    - a bookmark button: filled when `listasDoHino(id).length > 0`; tapping opens the sheet.
  - **Tags:** chips with the names of `listasDoHino` under the header; nothing when there are none.
  - **Lyrics:** render the blocks from `parseLetra`:
    - the verse number is small, bold, letter-spaced and in the accent color;
    - each chorus gets the label "CORO", a 3px left border in the accent color, the chip background and italic text;
    - `fontSize` comes from the settings, with `lineHeight ≈ fontSize * 1.6`;
    - the font family is `Georgia`/`serif` for `'serif'` and the system default for `'sans'`.
  - **Bottom bar:** "‹ Hino {n-1}", then "A−" and "A+" (they step through `FONT_SIZES` and are disabled at the ends), then "Hino {n+1} ›".
    - The neighbors come from `getHinoVizinho`.
    - Moving to a neighbor uses `navigation.setParams({ hinoId })` and scrolls back to the top.
  - **Recents:** call `addToRecent(hinoId)` whenever `hinoId` changes.
  - **Keep-awake:** use `useKeepAwake()` only when `manterTelaLigada`. Render a child component `<KeepAwake />` conditionally, because hooks cannot be called conditionally.

- [ ] **Step 1:** Build it.
- [ ] **Step 2:** Run `npm test && npx expo export --platform android --output-dir /tmp/harpa-export`. Expected: PASS and the bundle builds.
- [ ] **Step 3:** Commit: `feat: nova tela de leitura e salvar em listas`.

### Task 8: Minhas listas and the list detail screen

**Files:**
- Create: `src/screens/ListasScreen.js`, `src/screens/ListaDetailScreen.js`

**Interfaces:**
- Consumes: `useLists`, `ListFormModal`, `HinoRow`, `getHinoById`.
- ListasScreen:
  - a 2-column grid of cards (color dot, name, "N hino(s)");
  - Favoritos comes first, shown as a filled card in the accent color with a `star` icon;
  - the last card is "+ Nova lista" with a dashed border and opens `ListFormModal` with the title "Nova lista".
  - Long-pressing a card that is not fixed opens `Alert.alert(nome, undefined, [Renomear, Mudar cor, Excluir (destructive), Cancelar])`:
    - Renomear and Mudar cor both open `ListFormModal` with the current values;
    - Excluir asks for confirmation with `Excluir a lista "${nome}"? Os hinos não serão apagados.`
  - Long-pressing Favoritos does nothing.
- ListaDetailScreen (param `listaId`):
  - the header shows the list name and the count;
  - hymns are sorted by `numero` and rendered with `HinoRow`, without the bookmark;
  - each row has a trailing `close-circle-outline` button ("Remover da lista"). It removes the hymn immediately and shows a 4-second "Hino removido · Desfazer" bar at the bottom; Desfazer re-adds the hymn.
  - Empty state: "Nenhum hino nesta lista ainda." / "Abra um hino e toque no marcador para salvá-lo aqui."
  - If the list stops existing (it was deleted), call `navigation.goBack()`.

- [ ] **Step 1:** Build it.
- [ ] **Step 2:** Run `npm test && npx expo export --platform android --output-dir /tmp/harpa-export`. Expected: PASS and the bundle builds.
- [ ] **Step 3:** Commit: `feat: tela de listas do usuário`.

### Task 9: Ajustes

**Files:**
- Create: `src/screens/AjustesScreen.js`

**Interfaces:**
- Consumes: `useSettings`, `FONT_SIZES`.
- Sections:
  - **"Aparência":**
    - Tema, as a 3-option segmented control: "Claro", "Escuro", "Seguir o celular";
    - Tipo de letra, as a 2-option segmented control: "Serifada", "Sem serifa".
  - **"Leitura":**
    - "Tamanho da letra" with − and + buttons that step through `FONT_SIZES`, plus a live preview card: "Deus prometeu com certeza / Chuvas de graça mandar;" in the chosen font and size;
    - a `Switch` for "Manter a tela ligada durante a leitura".
  - **"Sobre":**
    - "Versão {Constants.expoConfig.version}", using `expo-constants` (already a dependency of expo);
    - "Política de privacidade", which opens the privacy URL with `Linking.openURL`.
- Segmented buttons use `accessibilityRole="button"` and `accessibilityState={{selected}}`.

- [ ] **Step 1:** Build it.
- [ ] **Step 2:** Run `npm test && npx expo export --platform android --output-dir /tmp/harpa-export`. Expected: PASS and the bundle builds.
- [ ] **Step 3:** Commit: `feat: tela de ajustes`.

### Task 10: New icon, splash and release build

**Files:**
- Create: `scripts/gerar-icones.sh`, `assets/play-store-icon.png`
- Modify: `assets/icon.png`, `assets/adaptive-icon.png`, `assets/splash-icon.png`, `app.json`

**Interfaces:**
- Source: `docs/superpowers/specs/icone/cover.py` and `v_d.svg`. Add an option to `cover.py` that writes the frameless foreground; the frameless layout itself is described in the spec.
- `gerar-icones.sh` uses Inkscape with `--export-text-to-path` and needs the fonts Noto Serif and Noto Music. It generates:
  - `icon.png`: 1024, the full square art (`v_d.svg`);
  - `play-store-icon.png`: 512, the same art;
  - `adaptive-icon.png`: 1024, a transparent background, with "HARPA", the staff with the clef and notes, and "CRISTÃ" all inside a centered 660×660 box, with no frame and no background;
  - `splash-icon.png`: 1024, the same as `adaptive-icon.png`.
- `app.json` changes:
  - `android.adaptiveIcon.backgroundColor` and the `expo-splash-screen` `backgroundColor` both become `"#5E1616"`;
  - the splash `imageWidth` becomes `240`.

- [ ] **Step 1:** Write the script and run it. Check: view `adaptive-icon.png` composited on `#5E1616` and clipped to a circle. All text and the clef must be fully visible, with no clipping.
- [ ] **Step 2:** Run `npx expo-doctor`. Expected: all checks pass.
- [ ] **Step 3:** Build the release APK as before (prebuild in a scratch copy, then `./gradlew assembleRelease`) and copy it to `~/Downloads/HarpaCrista.apk`. Expected: the build succeeds.
- [ ] **Step 4:** Commit: `feat: novo ícone e splash (capa vinho com clave)`.
