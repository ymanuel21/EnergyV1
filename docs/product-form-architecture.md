# ProductForm — Architecture Analysis

**Current:** Hybrid — uncontrolled `defaultValue` inputs + `FormData(form)` serialization, with controlled sub-components (images, specs, downloads, relations in React state)
**Context:** 7 tabs, 367 lines, mixed controlled/uncontrolled, recently discovered tab-loss bug

---

## APPROACH A: FormData-based (current, fixed)

Fix tab-loss bug by rendering all tabs always (`display:none` for inactive tabs) so all inputs exist in DOM when FormData is collected.

### Pros
- Zero state management for text/simple fields — name, slug, sku, warranty, weight, description all live in DOM only
- No re-renders on every keystroke (uncontrolled inputs don't trigger React state updates)
- FormData serialization is 5 lines, reads all inputs in one call
- Browser-native validation (`required`, `type="number"`) works without JS
- Dirty tracking: already has `markDirty()` (just sets `dirty=true`) — sufficient for "Unsaved changes" warning
- No migration risk — fix is 1 line change (remove `{activeTab === ... && (` conditional wrappers)

### Cons
- Tab-loss bug: all inputs must always be in DOM (hidden tabs bloat DOM slightly)
- No real-time validation (validate on submit only)
- No autosave compatibility (FormData requires form element access)
- No cross-field validation (e.g., "if brand X, require field Y")
- No edit-undo or edit history
- Mixed architecture: controlled sub-components (images, specs, downloads) coexist awkwardly with uncontrolled inputs
- Harder to test — must test through DOM, not state
- Server-side rendering will always show default values (no optimistic UI)

---

## APPROACH B: Controlled (single product state with useState)

Convert all fields to `useState`:
```ts
const [name, setName] = useState(product.name);
const [slug, setSlug] = useState(product.slug);
// ... 15+ more fields
```

Serialization: `buildPublishData()` reads from state, not FormData.

### Pros
- Single source of truth — every field lives in React state
- No tab-loss bug — state persists regardless of which tab is visible
- Real-time validation possible (validate on change, show inline errors)
- Cross-field validation (e.g., "if type=solar, require wattage spec")
- Autosave-ready — save state on debounced change
- Undo/redo possible (state history stack)
- Compatible with optimistic UI (show updated value immediately, persist in background)
- No conditional rendering requirement — tabs can render from state without DOM bloat
- Easier to test — test state, not DOM queries
- Consistent architecture — controlled sub-components (images, specs) align with controlled text fields

### Cons
- 15+ useState calls (boilerplate)
- Re-renders on every keystroke (mitigated: already happens for the whole form on any state change)
- More code to migrate: 15+ fields need individual onChange handlers
- Risk of introducing new bugs during migration
- Form validation requires custom logic (no native `required` attribute handling)
- State initialization from `product` prop is one-time; live edits from other users not reflected

---

## APPROACH C: Hybrid with useReducer (recommended)

Single `productState` object managed by `useReducer`:
```ts
const [state, dispatch] = useReducer(productReducer, initialState);
dispatch({ type: 'SET_FIELD', field: 'name', value: '...' });
```

### Pros
- All pros of controlled (single source of truth, no tab-loss, autosave-ready, testable)
- Single dispatch function replaces 15+ setState calls (less boilerplate)
- Easier to add undo/redo (reducer maintains history)
- Easy to add cross-field validation in reducer
- Type-safe — reducer actions are typed, state shape is typed
- Scales well — new fields just add to state shape + reducer case
- `buildPublishData()` is one-liner: spread state

### Cons
- Same migration risk as controlled (15+ fields to convert)
- Same re-render cost as controlled
- More abstract than individual useState (team learning curve)

---

## COMPARISON MATRIX

| Aspect | A: FormData | B: Controlled | C: useReducer |
|--------|:-----------:|:-----------:|:-----------:|
| Fixes tab-loss bug | ⚠️ Partial | ✅ | ✅ |
| Performance | ✅ Best | ⚠️ Good | ⚠️ Good |
| Code complexity | ✅ Low | ⚠️ Medium | ⚠️ Medium |
| Maintainability | ⚠️ Mixed | ✅ Good | ✅ Best |
| Dirty tracking | ✅ Simple | ✅ Simple | ✅ + history |
| Autosave ready | ❌ | ✅ | ✅ |
| Real-time validation | ❌ | ✅ | ✅ |
| Cross-field validation | ❌ | ❌ | ✅ |
| Testability | ⚠️ DOM-only | ✅ State | ✅ State |
| Migration effort | ✅ None | ⚠️ Medium | ⚠️ Medium |
| Sub-component alignment | ⚠️ Mixed | ✅ Consistent | ✅ Consistent |
| Future scalability | ❌ | ✅ | ✅ Best |

---

## RECOMMENDATION: **C — useReducer**

**Why not A (FormData fix):**
The tab-loss fix is a one-line change but doesn't solve the fundamental architectural tension — controlled sub-components (images in React state, specs in React state, downloads in React state) coexisting with uncontrolled inputs (name in DOM). This will bite again. Autosave, real-time validation, and undo/redo (likely future needs) all require state.

**Why not B (individual useState):**
15+ fields will produce 15+ `useState` calls, 15+ `onChange` handlers, and 15+ `name={name} value={name}` bindings. Boilerplate burden is high. Harder to add cross-field validation later.

**Why C (useReducer):**
- One state object, one dispatch function
- Already have controlled sub-components (images, specs, downloads, relations) — adding text fields to the same pattern is natural
- Future-proof: autosave (`debounced persist on change`), validation (`validate in reducer`), undo/redo (`history stack in state`)
- Migration path: add fields incrementally (start with Overview tab, then Pricing, then SEO)

**Migration cost estimate:** ~2 hours for reducer + field conversion + testing. Risk: medium (touches 15+ fields).
