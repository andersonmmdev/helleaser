# Helleaser

**Helleaser** is a CLI tool designed to automate the release process for Node.js projects. It leverages your project's `package.json` version, generates version commits and tags, and can optionally perform branch merges.

## Features

- [x] Automated version bumping using `package.json`
- [x] Git integration: version commits
- [x] Optional branch merging after new version
- [x] Custom build command support
- [x] Staging environment support
- [ ] Git integration: tagging
- [ ] Production environment support
- [ ] Changelog generation

## Local install

Generate package with `npm`:

```bash
npm pack
```

Install globally:

```bash
npm install -g helleaser-*.*.*.tgz
```

## Usage

Navigate to your Node.js root directory and run:

```bash
helleaser [options]
```

Or use the shortcut:

```bash
hl [options]
```

Common CLI options include:

| Option                  | Description                                                     |
| ----------------------- | --------------------------------------------------------------- |
| `--merge <branch>`      | Merge changes into the specified branch after new version       |
| `--build <cmd>`         | Custom build command (default: `npm run build`)                 |
| `--staging`, `-s`       | Use staging environment (default: `production`)                 |
| `--skip-version`, `-sv` | Do not bump version in `package.json`, will use current version |
| `--no-tag`, `-nt`       | Do not generate a tag, only push the commit                     |
| `--help`, `-h`          | Display help information                                        |
| `--version`, `-v`       | Display the current version                                     |

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details
