## What changed

<!-- High-level summary of the change -->

## Why

<!-- Link the issue this resolves -->
Fixes # <!-- or Refs # -->

## How to verify

<!-- Commands you ran, steps to reproduce the new behavior, screenshots for UI -->

```bash
# Example
cd contracts/accord && cargo test
```

## Checklist

- [ ] `cargo fmt --check` passes
- [ ] `cargo clippy -- -D warnings` passes
- [ ] `cargo test` passes (if contract changed)
- [ ] `npm run lint && npm run build` passes (if frontend changed)
- [ ] I did not commit `.env` files or private keys
- [ ] I updated docs where relevant

## Risks / follow-ups

<!-- Known limitations, intentional TODOs, or follow-on work -->
