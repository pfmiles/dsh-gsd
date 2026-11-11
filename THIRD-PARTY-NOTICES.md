# THIRD-PARTY NOTICES — dsh-gsd

本文件记录构建期取源第三方包 `@opengsd/gsd-core` 的 canonical 元数据（SBOM）。
离线 ①/② 档（`GSD_TARBALL` / `.build-cache`）解包前完整性校验、发布合规核对均以此表为准。

| 包名 | 版本 | dist.shasum | dist.integrity | 许可 | 来源 URL |
| ---- | ---- | ----------- | -------------- | ---- | -------- |
| @opengsd/gsd-core | 1.20.1 | d632001e2541e6cccfb740bcad5b2f5c334efabd | sha512-vG3iTEmeImmFFS8CjX69n7F2bxQ3QdssO++DxhaVDa/S2k098DFoGWXkjHbCCOyfQkIIkFt7kDginryDnoPcZQ== | MIT | https://registry.npmjs.org/@opengsd/gsd-core |
| @opengsd/gsd-core | 1.19.0 | 32a6080732b9033f2419739fd86d8ff156a0c8b3 | sha512-3j2ejyDoS4xo0nv9nUwlL8NhgQAEVy4HXsAGdylnEsp2toHTE5AZsDEzZTHv6mpHMtfOyr/vf9ZbdiREyFzvkQ== | MIT | https://registry.npmjs.org/@opengsd/gsd-core |

> 上表值为 canonical registry（registry.npmjs.org）核对，与 npmmirror（registry.npmmirror.com）逐字节一致（1.20.1 行 2026-11-10 核对；1.19.0 行 2026-11-11 核对，矩阵 GSD 轴第二值）。
> 离线 ①/② 档对照协议（T-1-01）：解包前对取源 tgz（`GSD_TARBALL` 或 `.build-cache`，同一校验入口）计算 SHA-512，hex 值须与表中该版本行
> `dist.integrity`（`sha512-…`，base64 解码后取 hex）一致；同时 SHA-1 与该行 `dist.shasum` 逐字一致。
> 任一不符 → `build.mjs` exit 2（`checksum mismatch`），fail-closed。
>
> 审计历史（非当前记录行）：1.16.0 `dist.shasum` `20c034c537010a2e812df7c49586ca831d57ec71`
>（2026-11-10 执行期 blocking-human checkpoint 人类决策将目标版本改为 1.20.1；此行仅作存档）。
