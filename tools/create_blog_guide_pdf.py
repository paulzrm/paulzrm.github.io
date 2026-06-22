#!/usr/bin/env python3
"""Create the Chinese Hexo blog usage guide PDF."""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "Hexo博客使用手册.pdf"
FONT = Path(r"C:\Windows\Fonts\msyh.ttc")


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("MicrosoftYaHei", 8)
    canvas.setFillColor(colors.HexColor("#777777"))
    canvas.drawCentredString(A4[0] / 2, 11 * mm, f"paulzrm Hexo Blog - 第 {doc.page} 页")
    canvas.restoreState()


def code(text, styles):
    escaped = (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\n", "<br/>")
    )
    return Table(
        [[Paragraph(escaped, styles["CodeCN"])]],
        colWidths=[166 * mm],
        style=TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F3F5F7")),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#D8DEE4")),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ]
        ),
    )


def bullet(text, styles):
    return Paragraph(f"• {text}", styles["BulletCN"])


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    pdfmetrics.registerFont(TTFont("MicrosoftYaHei", str(FONT)))

    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            "TitleCN",
            fontName="MicrosoftYaHei",
            fontSize=25,
            leading=35,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#1F2937"),
            spaceAfter=12,
        )
    )
    styles.add(
        ParagraphStyle(
            "SubtitleCN",
            fontName="MicrosoftYaHei",
            fontSize=12,
            leading=20,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#64748B"),
        )
    )
    styles.add(
        ParagraphStyle(
            "H1CN",
            fontName="MicrosoftYaHei",
            fontSize=18,
            leading=26,
            textColor=colors.HexColor("#0F766E"),
            spaceBefore=6,
            spaceAfter=10,
        )
    )
    styles.add(
        ParagraphStyle(
            "H2CN",
            fontName="MicrosoftYaHei",
            fontSize=13,
            leading=20,
            textColor=colors.HexColor("#1F2937"),
            spaceBefore=10,
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            "BodyCN",
            fontName="MicrosoftYaHei",
            fontSize=10.5,
            leading=18,
            textColor=colors.HexColor("#334155"),
            spaceAfter=7,
        )
    )
    styles.add(
        ParagraphStyle(
            "BulletCN",
            fontName="MicrosoftYaHei",
            fontSize=10.5,
            leading=18,
            leftIndent=10,
            firstLineIndent=-10,
            textColor=colors.HexColor("#334155"),
            spaceAfter=4,
        )
    )
    styles.add(
        ParagraphStyle(
            "CodeCN",
            fontName="MicrosoftYaHei",
            fontSize=9,
            leading=15,
            textColor=colors.HexColor("#111827"),
        )
    )

    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        leftMargin=22 * mm,
        rightMargin=22 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
        title="Hexo 博客使用手册",
        author="Codex",
    )
    story = [
        Spacer(1, 42 * mm),
        Paragraph("Hexo 博客使用手册", styles["TitleCN"]),
        Paragraph("paulzrm.github.io - Windows 本地维护与 GitHub Pages 部署", styles["SubtitleCN"]),
        Spacer(1, 18 * mm),
        Paragraph(
            "项目目录：E:\\WinSetting\\Desktop\\HomePage\\Hexo Blog",
            styles["SubtitleCN"],
        ),
        Spacer(1, 7 * mm),
        Paragraph(
            "本手册覆盖日常写作、预览、发布、洛谷题解同步和常见故障。"
            "仓库使用 hexo-source 保存源文件，main 保存生成后的网页。",
            styles["BodyCN"],
        ),
        PageBreak(),
        Paragraph("1. 环境与首次启动", styles["H1CN"]),
        Paragraph("需要的软件", styles["H2CN"]),
        bullet("Node.js LTS：从 nodejs.org 下载并安装。当前项目已使用 Node.js 24 LTS。", styles),
        bullet("Git：用于提交和推送到 GitHub。", styles),
        bullet("任意文本编辑器：推荐 VS Code。", styles),
        Paragraph("打开 PowerShell，进入博客目录：", styles["BodyCN"]),
        code('cd "E:\\WinSetting\\Desktop\\HomePage\\Hexo Blog"', styles),
        Spacer(1, 4 * mm),
        Paragraph("换电脑后第一次使用时安装依赖：", styles["BodyCN"]),
        code("npm install", styles),
        Paragraph("启动本地预览：", styles["BodyCN"]),
        code("npm run dev", styles),
        Paragraph(
            "浏览器打开 http://localhost:4000。修改文章后通常会自动刷新；停止服务按 Ctrl+C。",
            styles["BodyCN"],
        ),
        PageBreak(),
        Paragraph("2. 写文章与管理内容", styles["H1CN"]),
        Paragraph("新建文章", styles["H2CN"]),
        code('npx hexo new "文章标题"', styles),
        Paragraph(
            "新文件会出现在 source/_posts。也可以直接复制现有 Markdown 文件。",
            styles["BodyCN"],
        ),
        Paragraph("推荐的文章头部：", styles["H2CN"]),
        code(
            "---\n"
            'title: "P1000 超级玛丽游戏 题解"\n'
            "date: 2026-06-22 12:00:00\n"
            "categories:\n"
            "  - 题解\n"
            "tags:\n"
            "  - 题解\n"
            "---\n\n"
            "这里开始写正文。",
            styles,
        ),
        Paragraph("图片规则", styles["H2CN"]),
        bullet("本地图片放在 source/images/posts，再用 /images/posts/文件名.png 引用。", styles),
        bullet("不要引用已经失效的外部图床；发布前检查图片是否能打开。", styles),
        bullet("不要把密码、Token、client_secret 或私钥写进文章和配置。", styles),
        PageBreak(),
        Paragraph("3. 构建与发布", styles["H1CN"]),
        Paragraph("发布前检查", styles["H2CN"]),
        code("npm run clean\nnpm run build", styles),
        Paragraph(
            "构建成功后，public 目录包含将要发布的静态网页。先用 npm run dev 本地检查首页、"
            "新文章、公式、代码块和图片。",
            styles["BodyCN"],
        ),
        Paragraph("提交源文件", styles["H2CN"]),
        code(
            "git status\n"
            "git add .\n"
            'git commit -m "更新博客文章"\n'
            "git push origin hexo-source",
            styles,
        ),
        Paragraph("部署 GitHub Pages", styles["H2CN"]),
        code("npm run deploy", styles),
        Paragraph(
            "部署命令会把 public 推送到 main 分支。等待 GitHub Pages 完成发布后访问 "
            "https://paulzrm.github.io。",
            styles["BodyCN"],
        ),
        Paragraph(
            "如果 GitHub 要求登录，推荐使用 SSH Key；不要在仓库中保存 GitHub 密码或 Token。",
            styles["BodyCN"],
        ),
        PageBreak(),
        Paragraph("4. 洛谷题解同步", styles["H1CN"]),
        Paragraph(
            "本项目已导入 52 篇洛谷推荐题解，并统一为“题号 题目名称 题解”。"
            "导入工具位于 tools/import_luogu_solutions.py。",
            styles["BodyCN"],
        ),
        Paragraph("重新执行导入：", styles["H2CN"]),
        code("python tools/import_luogu_solutions.py", styles),
        bullet("工具只读取脚本内登记的文章 ID，不会修改洛谷账号或原文。", styles),
        bullet("同题文章会写入同一个规范文件名，避免博客中重复出现。", styles),
        bullet("每篇文章保留洛谷原文链接、发布日期、分类和标签。", styles),
        Paragraph("常见故障", styles["H2CN"]),
        bullet("hexo 不是命令：先运行 npm install，再使用 npm run dev/npm run build。", styles),
        bullet("端口 4000 被占用：停止旧的 Hexo 服务，或运行 npx hexo server -p 4001。", styles),
        bullet("Git 推送失败：运行 ssh -T git@github.com 检查 SSH 登录。", styles),
        bullet("网页未更新：确认 main 分支部署成功，并等待 GitHub Pages 缓存刷新。", styles),
        bullet("构建异常：先运行 npm run clean，再重新运行 npm run build。", styles),
        Spacer(1, 8 * mm),
        Paragraph(
            "最常用流程：进入目录 -> 写 Markdown -> npm run dev 预览 -> "
            "npm run clean && npm run build -> 提交 hexo-source -> npm run deploy。",
            styles["BodyCN"],
        ),
    ]

    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print(OUTPUT)


if __name__ == "__main__":
    main()
