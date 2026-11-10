# THIRD-PARTY NOTICES — dsh-gsd

本文件记录构建期取源第三方包 `@opengsd/gsd-core` 的 canonical 元数据（SBOM）。
离线 ① 档（`GSD_TARBALL`）解包前完整性校验、发布合规核对均以此表为准。

| 包名 | 版本 | dist.shasum | dist.integrity | 许可 | 来源 URL |
| ---- | ---- | ----------- | -------------- | ---- | -------- |
| @opengsd/gsd-core | 1.20.1 | d632001e2541e6cccfb740bcad5b2f5c334efabd | sha512-vG3iTEmeImmFFS8CjX69n7F2bxQ3QdssO++DxhaVDa/S2k098DFoGWXkjHbCCOyfQkIIkFt7kDginryDnoPcZQ== | MIT | https://registry.npmjs.org/@opengsd/gsd-core |

> 上表值为 canonical registry（registry.npmjs.org）2026-11-10 核对，与 npmmirror（registry.npmmirror.com）逐字节一致。
> 离线 ① 档对照协议（T-1-01）：解包前对 `GSD_TARBALL` 计算 SHA-512，hex 值须与表中该版本行
> `dist.integrity`（`sha512-…`，base64 解码后取 hex）一致；同时 SHA-1 与该行 `dist.shasum` 逐字一致。
> 任一不符 → `build.mjs` exit 2（`checksum mismatch`），fail-closed。
>
> 审计历史（非当前记录行）：1.16.0 `dist.shasum` `20c034c537010a2e812df7c49586ca831d57ec71`
>（2026-11-10 执行期 blocking-human checkpoint 人类决策将目标版本改为 1.20.1；此行仅作存档）。
