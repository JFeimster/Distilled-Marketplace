# Distilled Marketplace starter kit

1. Extract this ZIP to any local temporary directory.
2. Open **PowerShell 7** in the extracted directory.
3. Execute:
   ```powershell
   pwsh -NoProfile -File .\SETUP-DISTILLED-MARKETPLACE.ps1
   ```
4. The script creates `C:\Users\jason\OneDrive\Desktop\Vercel Projects\distilled-marketplace`, copies the master prompt and references, and shallow-clones three sibling repos under `_reference/` when Git is available.
5. Open the new VS Code workspace and paste `CODEX-START.txt` into the **Codex** chat.
6. Codex builds locally and runs checks. Nothing is committed, pushed, or deployed by the setup script or master prompt.

If Git or Node is missing, the setup script prints the blocker; add Git to PATH and rerun. Do not put passwords or unreviewed private provider data into a public repository.

### Reference storage
`_reference/` is ignored by Git. It contains sibling shallow clones, design/code references, taxonomy and source notes. `archive/legacy/` should only be created when there are actual safe-to-share historical packages; don't add placeholder archives.

## Windows one-click setup (updated)

Keep all starter files together and double-click `RUN-MARKETPLACE-SETUP.cmd`, or run it from a Windows command prompt. It launches PowerShell 7 with a process-only execution policy bypass. The setup now targets `C:\Users\jason\OneDrive\Desktop\Moonshine Capital\website build\Distilled-Marketplace`. No GitHub or Vercel project is created.
