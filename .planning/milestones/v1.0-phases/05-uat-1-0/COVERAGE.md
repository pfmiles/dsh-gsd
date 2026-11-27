# API Coverage — 本 phase 无外部 API 集成

> 该文件是 `api-coverage.verify-pre` 门的裁决声明（`05-CONTEXT.md` / `05-RESEARCH.md` 的范围内）。

No external API integration: 本 phase 不把任何外部 API / SDK / 服务**集成进产品**，产品面零改动（`files` 白名单里的 9 项代码树对上一个 CI 验证点零 diff）。它只是用三个**已在用的 CLI** 作为发布与验收工具：`npm`（`publish` / `view` / `pack`）、`gh`（`release create` / `pr create` / `api`）、`dsh`（`plugin add` / `--dump-config` / one-shot 会话）。这些是发布工程的外壳，不是插件对外暴露的能力面，因此没有「能力矩阵」可枚举。

作为交叉核对，对本 phase 的 ROADMAP 段落与四个 PLAN 的正文跑了检测器：

```
$ printf '%s' "<phase scope>" | node gsd-core/bin/lib/api-coverage.cjs --json
{"detected":false,"signals":[],"terms":{...}}     # 非空输入下的真实负例，不是 skipped
```

补充两条可能被误读的事实，写在这里以免下游再猜：

1. `~/.dsh/.credentials.yaml` 里的 `refs.DEEPSEEK_API_KEY` 是 UAT 会话的**运行时凭证**，不是「集成」——它只经子进程环境传递，不落盘、不进 git。
2. `gh api repos/pfmiles/...` 是对 GitHub REST 的**只读取值**（权威远端 sha、CI run 状态、PR 列表），同样不是产品能力面。

如果后续 phase 要把「插件对宿主暴露的 hooks/skills 接口」当作 API 面来枚举，那应当在那时新建一份真正的矩阵；本 phase 不做，也不虚造行。