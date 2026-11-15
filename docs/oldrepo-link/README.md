# 旧仓互链备料（Phase 5 提交）

本目录是 Phase 4 产出的提交资产，**不随 npm 包发布**（`docs/` 不在 `package.json` 的 `files` 里，npm 也不会无条件收录它），因此 pack 面零 churn。

## 1. 目标仓与落位

- 目标仓库：`pfmiles/install-gsd-dsh`（旧脚本方式的唯一真源，也是 MIG-03 指名要互链的那个仓）。GitHub 地址：https://github.com/pfmiles/install-gsd-dsh
- remote：`git@github.com:pfmiles/install-gsd-dsh.git`
- 观测基准 sha：`41fcc7a`。**`41fcc7a` 是观测时的 HEAD，不是 patch 基准** —— 本目录不提供 `git patch`，也不假定它还能 clean apply。旧仓任何一次提交都会让 sha 漂移，这正是不做 patch 的原因（D-09）。
- 插入位置（**章节锚点，不用行号**）：旧仓 `README.md` 的 `## Quick start` 之前；该标题之上是独占一行的 `---`。章节锚点是语义锚点，插一行不会让它移动；行号则会随旧仓任一次编辑漂移。
- 旧仓 `README.md` 的实测形态（观测时）：23653 B / 314 行 / CJK 字符数 **0**，纯英文单语，没有 `---` 双语分隔。它的章节顺序是 `# install-gsd-dsh` → `## Quick start` → … → `## Uninstall` → `## Troubleshooting` → `## Compatibility` → `## License and credits`。

## 2. 两个片段的角色分工

| 文件 | 角色 |
| ---- | ---- |
| `snippet.en.md` | **唯一会被推送的正式件**。可直接整段粘进旧仓 `README.md` 的 `## Quick start` 之前：纯 `> ` blockquote 裸正文，无标题、无围栏、无说明性文字。 |
| `snippet.zh.md` | **备而不用**。旧仓 README 是纯英文、没有中文落点；Phase 5 若该仓补了中文 README 才用它。文件首行已用 HTML 注释写明这一点。 |
| `pr.md` | PR 描述：第一行 `title: …`，第二行独占一行的 `---`，其后是 body（改了什么 / 为什么 / 回链 / 不改变现有行为）。 |

## 3. 时点与边界（本 phase 只备料）

- 时点：**Phase 5** 才提交与推送（D-08 承 03-D-02）。本 phase 只在本仓 `docs/` 下落文件，不产生任何远端状态变化。
- 边界：不对旧仓做任何写操作 —— 不 `git add`、不 commit、不 push、不改 remote、不建分支。它是独立仓库，改动即对外写入。
- 本机 **SSH 不可用**（`~/.ssh/id_rsa` 不是 `pfmiles` 账号的有效 key，三种 RSA 签名算法都试过）。推它须另走 `gh` 凭据路径：显式 HTTPS URL + `git -c credential.helper= -c credential.helper='!gh auth git-credential' push`；权威远端 sha 用 `gh api repos/pfmiles/install-gsd-dsh/commits/main`，不要信 `origin/main` 跟踪 ref。
- 片段里不写机器路径、不写旧仓行号、不写 `dsh-gsd@<version>` 形态：旧仓一发版或插件一发版，硬编码就过期。

## 4. 只读核对命令（可即刻复验旧仓一字未改）

```bash
git -C ../install-gsd-dsh rev-parse --short HEAD   # 期望 41fcc7a
git -C ../install-gsd-dsh status --porcelain       # 期望为空（工作树干净）
git -C ../install-gsd-dsh remote get-url origin    # 期望 git@github.com:pfmiles/install-gsd-dsh.git
```

## 5. 落盘时的核对（Phase 5 执行前）

1. 旧仓 HEAD 是否仍是 `41fcc7a`。若已更新，只需重读 `## Quick start` 的位置；片段正文不必改（它不含行号、不含版本号）。
2. `snippet.en.md` 与 `pr.md` 里回链的安装命令是否仍与新仓 README 一致（命令措辞若变，两处要同步）。
3. 推送后回填真实 PR 链接，并把本文件的时点说明改成「已提交」。