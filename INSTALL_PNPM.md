# Installing pnpm

You need to install pnpm before you can use it. Here are several options:

## Option 1: Using npm (Recommended)

```bash
npm install -g pnpm
```

## Option 2: Using Homebrew (macOS)

```bash
brew install pnpm
```

## Option 3: Using the standalone installer script

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

After running this, you may need to restart your terminal or run:
```bash
source ~/.zshrc
```

## Option 4: Using Corepack (Node.js 16.13+)

If you have Node.js 16.13 or higher, you can use Corepack:

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

## Verify Installation

After installing, verify pnpm is installed:

```bash
pnpm --version
```

## Then Install Project Dependencies

Once pnpm is installed, run:

```bash
pnpm install
```
