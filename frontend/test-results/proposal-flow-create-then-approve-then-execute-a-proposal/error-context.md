# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: proposal-flow.spec.ts >> create then approve then execute a proposal
- Location: e2e/proposal-flow.spec.ts:136:1

# Error details

```
Error: page.evaluate: Passed function is not well-serializable!
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - generic [ref=e7]: A
        - generic [ref=e8]: Accord
        - generic [ref=e9]: testnet
      - navigation [ref=e10]:
        - link "dashboard" [ref=e11] [cursor=pointer]:
          - /url: /
        - link "history" [ref=e12] [cursor=pointer]:
          - /url: /history
        - link "owners" [ref=e13] [cursor=pointer]:
          - /url: /owners
        - link "settings" [ref=e14] [cursor=pointer]:
          - /url: /settings
      - button "GDJSB2…C7JD" [ref=e15]
  - main [ref=e16]:
    - generic [ref=e17]: Loading contract data…
```

# Test source

```ts
  171 |           jsonrpc: "2.0",
  172 |           id,
  173 |           result: {
  174 |             entries: [{ key: KEY_B64, xdr: ENTRY_B64, lastModifiedLedgerSeq: 100 }],
  175 |             latestLedger: 1000,
  176 |           },
  177 |         }),
  178 |       });
  179 |     }
  180 | 
  181 |     if (method === "simulateTransaction") {
  182 |       const fn = getFnName(body.params?.transaction ?? "");
  183 |       let retval = VOID_B64;
  184 |       if (fn === "get_threshold") retval = THRESH_B64;
  185 |       else if (fn === "get_owners") retval = ownersXdr();
  186 |       else if (fn === "get_total_proposals") retval = totalXdr(state.total);
  187 |       else if (fn === "get_proposals_paged") retval = proposalsXdr(state.status, state.approvals);
  188 |       else if (fn === "has_approved") retval = hasApprovedXdr(state.hasApproved);
  189 |       return route.fulfill({
  190 |         contentType: "application/json",
  191 |         body: JSON.stringify(simResult(id, retval)),
  192 |       });
  193 |     }
  194 | 
  195 |     if (method === "sendTransaction") {
  196 |       const txBase64 = body.params?.transaction ?? "";
  197 |       lastEnvXdr = txBase64;
  198 |       const fn = getFnName(txBase64);
  199 |       if (fn === "create_proposal") {
  200 |         Object.assign(state, { total: 1, status: "Pending", approvals: 0, hasApproved: false });
  201 |       } else if (fn === "approve") {
  202 |         Object.assign(state, { status: "Ready", approvals: 1, hasApproved: true });
  203 |       } else if (fn === "execute") {
  204 |         Object.assign(state, { status: "Executed" });
  205 |       }
  206 |       return route.fulfill({
  207 |         contentType: "application/json",
  208 |         body: JSON.stringify({
  209 |           jsonrpc: "2.0",
  210 |           id,
  211 |           result: { hash: "mock-tx-hash", status: "PENDING" },
  212 |         }),
  213 |       });
  214 |     }
  215 | 
  216 |     if (method === "getTransaction") {
  217 |       return route.fulfill({
  218 |         contentType: "application/json",
  219 |         body: JSON.stringify({
  220 |           jsonrpc: "2.0",
  221 |           id,
  222 |           result: {
  223 |             status: "SUCCESS",
  224 |             ledger: 1000,
  225 |             createdAt: Math.floor(Date.now() / 1000),
  226 |             envelopeXdr: lastEnvXdr,
  227 |             resultXdr: TX_RESULT_B64,
  228 |             resultMetaXdr: TX_META_B64,
  229 |             latestLedger: 1000,
  230 |             latestLedgerCloseTime: Math.floor(Date.now() / 1000),
  231 |           },
  232 |         }),
  233 |       });
  234 |     }
  235 | 
  236 |     if (method === "getLatestLedger") {
  237 |       return route.fulfill({
  238 |         contentType: "application/json",
  239 |         body: JSON.stringify({
  240 |           jsonrpc: "2.0",
  241 |           id,
  242 |           result: { id: "mock-ledger", sequence: 1000, protocolVersion: "22" },
  243 |         }),
  244 |       });
  245 |     }
  246 | 
  247 |     if (method === "getEvents") {
  248 |       return route.fulfill({
  249 |         contentType: "application/json",
  250 |         body: JSON.stringify({
  251 |           jsonrpc: "2.0",
  252 |           id,
  253 |           result: { events: [], latestLedger: 1000 },
  254 |         }),
  255 |       });
  256 |     }
  257 | 
  258 |     await route.continue();
  259 |   });
  260 | 
  261 |   // Intercept all unhandled promise rejections to surface hidden errors.
  262 |   await page.addInitScript(() => {
  263 |     window.addEventListener("unhandledrejection", (e) => {
  264 |       console.error("[UNHANDLED]", e.reason?.message ?? String(e.reason));
  265 |     });
  266 |   });
  267 | 
  268 |   await page.goto("/");
  269 | 
  270 |   // Verify env vars are set correctly in the browser.
> 271 |   const envCheck = await page.evaluate(() => ({
      |                               ^ Error: page.evaluate: Passed function is not well-serializable!
  272 |     rpc: (import.meta as any).env?.VITE_SOROBAN_RPC_URL,
  273 |     contract: (import.meta as any).env?.VITE_CONTRACT_ADDRESS,
  274 |     passphrase: (import.meta as any).env?.VITE_NETWORK_PASSPHRASE,
  275 |     simSource: (import.meta as any).env?.VITE_SIM_SOURCE,
  276 |   }));
  277 |   console.log("[env]", JSON.stringify(envCheck));
  278 | 
  279 |   // Dashboard renders with empty proposal list once wallet and contract data load.
  280 |   await expect(page.getByRole("heading", { name: "Active Proposals" })).toBeVisible({ timeout: 15_000 });
  281 |   await expect(page.getByText("No active proposals", { exact: true })).toBeVisible({ timeout: 10_000 });
  282 | 
  283 |   // ─── Step 1: Create a proposal ───────────────────────────────────────────
  284 | 
  285 |   await page.getByRole("button", { name: "+ New" }).click();
  286 |   await expect(page.getByText("New Proposal")).toBeVisible();
  287 | 
  288 |   await page.getByPlaceholder("G...").fill(G);
  289 |   await page.getByPlaceholder("0.00").fill("10");
  290 |   await page.getByPlaceholder("What is this payment for?").fill("Test Proposal");
  291 | 
  292 |   // Submit button is disabled until wallet address is resolved.
  293 |   await expect(
  294 |     page.getByRole("button", { name: "Submit Proposal" })
  295 |   ).not.toBeDisabled({ timeout: 10_000 });
  296 |   await page.getByRole("button", { name: "Submit Proposal" }).click();
  297 | 
  298 |   // buildAndSubmit polls getTransaction every 2 s before resolving; allow time.
  299 |   await expect(page.getByText("Test Proposal")).toBeVisible({ timeout: 20_000 });
  300 |   await expect(page.getByRole("button", { name: "Approve" })).toBeVisible({
  301 |     timeout: 5_000,
  302 |   });
  303 | 
  304 |   // ─── Step 2: Approve the proposal ────────────────────────────────────────
  305 | 
  306 |   await page.getByRole("button", { name: "Approve" }).click();
  307 | 
  308 |   // After approve refresh: approvals=1/threshold=1, status→ready → Execute visible.
  309 |   await expect(page.getByText("1/1")).toBeVisible({ timeout: 20_000 });
  310 |   await expect(page.getByRole("button", { name: "Execute" })).toBeVisible({
  311 |     timeout: 5_000,
  312 |   });
  313 | 
  314 |   // ─── Step 3: Execute the proposal ────────────────────────────────────────
  315 | 
  316 |   await page.getByRole("button", { name: "Execute" }).click();
  317 | 
  318 |   // Executed proposals are filtered out of activeProposals → empty state returns.
  319 |   await expect(page.getByText("No active proposals", { exact: true })).toBeVisible({ timeout: 20_000 });
  320 | });
  321 | 
```