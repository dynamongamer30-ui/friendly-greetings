## Goal
Eliminate homepage freezes by removing real-time Firebase listeners on `/Mods` and `/Comments`, replacing them with cached one-time fetches plus user-triggered refresh.

## Changes

### 1. `src/hooks/useDb.ts`
- Replace `useMods` (currently `ref.on('value')` + `useState`/`useEffect`) with a `useQuery` that does `db.ref('/Mods').once('value')`, key `['mods']`, `staleTime: 60_000`, `refetchOnWindowFocus: false`. Returns `{ data, isLoading, isError }` (data defaults to `[]` so consumers iterating `mods` keep working — will adjust `mods ?? []` at call sites if needed).
- Replace `useComments` (real-time) with `useQuery`, key `['comments', modId]`, `once('value')`, `staleTime: 30_000`, `enabled: !!modId`.
- Leave all other hooks (mods CRUD, tutorial, siteMeta, security, DMCA, comment add) untouched.

### 2. `src/hooks/useModeration.ts`
- Replace `useAllComments` with `useQuery` (`['allComments']`, `once('value')`, `staleTime: 30_000`). Keep return shape `{ data, isLoading }` with `data` defaulting to `[]`.
- Leave `useReplies`, mutations, reply hooks untouched (per request — only `useAllComments` is mentioned).

### 3. `src/pages/HomePage.tsx`
- Import `useQueryClient` from `@tanstack/react-query`.
- Add a Refresh button in the controls area (next to/under SearchBar) that calls `queryClient.invalidateQueries({ queryKey: ['mods'] })`. Style to match existing fire/ember theme (small icon button with `RefreshCw` from lucide, ember border, amber hover glow).
- Handle `mods` possibly being `undefined` from `useQuery` initial state (fallback to `[]` in the `useMemo`).

### 4. `src/components/admin/CommentsTab.tsx`
- Import `useQueryClient` and `RefreshCw`.
- Add Refresh button at the top of the tab (above filter tabs) calling `invalidateQueries({ queryKey: ['allComments'] })`. Match existing pill button styling.

## Out of scope
Firebase config, routing, other hooks, styling system, ModsTab admin (still uses `useMods` — will get same fetch behavior automatically), `useReplies`, comment add flow.

## Risk notes
- `useMods` consumers (`HomePage`, `CommentsTab`, `ModsTab`, possibly others) currently destructure `mods` directly. Switching to `useQuery` means `data` is `undefined` until first fetch resolves — will add `?? []` at each call site as needed to prevent runtime errors.
- `useComments` consumers (`CommentSection`, `DownloadPage`) — same `?? []` guard.